import { defineTable } from "convex/server";
import { v } from "convex/values";

export const markupTaskAdditionalTaskFields = v.object({
  name: v.string(),
  description: v.string(),
  task_id: v.string(),
  task_type: v.string(),
});

export const markupTaskFields = {
  name: v.string(),
  cover_image: v.string(),
  description: v.string(),
  additional_tasks: v.array(markupTaskAdditionalTaskFields),
  idx: v.optional(v.number()),
  app_visible: v.optional(v.boolean()),
  publishAfter: v.optional(v.number()),
  mongoId: v.optional(v.string()),
};

export const markupTasksTable = defineTable(markupTaskFields)
  .index("by_app_visible", ["app_visible"])
  .index("by_mongo_id", ["mongoId"]);

export const markupTaskDoc = v.object({
  ...markupTaskFields,
  _id: v.id("markup_tasks"),
  _creationTime: v.number(),
});
