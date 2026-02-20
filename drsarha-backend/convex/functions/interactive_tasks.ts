import { query, mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { interactiveTaskDoc, interactiveTaskFields } from "../models/interactiveTask";
import { api, internal } from "../_generated/api";

const sortByIdx = (items: any[]) =>
  items.slice().sort((a, b) => {
    const aIdx = a.idx;
    const bIdx = b.idx;
    if (aIdx === undefined && bIdx === undefined) {
      return (a._creationTime ?? 0) - (b._creationTime ?? 0);
    }
    if (aIdx === undefined) return 1;
    if (bIdx === undefined) return -1;
    if (aIdx !== bIdx) return bIdx - aIdx;
    return (a._creationTime ?? 0) - (b._creationTime ?? 0);
  });

export const list = query({
  args: {
    nozology: v.optional(v.string()),
    search: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    forcePublish: v.optional(v.boolean()),
    app_visible: v.optional(v.boolean()),
    admin_id: v.optional(v.string()),
  },
  returns: v.object({
    items: v.array(interactiveTaskDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { nozology, search, page = 1, limit = 10, forcePublish, app_visible, admin_id }) => {
    const from = (page - 1) * limit;
    const now = Date.now();
    const isAdmin = admin_id && admin_id === process.env.ADMIN_ID;
    const allowUnpublished = isAdmin && forcePublish !== false;
    
    const candidates = nozology
      ? await (db as any).query("interactive_tasks").withIndex("by_nozology", (q: any) => q.eq("nozology", nozology)).collect()
      : await db.query("interactive_tasks").collect();
    
    // Фильтрация по publishAfter, если forcePublish не установлен
    let filtered = allowUnpublished
      ? candidates 
      : candidates.filter((l: any) => {
          if (!l.publishAfter) return true; // Если publishAfter не установлен, показываем
          return l.publishAfter <= now; // Показываем только если дата публикации наступила
        });
    
    // Фильтрация по app_visible
    if (app_visible === true) {
      filtered = filtered.filter((l: any) => l.app_visible === true);
    }
    
    // Фильтрация по поиску
    if (search) {
      filtered = filtered.filter((l: any) => l.name.toLowerCase().includes(search.toLowerCase()));
    }
    
    const sorted = sortByIdx(filtered);
    const total = sorted.length;
    const items = sorted.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const getById = query({
  args: { id: v.id("interactive_tasks") },
  returns: v.union(interactiveTaskDoc, v.null()),
  handler: async ({ db }, { id }) => db.get(id),
});

export const insert = mutation({
  args: v.object(interactiveTaskFields),
  returns: interactiveTaskDoc,
  handler: async ({ db }, data) => {
    const id = await db.insert("interactive_tasks", data as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const update = mutation({
  args: {
    id: v.id("interactive_tasks"),
    data: v.object({
      name: v.optional(v.string()),
      difficulty: v.optional(v.number()),
      cover_image: v.optional(v.string()),
      answers: v.optional(v.array(v.object({ image: v.string(), answer: v.string() }))),
      available_errors: v.optional(v.number()),
      feedback: v.optional(v.any()),
      nozology: v.optional(v.string()),
      stars: v.optional(v.number()),
      description: v.optional(v.string()),
      idx: v.optional(v.number()),
      publishAfter: v.optional(v.number()),
      app_visible: v.optional(v.boolean()),
      references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
    }),
  },
  returns: interactiveTaskDoc,
  handler: async ({ db }, { id, data }) => {
    await db.patch(id, data as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const remove = mutation({
  args: { id: v.id("interactive_tasks") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => { await db.delete(id); return true; },
});

const fileValidator = v.object({ base64: v.string(), contentType: v.string() });
const answerImageValidator = v.union(v.string(), fileValidator);

const uploadAnswerImageIfNeeded = async (
  ctx: any,
  image: string | { base64: string; contentType: string } | undefined
) => {
  if (!image) return "";
  if (typeof image === "string") return image;
  return await ctx.runAction(internal.helpers.upload.uploadToS3, {
    file: image,
    fileType: "images",
  });
};

export const create = action({
  args: {
    name: v.string(),
    difficulty: v.number(),
    cover: fileValidator,
    answers: v.array(v.object({ image: answerImageValidator, answer: v.string() })),
    available_errors: v.number(),
    feedback: v.any(),
    nozology: v.string(),
    stars: v.number(),
    publishAfter: v.optional(v.number()),
    app_visible: v.optional(v.boolean()),
    references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
    idx: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  returns: interactiveTaskDoc,
  handler: async (ctx, args) => {
    const cover_image = await ctx.runAction(internal.helpers.upload.uploadToS3, {
      file: args.cover,
      fileType: "images",
    });

    const processedAnswers = await Promise.all(
      args.answers.map(async (rec) => ({
        image: await uploadAnswerImageIfNeeded(ctx, rec.image),
        answer: rec.answer,
      }))
    );

    const created = await ctx.runMutation(api.functions.interactive_tasks.insert, {
      name: args.name,
      difficulty: args.difficulty,
      cover_image,
      answers: processedAnswers as any,
      available_errors: args.available_errors,
      feedback: args.feedback,
      nozology: args.nozology,
      stars: args.stars,
      ...(args.description ? { description: args.description } : {}),
      ...(args.idx !== undefined ? { idx: args.idx } : {}),
      ...(args.publishAfter ? { publishAfter: args.publishAfter } : {}),
      ...(args.app_visible !== undefined ? { app_visible: args.app_visible } : {}),
      ...(args.references ? { references: args.references } : {}),
    } as any);
    return created;
  },
});

export const updateAction = action({
  args: {
    id: v.id("interactive_tasks"),
    name: v.optional(v.string()),
    difficulty: v.optional(v.number()),
    cover: v.optional(fileValidator),
    answers: v.optional(v.array(v.object({ image: answerImageValidator, answer: v.string() }))),
    available_errors: v.optional(v.number()),
    feedback: v.optional(v.any()),
    nozology: v.optional(v.string()),
    stars: v.optional(v.number()),
    publishAfter: v.optional(v.number()),
    app_visible: v.optional(v.boolean()),
    references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
    idx: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  returns: interactiveTaskDoc,
  handler: async (ctx, args) => {
    const data: Record<string, any> = {};
    if (args.name !== undefined) data.name = args.name;
    if (args.difficulty !== undefined) data.difficulty = args.difficulty;
    if (args.available_errors !== undefined) data.available_errors = args.available_errors;
    if (args.feedback !== undefined) data.feedback = args.feedback;
    if (args.nozology !== undefined) data.nozology = args.nozology;
    if (args.stars !== undefined) data.stars = args.stars;
    if (args.publishAfter !== undefined) data.publishAfter = args.publishAfter;
    if (args.app_visible !== undefined) data.app_visible = args.app_visible;
    if (args.references !== undefined) data.references = args.references;
    if (args.idx !== undefined) data.idx = args.idx;
    if (args.description !== undefined) data.description = args.description;

    if (args.cover) {
      data.cover_image = await ctx.runAction(internal.helpers.upload.uploadToS3, {
        file: args.cover,
        fileType: "images",
      });
    }

    if (args.answers) {
      data.answers = await Promise.all(
        args.answers.map(async (rec) => ({
          image: await uploadAnswerImageIfNeeded(ctx, rec.image),
          answer: rec.answer,
        }))
      );
    }

    const updated = await ctx.runMutation(api.functions.interactive_tasks.update, {
      id: args.id,
      data,
    });
    return updated;
  },
});


