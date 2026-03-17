import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import {
  markupTaskElementDoc,
  markupTaskElementFields,
  markupTaskGeometryValidator,
} from "../models/markupTaskElement";

const sortByOrderAsc = (items: any[]) =>
  items.slice().sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return (a._creationTime ?? 0) - (b._creationTime ?? 0);
  });

export const listBySlide = query({
  args: {
    markup_task_slide_id: v.union(v.id("markup_task_slides"), v.string()),
  },
  returns: v.array(markupTaskElementDoc),
  handler: async ({ db }, { markup_task_slide_id }) => {
    const items = await db
      .query("markup_task_elements")
      .withIndex("by_markup_task_slide", (q) => q.eq("markup_task_slide_id", markup_task_slide_id))
      .collect();

    return sortByOrderAsc(items);
  },
});

export const getById = query({
  args: { id: v.id("markup_task_elements") },
  returns: v.union(markupTaskElementDoc, v.null()),
  handler: async ({ db }, { id }) => db.get(id),
});

export const insert = mutation({
  args: v.object(markupTaskElementFields),
  returns: markupTaskElementDoc,
  handler: async ({ db }, data) => {
    const id = await db.insert("markup_task_elements", data as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const update = mutation({
  args: {
    id: v.id("markup_task_elements"),
    data: v.object({
      markup_task_slide_id: v.optional(v.union(v.id("markup_task_slides"), v.string())),
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      geometry: v.optional(markupTaskGeometryValidator),
      basis: v.optional(v.number()),
      fine: v.optional(v.number()),
      reward: v.optional(v.number()),
      enable_cheating: v.optional(v.boolean()),
      order: v.optional(v.number()),
      mongoId: v.optional(v.string()),
    }),
  },
  returns: markupTaskElementDoc,
  handler: async ({ db }, { id, data }) => {
    await db.patch(id, data as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const remove = mutation({
  args: { id: v.id("markup_task_elements") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return true;
  },
});
