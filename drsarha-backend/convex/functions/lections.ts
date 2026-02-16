import { query, mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { lectionDoc } from "../models/lection";
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
    items: v.array(lectionDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { nozology, search, page = 1, limit = 10, forcePublish, app_visible }) => {
    const from = (page - 1) * limit;
    const now = Date.now();
    
    const candidates = nozology
      ? await (db as any).query("lections").withIndex("by_nozology", (q: any) => q.eq("nozology", nozology)).collect()
      : await db.query("lections").collect();
    
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
  args: { id: v.id("lections") },
  returns: v.union(lectionDoc, v.null()),
  handler: async ({ db }, { id }) => db.get(id),
});

export const insert = mutation({
  args: v.object({
    name: v.string(),
    cover_image: v.string(),
    video: v.string(),
    description: v.string(),
    duration: v.string(),
    stars: v.number(),
    feedback: v.any(),
    nozology: v.string(),
    publishAfter: v.optional(v.number()),
    app_visible: v.optional(v.boolean()),
    references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
  }),
  returns: lectionDoc,
  handler: async ({ db }, args) => {
    const id = await db.insert("lections", args as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const update = mutation({
  args: {
    id: v.id("lections"),
    data: v.object({
      name: v.optional(v.string()),
      cover_image: v.optional(v.string()),
      video: v.optional(v.string()),
      description: v.optional(v.string()),
      duration: v.optional(v.string()),
      stars: v.optional(v.number()),
      feedback: v.optional(v.any()),
      nozology: v.optional(v.string()),
      publishAfter: v.optional(v.number()),
      app_visible: v.optional(v.boolean()),
      references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
    }),
  },
  returns: lectionDoc,
  handler: async ({ db }, { id, data }) => {
    await db.patch(id, data as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const remove = mutation({
  args: { id: v.id("lections") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => { await db.delete(id); return true; },
});

export const create = action({
  args: {
    name: v.string(),
    cover: v.object({ base64: v.string(), contentType: v.string() }),
    video: v.object({ base64: v.string(), contentType: v.string() }),
    description: v.string(),
    duration: v.string(),
    stars: v.number(),
    feedback: v.any(),
    nozology: v.string(),
    publishAfter: v.optional(v.number()),
    app_visible: v.optional(v.boolean()),
    references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
  },
  returns: lectionDoc,
  handler: async (ctx, args) => {
    const cover_image = await ctx.runAction(internal.helpers.upload.uploadToS3, { file: args.cover, fileType: "images" });
    const video = await ctx.runAction(internal.helpers.upload.uploadToS3, { file: args.video, fileType: "video" });
    const created = await ctx.runMutation(api.functions.lections.insert, {
      name: args.name,
      cover_image,
      video,
      description: args.description,
      duration: args.duration,
      stars: args.stars,
      feedback: args.feedback,
      nozology: args.nozology,
      ...(args.publishAfter ? { publishAfter: args.publishAfter } : {}),
      ...(args.app_visible !== undefined ? { app_visible: args.app_visible } : {}),
      ...(args.references ? { references: args.references } : {}),
    });
    return created;
  },
});

export const updateAction = action({
  args: {
    id: v.id("lections"),
    name: v.optional(v.string()),
    cover: v.optional(v.object({ base64: v.string(), contentType: v.string() })),
    video: v.optional(v.object({ base64: v.string(), contentType: v.string() })),
    description: v.optional(v.string()),
    duration: v.optional(v.string()),
    stars: v.optional(v.number()),
    feedback: v.optional(v.any()),
    nozology: v.optional(v.string()),
    publishAfter: v.optional(v.number()),
    app_visible: v.optional(v.boolean()),
    references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
  },
  returns: lectionDoc,
  handler: async (ctx, args) => {
    const data: any = {};
    if (args.name) data.name = args.name;
    if (args.description) data.description = args.description;
    if (args.duration) data.duration = args.duration;
    if (args.stars !== undefined) data.stars = args.stars;
    if (args.feedback) data.feedback = args.feedback;
    if (args.nozology) data.nozology = args.nozology;
    if (args.publishAfter !== undefined) data.publishAfter = args.publishAfter;
    if (args.app_visible !== undefined) data.app_visible = args.app_visible;
    if (args.references !== undefined) data.references = args.references;
    if (args.cover) data.cover_image = await ctx.runAction(internal.helpers.upload.uploadToS3, { file: args.cover, fileType: "images" });
    if (args.video) data.video = await ctx.runAction(internal.helpers.upload.uploadToS3, { file: args.video, fileType: "video" });
    const updated = await ctx.runMutation(api.functions.lections.update, { id: args.id, data });
    return updated;
  },
});


