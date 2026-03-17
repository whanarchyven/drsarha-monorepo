import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { markupTaskStageDoc, markupTaskStageFields } from "../models/markupTaskStage";

const sortByOrderAsc = (items: any[]) =>
  items.slice().sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return (a._creationTime ?? 0) - (b._creationTime ?? 0);
  });

export const listByTask = query({
  args: {
    markup_task_id: v.union(v.id("markup_tasks"), v.string()),
  },
  returns: v.array(markupTaskStageDoc),
  handler: async ({ db }, { markup_task_id }) => {
    const items = await db
      .query("markup_task_stages")
      .withIndex("by_markup_task", (q) => q.eq("markup_task_id", markup_task_id))
      .collect();

    return sortByOrderAsc(items);
  },
});

export const getById = query({
  args: { id: v.id("markup_task_stages") },
  returns: v.union(markupTaskStageDoc, v.null()),
  handler: async ({ db }, { id }) => db.get(id),
});

export const insert = mutation({
  args: v.object(markupTaskStageFields),
  returns: markupTaskStageDoc,
  handler: async ({ db }, data) => {
    const id = await db.insert("markup_task_stages", data as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const update = mutation({
  args: {
    id: v.id("markup_task_stages"),
    data: v.object({
      markup_task_id: v.optional(v.union(v.id("markup_tasks"), v.string())),
      name: v.optional(v.string()),
      additional_info: v.optional(v.string()),
      description: v.optional(v.string()),
      task_condition: v.optional(v.string()),
      element_name: v.optional(v.string()),
      base_color: v.optional(v.string()),
      info: v.optional(v.string()),
      order: v.optional(v.number()),
      mongoId: v.optional(v.string()),
    }),
  },
  returns: markupTaskStageDoc,
  handler: async ({ db }, { id, data }) => {
    await db.patch(id, data as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const remove = mutation({
  args: { id: v.id("markup_task_stages") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    const slides = await db
      .query("markup_task_slides")
      .withIndex("by_markup_task_stage", (q) => q.eq("markup_task_stage_id", id))
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

    await db.delete(id);
    return true;
  },
});
