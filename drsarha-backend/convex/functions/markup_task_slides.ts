import { action, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { markupTaskSlideDoc, markupTaskSlideFields } from "../models/markupTaskSlide";

const sortByOrderAsc = (items: any[]) =>
  items.slice().sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return (a._creationTime ?? 0) - (b._creationTime ?? 0);
  });

export const listByStage = query({
  args: {
    markup_task_stage_id: v.union(v.id("markup_task_stages"), v.string()),
  },
  returns: v.array(markupTaskSlideDoc),
  handler: async ({ db }, { markup_task_stage_id }) => {
    const items = await db
      .query("markup_task_slides")
      .withIndex("by_markup_task_stage", (q) => q.eq("markup_task_stage_id", markup_task_stage_id))
      .collect();

    return sortByOrderAsc(items);
  },
});

export const getById = query({
  args: { id: v.id("markup_task_slides") },
  returns: v.union(markupTaskSlideDoc, v.null()),
  handler: async ({ db }, { id }) => db.get(id),
});

export const insert = mutation({
  args: v.object(markupTaskSlideFields),
  returns: markupTaskSlideDoc,
  handler: async ({ db }, data) => {
    const id = await db.insert("markup_task_slides", data as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const update = mutation({
  args: {
    id: v.id("markup_task_slides"),
    data: v.object({
      markup_task_stage_id: v.optional(v.union(v.id("markup_task_stages"), v.string())),
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      image: v.optional(v.string()),
      base_height: v.optional(v.number()),
      original_width: v.optional(v.number()),
      original_height: v.optional(v.number()),
      order: v.optional(v.number()),
      mongoId: v.optional(v.string()),
    }),
  },
  returns: markupTaskSlideDoc,
  handler: async ({ db }, { id, data }) => {
    await db.patch(id, data as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const remove = mutation({
  args: { id: v.id("markup_task_slides") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    const elements = await db
      .query("markup_task_elements")
      .withIndex("by_markup_task_slide", (q) => q.eq("markup_task_slide_id", id))
      .collect();

    for (const element of elements) {
      await db.delete(element._id);
    }

    await db.delete(id);
    return true;
  },
});

const fileValidator = v.object({ base64: v.string(), contentType: v.string() });
const fileOrPathValidator = v.union(v.string(), fileValidator);

const uploadImageIfNeeded = async (
  ctx: any,
  file: string | { base64: string; contentType: string }
) => {
  if (typeof file === "string") return file;
  return await ctx.runAction(internal.helpers.upload.uploadToS3, {
    file,
    fileType: "images",
  });
};

export const create = action({
  args: {
    markup_task_stage_id: v.union(v.id("markup_task_stages"), v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    image: fileOrPathValidator,
    base_height: v.optional(v.number()),
    original_width: v.optional(v.number()),
    original_height: v.optional(v.number()),
    order: v.number(),
  },
  returns: markupTaskSlideDoc,
  handler: async (ctx, args) => {
    const image = await uploadImageIfNeeded(ctx, args.image);

    return await ctx.runMutation(api.functions.markup_task_slides.insert, {
      markup_task_stage_id: args.markup_task_stage_id,
      name: args.name,
      image,
      base_height: args.base_height ?? 512,
      order: args.order,
      ...(args.description !== undefined ? { description: args.description } : {}),
      ...(args.original_width !== undefined ? { original_width: args.original_width } : {}),
      ...(args.original_height !== undefined ? { original_height: args.original_height } : {}),
    });
  },
});

export const updateAction = action({
  args: {
    id: v.id("markup_task_slides"),
    markup_task_stage_id: v.optional(v.union(v.id("markup_task_stages"), v.string())),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(fileOrPathValidator),
    base_height: v.optional(v.number()),
    original_width: v.optional(v.number()),
    original_height: v.optional(v.number()),
    order: v.optional(v.number()),
  },
  returns: markupTaskSlideDoc,
  handler: async (ctx, args) => {
    const data: Record<string, any> = {};

    if (args.markup_task_stage_id !== undefined) data.markup_task_stage_id = args.markup_task_stage_id;
    if (args.name !== undefined) data.name = args.name;
    if (args.description !== undefined) data.description = args.description;
    if (args.base_height !== undefined) data.base_height = args.base_height;
    if (args.original_width !== undefined) data.original_width = args.original_width;
    if (args.original_height !== undefined) data.original_height = args.original_height;
    if (args.order !== undefined) data.order = args.order;
    if (args.image !== undefined) {
      data.image = await uploadImageIfNeeded(ctx, args.image);
    }

    return await ctx.runMutation(api.functions.markup_task_slides.update, {
      id: args.id,
      data,
    });
  },
});
