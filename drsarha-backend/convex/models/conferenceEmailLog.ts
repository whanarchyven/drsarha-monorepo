import { defineTable } from "convex/server";
import { v } from "convex/values";

export const conferenceEmailLogFields = {
  email: v.string(),
  subject: v.string(),
  provider: v.string(),
  status: v.union(
    v.literal("delivered"),
    v.literal("skipped"),
    v.literal("error")
  ),
  logs: v.array(v.string()),
  responseBody: v.optional(v.string()),
  errorMessage: v.optional(v.string()),
  createdAt: v.number(),
};

export const conferenceEmailLogTable = defineTable(
  conferenceEmailLogFields
)
  .index("by_email", ["email"])
  .index("by_createdAt", ["createdAt"]);

export const conferenceEmailLogDoc = v.object({
  _id: v.id("conference_email_logs"),
  _creationTime: v.number(),
  ...conferenceEmailLogFields,
});
