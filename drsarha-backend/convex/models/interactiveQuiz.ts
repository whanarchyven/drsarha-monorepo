import { defineTable } from "convex/server";
import { v } from "convex/values";

export const interactiveQuizFields = {
  name: v.string(),
  cover_image: v.string(),
  questions: v.array(
    v.object({
      answers: v.array(v.object({ answer: v.string(), isCorrect: v.boolean() })),
      correct_answer_comment: v.string(),
      image: v.optional(v.string()),
      question: v.string(),
      type: v.string(),
    })
  ),
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
  correct_answer_comment: v.optional(v.union(v.null(),v.string())),
  created_at: v.optional(v.string()),
  mongoId: v.optional(v.string()),
  idx: v.optional(v.number()),
  publishAfter: v.optional(v.number()),
  updated_at: v.optional(v.string()),
  app_visible: v.optional(v.boolean()),
  references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
};

export const interactiveQuizzesTable = defineTable(interactiveQuizFields)
  .index("by_nozology", ["nozology"]) 
  .index("by_mongo_id", ["mongoId"]);

export const interactiveQuizDoc = v.object({
  ...interactiveQuizFields,
  _id: v.id("interactive_quizzes"),
  _creationTime: v.number(),
});


