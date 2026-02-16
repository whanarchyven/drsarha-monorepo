import { defineTable } from "convex/server";
import { v } from "convex/values";

export const userBanFields = {
  userId: v.union(v.id("users"), v.string()),
  bannedUserId: v.union(v.id("users"), v.string()),
  createdAt: v.optional(v.string()),
  mongoId: v.optional(v.string()),
};

export const userBansTable = defineTable(userBanFields)
  .index("by_user_and_created", ["userId", "createdAt"])
  .index("by_user_and_banned", ["userId", "bannedUserId"]);

export const userBanDoc = v.object({
  _id: v.id("user_bans"),
  _creationTime: v.number(),
  ...userBanFields,
});

