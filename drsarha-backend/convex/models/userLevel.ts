import { defineTable } from "convex/server";
import { v } from "convex/values";

export const userLevelFields = {
  userId: v.union(v.id("users"), v.string()),
  level: v.number(),
  exp: v.number(),
  expToNextLevel: v.number(),
  leveledUpAt: v.string(),
  createdAt: v.optional(v.string()),
  updatedAt: v.string(),
  mongoId: v.optional(v.string()),
};

export const userLevelsTable = defineTable(userLevelFields)
  .index("by_user", ["userId"]) 
  .index("by_level", ["level"]);

export const userLevelDoc = v.object({
  _id: v.id("user_levels"),
  _creationTime: v.number(),
  ...userLevelFields,
});


