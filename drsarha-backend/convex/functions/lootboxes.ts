import { query, mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { lootboxDoc, lootboxFields, lootboxItemFields } from "../models/lootbox";
import { api, internal } from "../_generated/api";

export const list = query({
  args: { search: v.optional(v.string()), page: v.optional(v.number()), limit: v.optional(v.number()) },
  returns: v.object({ items: v.array(lootboxDoc), total: v.number(), page: v.number(), totalPages: v.number(), hasMore: v.boolean() }),
  handler: async ({ db }, { search, page = 1, limit = 10 }) => {
    const all = await db.query("lootboxes").collect();
    const filtered = search ? all.filter(l => l.title.toLowerCase().includes(search.toLowerCase()) || l.description.toLowerCase().includes(search.toLowerCase())) : all;
    const total = filtered.length;
    const from = (page - 1) * limit;
    const items = filtered.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const getById = query({ args: { id: v.id("lootboxes") }, returns: v.union(lootboxDoc, v.null()), handler: async ({ db }, { id }) => db.get(id) });

export const insert = mutation({
  args: v.object(lootboxFields),
  returns: lootboxDoc,
  handler: async ({ db }, data) => {
    const itemsArray = Array.isArray(data.items) ? data.items : (data as any).items?.objectId ?? [];
    const totalChance = itemsArray.reduce((sum, i) => sum + i.chance, 0);
    if (Math.abs(totalChance - 1.0) > 0.001) throw new Error(`Сумма вероятностей должна равняться 1.0, получено: ${totalChance}`);
    const id = await db.insert("lootboxes", { ...data, items: itemsArray } as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const update = mutation({
  args: { id: v.id("lootboxes"), data: v.object({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    items: v.optional(v.array(lootboxItemFields)),
  }) },
  returns: lootboxDoc,
  handler: async ({ db }, { id, data }) => {
    if (data.items) {
      const itemsArray = Array.isArray(data.items) ? data.items : (data as any).items?.objectId ?? [];
      const totalChance = itemsArray.reduce((sum, i) => sum + i.chance, 0);
      if (Math.abs(totalChance - 1.0) > 0.001) throw new Error(`Сумма вероятностей должна равняться 1.0, получено: ${totalChance}`);
      (data as any).items = itemsArray;
    }
    await db.patch(id, data as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const remove = mutation({ args: { id: v.id("lootboxes") }, returns: v.boolean(), handler: async ({ db }, { id }) => { await db.delete(id); return true; } });

// Public action: upload to S3 and create lootbox
export const create = action({
  args: {
    title: v.string(),
    description: v.string(),
    image: v.object({ base64: v.string(), contentType: v.string() }),
    items: v.array(lootboxItemFields),
  },
  returns: lootboxDoc,
  handler: async (ctx, args) => {
    const imagePath = await ctx.runAction(internal.helpers.upload.uploadToS3, {
      file: args.image,
      fileType: "images",
    });

    const created = await ctx.runMutation(api.functions.lootboxes.insert, {
      title: args.title,
      description: args.description,
      image: imagePath,
      items: args.items,
    });
    return created;
  },
});

// Public action: optionally upload image and update lootbox
export const updateAction = action({
  args: {
    id: v.id("lootboxes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.object({ base64: v.string(), contentType: v.string() })),
    items: v.optional(v.array(lootboxItemFields)),
  },
  returns: lootboxDoc,
  handler: async (ctx, args) => {
    const data: {
      title?: string;
      description?: string;
      image?: string;
      items?: Array<any>;
    } = {};

    if (args.title) data.title = args.title;
    if (args.description) data.description = args.description;
    if (args.items) data.items = args.items as any;

    if (args.image) {
      const imagePath = await ctx.runAction(internal.helpers.upload.uploadToS3, {
        file: args.image,
        fileType: "images",
      });
      data.image = imagePath;
    }

    const updated = await ctx.runMutation(api.functions.lootboxes.update, {
      id: args.id,
      data,
    });
    return updated;
  },
});


