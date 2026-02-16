import { query, mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { prizeDoc, prizeFields } from "../models/prize";
import { api, internal } from "../_generated/api";

export const list = query({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    level: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  returns: v.object({
    items: v.array(prizeDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { page = 1, limit = 10, level, search }) => {
    let candidates = await db.query("prizes").collect();
    if (typeof level === "number") candidates = candidates.filter(p => p.level === level);
    if (search) {
      const s = search.toLowerCase();
      candidates = candidates.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    const total = candidates.length;
    const from = (page - 1) * limit;
    const items = candidates.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const getById = query({
  args: { id: v.id("prizes") },
  returns: v.union(prizeDoc, v.null()),
  handler: async ({ db }, { id }) => db.get(id),
});

export const getByLevel = query({
  args: { level: v.number() },
  returns: v.array(prizeDoc),
  handler: async ({ db }, { level }) => {
    const all = await (db as any).query("prizes").withIndex("by_level", (q: any) => q.eq("level", level)).collect();
    return all;
  },
});

export const insert = mutation({
  args: v.object(prizeFields),
  returns: prizeDoc,
  handler: async ({ db }, data) => {
    const id = await db.insert("prizes", data);
    const doc = await db.get(id);
    return doc!;
  },
});

export const update = mutation({
  args: {
    id: v.id("prizes"),
    data: v.object({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      description: v.optional(v.string()),
      level: v.optional(v.number()),
      price: v.optional(v.number()),
    }),
  },
  returns: prizeDoc,
  handler: async ({ db }, { id, data }) => {
    await db.patch(id, data as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const remove = mutation({
  args: { id: v.id("prizes") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return true;
  },
});

// Public action: upload to S3 via Bun and create prize
export const create = action({
  args: {
    name: v.string(),
    image: v.object({ base64: v.string(), contentType: v.string() }),
    description: v.string(),
    level: v.number(),
    price: v.number(),
  },
  returns: prizeDoc,
  handler: async (ctx, args) => {
    const imagePath = await ctx.runAction(internal.helpers.upload.uploadToS3, {
      file: args.image,
      fileType: "images",
    });

    const created = await ctx.runMutation(api.functions.prizes.insert, {
      name: args.name,
      image: imagePath,
      description: args.description,
      level: args.level,
      price: args.price,
    });
    return created;
  },
});

// Public action: optionally upload file and update prize
export const updateAction = action({
  args: {
    id: v.id("prizes"),
    name: v.optional(v.string()),
    image: v.optional(v.object({ base64: v.string(), contentType: v.string() })),
    description: v.optional(v.string()),
    level: v.optional(v.number()),
    price: v.optional(v.number()),
  },
  returns: prizeDoc,
  handler: async (ctx, args) => {
    const data: {
      name?: string;
      image?: string;
      description?: string;
      level?: number;
      price?: number;
    } = {};

    if (args.name) data.name = args.name;
    if (args.description) data.description = args.description;
    if (args.level !== undefined) data.level = args.level;
    if (args.price !== undefined) data.price = args.price;

    if (args.image) {
      const imagePath = await ctx.runAction(internal.helpers.upload.uploadToS3, {
        file: args.image,
        fileType: "images",
      });
      data.image = imagePath;
    }

    const updated = await ctx.runMutation(api.functions.prizes.update, {
      id: args.id,
      data,
    });
    return updated;
  },
});
