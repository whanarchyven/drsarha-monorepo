import { query, mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { lectionDoc } from "../models/lection";
import { api, internal } from "../_generated/api";

const sortByIdx = <T extends { idx?: number; _creationTime?: number }>(items: T[]) =>
  items.slice().sort((a, b) => {
    const aIdx = a.idx;
    const bIdx = b.idx;
    if (aIdx === undefined && bIdx === undefined) {
      return (a._creationTime ?? 0) - (b._creationTime ?? 0);
    }
    if (aIdx === undefined) return 1;
    if (bIdx === undefined) return -1;
    if (aIdx !== bIdx) return aIdx - bIdx;
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
    items: v.array(lectionDoc),
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
      ? await (db as any).query("lections").withIndex("by_nozology", (q: any) => q.eq("nozology", nozology)).collect()
      : await db.query("lections").collect();
    
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
    idx: v.optional(v.number()),
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
      idx: v.optional(v.number()),
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
    video: v.optional(v.object({ base64: v.string(), contentType: v.string() })),
    idx: v.optional(v.number()),
    videoPath: v.optional(v.string()),
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
    let video: string | undefined = args.videoPath;
    if (!video && args.video) {
      video = await ctx.runAction(internal.helpers.upload.uploadToS3, { file: args.video, fileType: "video" });
    }
    if (!video) {
      throw new Error("Video is required");
    }
    const created = await ctx.runMutation(api.functions.lections.insert, {
      name: args.name,
      cover_image,
      video,
      description: args.description,
      duration: args.duration,
      stars: args.stars,
      feedback: args.feedback,
      nozology: args.nozology,
      ...(args.idx !== undefined ? { idx: args.idx } : {}),
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
    idx: v.optional(v.number()),
    videoPath: v.optional(v.string()),
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
    console.log("[lections.updateAction] start", {
      id: args.id,
      hasCover: Boolean(args.cover),
      hasVideo: Boolean(args.video),
      coverType: args.cover?.contentType,
      videoType: args.video?.contentType,
      coverSize: args.cover?.base64?.length,
      videoSize: args.video?.base64?.length,
    });
    const data: any = {};
    if (args.name) data.name = args.name;
    if (args.description) data.description = args.description;
    if (args.duration) data.duration = args.duration;
    if (args.stars !== undefined) data.stars = args.stars;
    if (args.feedback) data.feedback = args.feedback;
    if (args.nozology) data.nozology = args.nozology;
    if (args.publishAfter !== undefined) data.publishAfter = args.publishAfter;
    if (args.app_visible !== undefined) data.app_visible = args.app_visible;
    if (args.idx !== undefined) data.idx = args.idx;
    if (args.references !== undefined) data.references = args.references;
    if (args.cover) {
      console.log("[lections.updateAction] uploading cover");
      data.cover_image = await ctx.runAction(internal.helpers.upload.uploadToS3, {
        file: args.cover,
        fileType: "images",
      });
      console.log("[lections.updateAction] cover uploaded", data.cover_image);
    }
    if (args.videoPath) {
      data.video = args.videoPath;
    }
    if (args.video) {
      console.log("[lections.updateAction] uploading video");
      data.video = await ctx.runAction(internal.helpers.upload.uploadToS3, {
        file: args.video,
        fileType: "video",
      });
      console.log("[lections.updateAction] video uploaded", data.video);
    }
    const updated = await ctx.runMutation(api.functions.lections.update, { id: args.id, data });
    console.log("[lections.updateAction] updated", updated?._id);
    return updated;
  },
});


