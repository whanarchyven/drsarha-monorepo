import { defineTable } from "convex/server";
import { v } from "convex/values";
import { analyticsInsightType } from "../helpers/analytics";

export const analyticInsightFields = {
  question_id: v.id("analytic_questions"),
  user_id: v.string(),
  response: v.union(v.string(), v.number()),
  responseNormalized: v.string(),
  type: analyticsInsightType,
  timestamp: v.number(),
};

export const analyticInsightsTable = defineTable(analyticInsightFields)
  .index("by_question", ["question_id"])
  .index("by_question_timestamp", ["question_id", "timestamp"])
  .index("by_user", ["user_id"]);

export const analyticInsightDoc = v.object({
  _id: v.id("analytic_insights"),
  _creationTime: v.number(),
  ...analyticInsightFields,
});
