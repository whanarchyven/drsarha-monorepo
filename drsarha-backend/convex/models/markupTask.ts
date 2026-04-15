import { defineTable } from "convex/server";
import { v } from "convex/values";
import { clinicTaskQuestionValidator } from "./clinicTask";

export const markupTaskFields = {
  name: v.string(),
  cover_image: v.string(),
  description: v.string(),
  /** Аналог additional_info у clinic_task. */
  patient_info: v.optional(v.string()),
  ai_scenario: v.optional(v.string()),
  questions: v.optional(v.array(clinicTaskQuestionValidator)),
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
