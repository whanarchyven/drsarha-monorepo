import { defineTable } from "convex/server";
import { v } from "convex/values";
import { analyticsQuestionType } from "../helpers/analytics";

export const analyticQuestionFields = {
  text: v.string(),
  textNormalized: v.string(),
  type: analyticsQuestionType,
  variants: v.optional(v.array(v.string())),
};

export const analyticQuestionsTable = defineTable(analyticQuestionFields)
  .index("by_text", ["textNormalized"]);

export const analyticQuestionDoc = v.object({
  _id: v.id("analytic_questions"),
  _creationTime: v.number(),
  ...analyticQuestionFields,
});
