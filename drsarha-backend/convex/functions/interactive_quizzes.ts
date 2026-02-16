import { query, mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { interactiveQuizDoc, interactiveQuizFields } from "../models/interactiveQuiz";
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
    items: v.array(interactiveQuizDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { nozology, search, page = 1, limit = 10, forcePublish, app_visible }) => {
    const from = (page - 1) * limit;
    const now = Date.now();
    
    const candidates = nozology
      ? await (db as any).query("interactive_quizzes").withIndex("by_nozology", (q: any) => q.eq("nozology", nozology)).collect()
      : await db.query("interactive_quizzes").collect();
    
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
  args: { id: v.id("interactive_quizzes") },
  returns: v.union(interactiveQuizDoc, v.null()),
  handler: async ({ db }, { id }) => db.get(id),
});

export const insert = mutation({
  args: v.object(interactiveQuizFields),
  returns: interactiveQuizDoc,
  handler: async ({ db }, data) => {
    const id = await db.insert("interactive_quizzes", data as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const update = mutation({
  args: {
    id: v.id("interactive_quizzes"),
    data: v.object({
      name: v.optional(v.string()),
      cover_image: v.optional(v.string()),
      questions: v.optional(v.array(v.any())),
      available_errors: v.optional(v.number()),
      feedback: v.optional(v.any()),
      nozology: v.optional(v.string()),
      stars: v.optional(v.number()),
      correct_answer_comment: v.optional(v.union(v.string(), v.null())),
      publishAfter: v.optional(v.number()),
      app_visible: v.optional(v.boolean()),
      references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
    }),
  },
  returns: interactiveQuizDoc,
  handler: async ({ db }, { id, data }) => {
    await db.patch(id, data as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const remove = mutation({
  args: { id: v.id("interactive_quizzes") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => { await db.delete(id); return true; },
});

export const create = action({
  args: {
    name: v.string(),
    cover: v.object({ base64: v.string(), contentType: v.string() }),
    questions: v.array(v.any()),
    available_errors: v.number(),
    feedback: v.any(),
    nozology: v.string(),
    stars: v.number(),
    correct_answer_comment: v.optional(v.string()),
    publishAfter: v.optional(v.number()),
    app_visible: v.optional(v.boolean()),
    references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
  },
  returns: interactiveQuizDoc,
  handler: async (ctx, args) => {
    const cover_image = await ctx.runAction(internal.helpers.upload.uploadToS3, { file: args.cover, fileType: "images" });
    const created = await ctx.runMutation(api.functions.interactive_quizzes.insert, {
      name: args.name,
      cover_image,
      questions: args.questions,
      available_errors: args.available_errors,
      feedback: args.feedback,
      nozology: args.nozology,
      stars: args.stars,
      correct_answer_comment: args.correct_answer_comment,
      created_at: new Date().toISOString(),
      ...(args.publishAfter ? { publishAfter: args.publishAfter } : {}),
      ...(args.app_visible !== undefined ? { app_visible: args.app_visible } : {}),
      ...(args.references ? { references: args.references } : {}),
    } as any);
    return created;
  },
});

export const updateAction = action({
  args: {
    id: v.id("interactive_quizzes"),
    name: v.optional(v.string()),
    cover: v.optional(v.object({ base64: v.string(), contentType: v.string() })),
    questions: v.optional(v.array(v.any())),
    available_errors: v.optional(v.number()),
    feedback: v.optional(v.any()),
    nozology: v.optional(v.string()),
    stars: v.optional(v.number()),
    correct_answer_comment: v.optional(v.string()),
    publishAfter: v.optional(v.number()),
    app_visible: v.optional(v.boolean()),
    references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
  },
  returns: interactiveQuizDoc,
  handler: async (ctx, args) => {
    const data: any = {};
    if (args.name) data.name = args.name;
    if (args.questions) data.questions = args.questions;
    if (args.available_errors !== undefined) data.available_errors = args.available_errors;
    if (args.feedback) data.feedback = args.feedback;
    if (args.nozology) data.nozology = args.nozology;
    if (args.stars !== undefined) data.stars = args.stars;
    if (args.correct_answer_comment) data.correct_answer_comment = args.correct_answer_comment;
    if (args.publishAfter !== undefined) data.publishAfter = args.publishAfter;
    if (args.app_visible !== undefined) data.app_visible = args.app_visible;
    if (args.references !== undefined) data.references = args.references;
    if (args.cover) data.cover_image = await ctx.runAction(internal.helpers.upload.uploadToS3, { file: args.cover, fileType: "images" });
    const updated = await ctx.runMutation(api.functions.interactive_quizzes.update, { id: args.id, data });
    return updated;
  },
});


