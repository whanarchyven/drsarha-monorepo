import { defineTable } from "convex/server";
import { v } from "convex/values";

export const interactiveMatchFields = {
  name: v.string(),
  cover_image: v.string(),
  answers: v.array(v.string()),
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
  created_at: v.string(),
  mongoId: v.optional(v.string()),
  idx: v.optional(v.number()),
  interviewMode: v.optional(v.boolean()),
  interviewQuestions: v.optional(v.array(v.string())),
  publishAfter: v.optional(v.number()),
  app_visible: v.optional(v.boolean()),
  references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
};

export const interactiveMatchesTable = defineTable(interactiveMatchFields)
  .index("by_nozology", ["nozology"]) 
  .index("by_mongo_id", ["mongoId"]);

export const interactiveMatchDoc = v.object({
  ...interactiveMatchFields,
  _id: v.id("interactive_matches"),
  _creationTime: v.number(),
});


