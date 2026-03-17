import { action, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import {
  markupTaskAdditionalTaskFields,
  markupTaskDoc,
  markupTaskFields,
} from "../models/markupTask";

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

const sortByOrderAsc = (items: any[]) =>
  items.slice().sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return (a._creationTime ?? 0) - (b._creationTime ?? 0);
  });

export const list = query({
  args: {
    search: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    forcePublish: v.optional(v.boolean()),
    app_visible: v.optional(v.boolean()),
    admin_id: v.optional(v.string()),
  },
  returns: v.object({
    items: v.array(markupTaskDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { search, page = 1, limit = 10, forcePublish, app_visible, admin_id }) => {
    const from = (page - 1) * limit;
    const now = Date.now();
    const isAdmin = admin_id && admin_id === process.env.ADMIN_ID;
    const allowUnpublished = isAdmin && forcePublish !== false;

    const candidates = await db.query("markup_tasks").collect();

    let filtered = allowUnpublished
      ? candidates
      : candidates.filter((task: any) => {
          if (!task.publishAfter) return true;
          return task.publishAfter <= now;
        });

    if (app_visible === true) {
      filtered = filtered.filter((task: any) => task.app_visible === true);
    }

    if (search) {
      filtered = filtered.filter((task: any) =>
        task.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const sorted = sortByIdx(filtered);
    const total = sorted.length;
    const items = sorted.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const getById = query({
  args: { id: v.id("markup_tasks") },
  returns: v.union(markupTaskDoc, v.null()),
  handler: async ({ db }, { id }) => db.get(id),
});

export const getFullById = query({
  args: { id: v.id("markup_tasks") },
  returns: v.any(),
  handler: async ({ db }, { id }) => {
    const task = await db.get(id);
    if (!task) return null;

    const stages = sortByOrderAsc(
      await db
        .query("markup_task_stages")
        .withIndex("by_markup_task", (q) => q.eq("markup_task_id", id))
        .collect()
    );

    const stagesWithSlides = await Promise.all(
      stages.map(async (stage) => {
        const slides = sortByOrderAsc(
          await db
            .query("markup_task_slides")
            .withIndex("by_markup_task_stage", (q) => q.eq("markup_task_stage_id", stage._id))
            .collect()
        );

        const slidesWithElements = await Promise.all(
          slides.map(async (slide) => {
            const elements = sortByOrderAsc(
              await db
                .query("markup_task_elements")
                .withIndex("by_markup_task_slide", (q) => q.eq("markup_task_slide_id", slide._id))
                .collect()
            );

            return {
              ...slide,
              elements,
            };
          })
        );

        return {
          ...stage,
          slides: slidesWithElements,
        };
      })
    );

    return {
      ...task,
      stages: stagesWithSlides,
    };
  },
});

export const insert = mutation({
  args: v.object(markupTaskFields),
  returns: markupTaskDoc,
  handler: async ({ db }, data) => {
    const id = await db.insert("markup_tasks", data as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const update = mutation({
  args: {
    id: v.id("markup_tasks"),
    data: v.object({
      name: v.optional(v.string()),
      cover_image: v.optional(v.string()),
      description: v.optional(v.string()),
      additional_tasks: v.optional(v.array(markupTaskAdditionalTaskFields)),
      idx: v.optional(v.number()),
      app_visible: v.optional(v.boolean()),
      publishAfter: v.optional(v.number()),
      mongoId: v.optional(v.string()),
    }),
  },
  returns: markupTaskDoc,
  handler: async ({ db }, { id, data }) => {
    await db.patch(id, data as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const remove = mutation({
  args: { id: v.id("markup_tasks") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    const stages = await db
      .query("markup_task_stages")
      .withIndex("by_markup_task", (q) => q.eq("markup_task_id", id))
      .collect();

    for (const stage of stages) {
      const slides = await db
        .query("markup_task_slides")
        .withIndex("by_markup_task_stage", (q) => q.eq("markup_task_stage_id", stage._id))
        .collect();

      for (const slide of slides) {
        const elements = await db
          .query("markup_task_elements")
          .withIndex("by_markup_task_slide", (q) => q.eq("markup_task_slide_id", slide._id))
          .collect();

        for (const element of elements) {
          await db.delete(element._id);
        }

        await db.delete(slide._id);
      }

      await db.delete(stage._id);
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
    name: v.string(),
    cover: fileOrPathValidator,
    description: v.string(),
    additional_tasks: v.array(markupTaskAdditionalTaskFields),
    idx: v.optional(v.number()),
    app_visible: v.optional(v.boolean()),
    publishAfter: v.optional(v.number()),
  },
  returns: markupTaskDoc,
  handler: async (ctx, args) => {
    const cover_image = await uploadImageIfNeeded(ctx, args.cover);

    return await ctx.runMutation(api.functions.markup_tasks.insert, {
      name: args.name,
      cover_image,
      description: args.description,
      additional_tasks: args.additional_tasks,
      ...(args.idx !== undefined ? { idx: args.idx } : {}),
      ...(args.app_visible !== undefined ? { app_visible: args.app_visible } : {}),
      ...(args.publishAfter !== undefined ? { publishAfter: args.publishAfter } : {}),
    });
  },
});

export const updateAction = action({
  args: {
    id: v.id("markup_tasks"),
    name: v.optional(v.string()),
    cover: v.optional(fileOrPathValidator),
    description: v.optional(v.string()),
    additional_tasks: v.optional(v.array(markupTaskAdditionalTaskFields)),
    idx: v.optional(v.number()),
    app_visible: v.optional(v.boolean()),
    publishAfter: v.optional(v.number()),
  },
  returns: markupTaskDoc,
  handler: async (ctx, args) => {
    const data: Record<string, any> = {};

    if (args.name !== undefined) data.name = args.name;
    if (args.description !== undefined) data.description = args.description;
    if (args.additional_tasks !== undefined) data.additional_tasks = args.additional_tasks;
    if (args.idx !== undefined) data.idx = args.idx;
    if (args.app_visible !== undefined) data.app_visible = args.app_visible;
    if (args.publishAfter !== undefined) data.publishAfter = args.publishAfter;
    if (args.cover !== undefined) {
      data.cover_image = await uploadImageIfNeeded(ctx, args.cover);
    }

    return await ctx.runMutation(api.functions.markup_tasks.update, {
      id: args.id,
      data,
    });
  },
});
