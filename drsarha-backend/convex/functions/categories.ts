import { query, mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { categoryDoc, categoryFields } from "../models/category";
import { api, internal } from "../_generated/api";

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      ...categoryFields,
      _id: v.id("categories"),
      _creationTime: v.number(),
      nozologiesCount: v.number(),
    })
  ),
  handler: async ({ db }) => {
    const categories = await db.query("categories").collect();
    return await Promise.all(
      categories.map(async (category) => {
        const byId = await (db as any)
          .query("nozologies")
          .withIndex("by_category", (q: any) => q.eq("category_id", category._id))
          .collect();
        const byMongoId = category.mongoId
          ? await (db as any)
              .query("nozologies")
              .withIndex("by_category", (q: any) => q.eq("category_id", category.mongoId))
              .collect()
          : [];

        const uniqueNozologies = new Map<string, any>();
        for (const item of [...byId, ...byMongoId]) {
          uniqueNozologies.set(item._id, item);
        }

        return {
          ...category,
          nozologiesCount: uniqueNozologies.size,
        };
      })
    );
  },
});

export const getById = query({
  args: { id: v.id("categories") },
  returns: v.union(categoryDoc, v.null()),
  handler: async ({ db }, { id }) => {
    return await db.get(id);
  },
});

export const insert = mutation({
  args: v.object({
    name: v.string(),
    cover_image: v.optional(v.string()),
    description: v.optional(v.string()),
  }),
  returns: categoryDoc,
  handler: async ({ db }, args) => {
    const id = await db.insert("categories", args as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    data: v.object({
      name: v.optional(v.string()),
      cover_image: v.optional(v.string()),
      description: v.optional(v.string()),
    }),
  },
  returns: categoryDoc,
  handler: async ({ db }, { id, data }) => {
    await db.patch(id, data as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return true;
  },
});

// create with file
export const create = action({
  args: {
    name: v.string(),
    cover: v.optional(v.object({ base64: v.string(), contentType: v.string() })),
    description: v.optional(v.string()),
  },
  returns: categoryDoc,
  handler: async (ctx, args) => {
    let coverPath: string | undefined;
    if (args.cover) {
      coverPath = await ctx.runAction(internal.helpers.upload.uploadToS3, {
        file: args.cover,
        fileType: "images",
      });
    }
    const created = await ctx.runMutation(api.functions.categories.insert, {
      name: args.name,
      cover_image: coverPath,
      description: args.description,
    });
    return created;
  },
});

// update with optional file
export const updateAction = action({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    cover: v.optional(v.object({ base64: v.string(), contentType: v.string() })),
  },
  returns: categoryDoc,
  handler: async (ctx, args) => {
    const data: { name?: string; description?: string; cover_image?: string } = {};
    if (args.name) data.name = args.name;
    if (args.description) data.description = args.description;
    if (args.cover) {
      const coverPath = await ctx.runAction(internal.helpers.upload.uploadToS3, {
        file: args.cover,
        fileType: "images",
      });
      data.cover_image = coverPath;
    }
    const updated = await ctx.runMutation(api.functions.categories.update, { id: args.id, data });
    return updated;
  },
});


