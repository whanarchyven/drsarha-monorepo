import { defineTable } from "convex/server";
import { v } from "convex/values";

import { lootboxItemFields } from "./lootbox";

// Для сохраненного результата выпадения шанс не обязателен
export const claimItemFields = v.object({
  type: v.union(v.literal("stars"), v.literal("exp"), v.literal("prize"), v.literal("lootbox")),
  amount: v.number(),
  chance: v.optional(v.number()),
  objectId: v.optional(v.union(v.string(), v.null())),
});

export const lootboxClaimFields = {
  userId: v.union(v.id("users"), v.string()),
  lootboxId: v.union(v.id("lootboxes"), v.string()),
  status: v.union(v.literal("open"), v.literal("closed")),
  item: v.optional(
    v.object({
      type: v.union(v.literal("stars"), v.literal("exp"), v.literal("prize"), v.literal("lootbox")),
      amount: v.number(),
      chance: v.optional(v.number()),
      objectId: v.optional(v.union(v.null(), v.id("prizes"), v.id("lootboxes"), v.string())),
    })
  ),
  itemIndex: v.optional(v.number()),
  createdAt: v.optional(v.string()),
  updatedAt: v.optional(v.string()),
  mongoId: v.optional(v.string()),
};

export const lootboxClaimsTable = defineTable(lootboxClaimFields)
  .index("by_user", ["userId"]) 
  .index("by_user_status", ["userId", "status"]) 
  .index("by_mongo_id", ["mongoId"]);

export const lootboxClaimDoc = v.object({
  ...lootboxClaimFields,
  _id: v.id("lootbox_claims"),
  _creationTime: v.number(),
});


