import { defineTable } from "convex/server";
import { v } from "convex/values";

export const analyticRewriteFields = {
  question_id: v.id("analytic_questions"),
  rewrite_value: v.string(),
  rewrite_value_normalized: v.string(),
  rewrite_target: v.string(),
  rewrite_target_normalized: v.string(),
};

export const analyticRewritesTable = defineTable(analyticRewriteFields)
  .index("by_question", ["question_id"])
  .index("by_question_and_value", ["question_id", "rewrite_value_normalized"]);

export const analyticRewriteDoc = v.object({
  _id: v.id("analytic_rewrites"),
  _creationTime: v.number(),
  ...analyticRewriteFields,
});
