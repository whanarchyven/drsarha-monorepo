import { query, mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { interactiveTaskDoc, interactiveTaskFields } from "../models/interactiveTask";
import { api, internal } from "../_generated/api";

export const list = query({
  args: {
    nozology: v.optional(v.string()),
    search: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    forcePublish: v.optional(v.boolean()),
    app_visible: v.optional(v.boolean()),
  },
  returns: v.object({
    items: v.array(interactiveTaskDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { nozology, search, page = 1, limit = 10, forcePublish, app_visible }) => {
    const from = (page - 1) * limit;
    const now = Date.now();
    
    const candidates = nozology
      ? await (db as any).query("interactive_tasks").withIndex("by_nozology", (q: any) => q.eq("nozology", nozology)).collect()
      : await db.query("interactive_tasks").collect();
    
    // Фильтрация по publishAfter, если forcePublish не установлен
    let filtered = forcePublish 
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
    
    const total = filtered.length;
    const items = filtered.slice(from, from + limit);
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

export const create = action({
  args: {
    name: v.string(),
    difficulty: v.number(),
    cover: v.object({ base64: v.string(), contentType: v.string() }),
    answers: v.array(v.object({ key: v.string(), answer: v.string() })),
    available_errors: v.number(),
    feedback: v.any(),
    nozology: v.string(),
    stars: v.number(),
    publishAfter: v.optional(v.number()),
    app_visible: v.optional(v.boolean()),
    references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
  },
  returns: interactiveTaskDoc,
  handler: async (ctx, args) => {
    const cover_image = await ctx.runAction(internal.helpers.upload.uploadToS3, { file: args.cover, fileType: "images" });

    // upload dynamic answer images
    const processedAnswers = await Promise.all(
      args.answers.map(async (rec) => {
        const fileKey = rec.key; // фронт должен отправить key, соответствующий имени поля
        const fileArg = (ctx as any).args?.[fileKey];
        if (!fileArg) return { image: fileKey, answer: rec.answer }; // если уже путь
        const image = await ctx.runAction(internal.helpers.upload.uploadToS3, { file: fileArg, fileType: "images" });
        return { image, answer: rec.answer };
      })
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
      ...(args.publishAfter ? { publishAfter: args.publishAfter } : {}),
      ...(args.app_visible !== undefined ? { app_visible: args.app_visible } : {}),
      ...(args.references ? { references: args.references } : {}),
    } as any);
    return created;
  },
});


