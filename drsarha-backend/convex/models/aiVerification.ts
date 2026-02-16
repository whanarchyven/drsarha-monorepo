import { defineTable } from "convex/server";
import { v } from "convex/values";

export const aiVerificationFields = {
  userId: v.union(v.id("users"), v.string()),
  pinId: v.union(v.id("pins"), v.string()),
  isCorrect: v.boolean(),
  metadata: v.object({
    image: v.string(),
    title: v.string(),
    description: v.string(),
  }),
  created_at: v.string(),
  mongoId: v.optional(v.string()),
};

export const aiVerificationsTable = defineTable(aiVerificationFields)
  .index("by_user", ["userId"])
  .index("by_pin", ["pinId"]);

export const aiVerificationDoc = v.object({
  ...aiVerificationFields,
  _id: v.id("ai_verifications"),
  _creationTime: v.number(),
});


