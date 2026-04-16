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
  nozologyId: v.optional(v.union(v.id("nozologies"), v.string())),
  /** Текст при завершении задачи (например, поздравление или итог). */
  complete_comment: v.optional(v.string()),
  idx: v.optional(v.number()),
  app_visible: v.optional(v.boolean()),
  publishAfter: v.optional(v.number()),
  mongoId: v.optional(v.string()),
};

export const markupTasksTable = defineTable(markupTaskFields)
  .index("by_app_visible", ["app_visible"])
  .index("by_mongo_id", ["mongoId"])
  .index("by_nozology_id", ["nozologyId"]);

export const markupTaskDoc = v.object({
  ...markupTaskFields,
  _id: v.id("markup_tasks"),
  _creationTime: v.number(),
});
