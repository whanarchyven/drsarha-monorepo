import { defineTable } from "convex/server";
import { v } from "convex/values";

export const markupTaskPointValidator = v.object({
  x: v.number(),
  y: v.number(),
});

export const markupTaskGeometryValidator = v.object({
  type: v.string(),
  points: v.array(markupTaskPointValidator),
});

export const markupTaskElementFields = {
  markup_task_slide_id: v.union(v.id("markup_task_slides"), v.string()),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  geometry: markupTaskGeometryValidator,
  basis: v.number(),
  fine: v.number(),
  reward: v.number(),
  enable_cheating: v.boolean(),
  order: v.number(),
  mongoId: v.optional(v.string()),
};

export const markupTaskElementsTable = defineTable(markupTaskElementFields)
  .index("by_markup_task_slide", ["markup_task_slide_id"])
  .index("by_markup_task_slide_order", ["markup_task_slide_id", "order"])
  .index("by_mongo_id", ["mongoId"]);

export const markupTaskElementDoc = v.object({
  ...markupTaskElementFields,
  _id: v.id("markup_task_elements"),
  _creationTime: v.number(),
});
