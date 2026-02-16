import { defineTable } from "convex/server";
import { v } from "convex/values";

export const starsTransactionFields = {
  user_id: v.union(v.id("users"), v.string()),
  stars: v.number(),
  type: v.optional(v.string()), // Изменено с union на optional string для совместимости с миграцией
  knowledge_id: v.optional(v.union(v.string(),v.null())),
  created_at: v.string(),
  mongoId: v.optional(v.string()),
};

export const expTransactionFields = {
  user_id: v.union(v.id("users"), v.string()),
  exp: v.number(),
  type: v.union(v.literal("plus"), v.literal("minus")),
  knowledge_id: v.optional(v.union(v.string(),v.null())),
  created_at: v.string(),
  mongoId: v.optional(v.string()),
};

export const starsTransactionsTable = defineTable(starsTransactionFields)
  .index("by_user_created", ["user_id", "created_at"]) 
  .index("by_user_type", ["user_id", "type"]);

export const expTransactionsTable = defineTable(expTransactionFields)
  .index("by_user_created", ["user_id", "created_at"]) 
  .index("by_user_type", ["user_id", "type"]);

export const starsTransactionDoc = v.object({
  _id: v.id("stars_transactions"),
  _creationTime: v.number(),
  ...starsTransactionFields,
});

export const expTransactionDoc = v.object({
  _id: v.id("exp_transactions"),
  _creationTime: v.number(),
  ...expTransactionFields,
});


