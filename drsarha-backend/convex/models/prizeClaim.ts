import { defineTable } from "convex/server";
import { v } from "convex/values";

export const prizeClaimFields = {
  userId: v.union(v.id("users"), v.string()),
  prizeId: v.union(v.id("prizes"), v.string()),
  status: v.union(
    v.literal("pending"),
    v.literal("claimed"),
    v.literal("backlog"),
    v.literal("refund"),
    v.literal("canceled"),
  ),
  claimedAt: v.string(),
  transactionId: v.union(v.id("stars_transactions"), v.string()),
  mongoId: v.optional(v.string()),
};

export const prizeClaimsTable = defineTable(prizeClaimFields)
  .index("by_user", ["userId"]) 
  .index("by_prize", ["prizeId"]) 
  .index("by_user_status", ["userId", "status"]) 
  .index("by_mongo_id", ["mongoId"]);

export const prizeClaimDoc = v.object({
  ...prizeClaimFields,
  _id: v.id("prize_claims"),
  _creationTime: v.number(),
});


