import { defineTable } from "convex/server";
import { v } from "convex/values";

export const markupTaskStageFields = {
  markup_task_id: v.union(v.id("markup_tasks"), v.string()),
  name: v.string(),
  additional_info: v.optional(v.string()),
  description: v.string(),
  task_condition: v.optional(v.string()),
  element_name: v.optional(v.string()),
  base_color: v.optional(v.string()),
  info: v.optional(v.string()),
  order: v.number(),
  mongoId: v.optional(v.string()),
};

export const markupTaskStagesTable = defineTable(markupTaskStageFields)
  .index("by_markup_task", ["markup_task_id"])
  .index("by_markup_task_order", ["markup_task_id", "order"])
  .index("by_mongo_id", ["mongoId"]);

export const markupTaskStageDoc = v.object({
  ...markupTaskStageFields,
  _id: v.id("markup_task_stages"),
  _creationTime: v.number(),
});
