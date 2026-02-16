import { defineTable } from "convex/server";
import { v } from "convex/values";

export const interactiveTaskFields = {
  name: v.string(),
  difficulty: v.number(),
  cover_image: v.string(),
  answers: v.array(v.object({ image: v.string(), answer: v.string() })),
  available_errors: v.number(),
  feedback: v.array(
    v.object({
      analytic_questions: v.array(v.string()),
      answers: v.array(v.object({ answer: v.string(), is_correct: v.boolean() })),
      has_correct: v.boolean(),
      question: v.string(),
    })
  ),
  nozology: v.union(v.id("nozologies"), v.string()),
  stars: v.number(),
  mongoId: v.optional(v.string()),
  publishAfter: v.optional(v.number()),
  description: v.optional(v.string()),
  app_visible: v.optional(v.boolean()),
  references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
};

export const interactiveTasksTable = defineTable(interactiveTaskFields)
  .index("by_nozology", ["nozology"]) 
  .index("by_mongo_id", ["mongoId"]);

export const interactiveTaskDoc = v.object({
  ...interactiveTaskFields,
  _id: v.id("interactive_tasks"),
  _creationTime: v.number(),
});


