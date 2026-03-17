import { defineTable } from "convex/server";
import { v } from "convex/values";

export const markupTaskSlideFields = {
  markup_task_stage_id: v.union(v.id("markup_task_stages"), v.string()),
  name: v.string(),
  description: v.optional(v.string()),
  image: v.string(),
  base_height: v.number(),
  original_width: v.optional(v.number()),
  original_height: v.optional(v.number()),
  order: v.number(),
  mongoId: v.optional(v.string()),
};

export const markupTaskSlidesTable = defineTable(markupTaskSlideFields)
  .index("by_markup_task_stage", ["markup_task_stage_id"])
  .index("by_markup_task_stage_order", ["markup_task_stage_id", "order"])
  .index("by_mongo_id", ["mongoId"]);

export const markupTaskSlideDoc = v.object({
  ...markupTaskSlideFields,
  _id: v.id("markup_task_slides"),
  _creationTime: v.number(),
});
