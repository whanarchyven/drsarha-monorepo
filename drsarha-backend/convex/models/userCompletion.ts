import { defineTable } from "convex/server";
import { v } from "convex/values";

const feedbackItem = v.object({
  analytic_questions: v.optional(v.array(v.string())),
  answers: v.array(v.object({ answer: v.string(), is_correct: v.boolean() })),
  has_correct: v.boolean(),
  question: v.string(),
  user_answers: v.optional(
    v.union(
      v.string(),
      v.array(v.union(v.string(), v.array(v.string())))
    )
  ),
});

const feedbackEntry = v.object({
  created_at: v.string(),
  feedback: v.array(feedbackItem),
});

const metadataLection = v.object({
  active_time: v.float64(),
  notes: v.array(v.object({ note: v.string(), time: v.float64() })),
});

const metadataAttempt = v.object({
  attempt: v.object({
    answers: v.array(
      v.object({
        answer: v.string(),
        image: v.optional(v.string()),
        is_correct: v.boolean(),
        question: v.optional(v.string()),
      })
    ),
    is_correct: v.optional(v.boolean()),
  }),
  created_at: v.string(),
});

export const userCompletionFields = {
  completed_at: v.union(v.null(), v.string()),
  created_at: v.string(),
  feedback: v.array(feedbackEntry),
  is_completed: v.boolean(),
  knowledge_id: v.string(),
  metadata: v.union(v.null(), metadataLection, v.array(metadataAttempt)),
  mongoId: v.optional(v.string()),
  type: v.string(),
  updated_at: v.string(),
  user_id: v.string(),
};

export const userCompletionsTable = defineTable(userCompletionFields)
  .index("by_user_knowledge", ["user_id", "knowledge_id"]);

export const userCompletionDoc = v.object({
  _id: v.id("user_completions"),
  _creationTime: v.number(),
  ...userCompletionFields,
});


