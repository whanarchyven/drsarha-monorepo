import { defineTable } from "convex/server";
import { v } from "convex/values";

export const groupProgressFields = {
  userId: v.union(v.id("users"), v.string()),
  groupId: v.union(v.id("task_groups"), v.string()),
  completedTasks: v.array(v.union(v.id("tasks"), v.string())),
  totalTasks: v.number(),
  isCompleted: v.boolean(),
  completedAt: v.optional(v.union(v.string(), v.null())),
  rewardClaimed: v.boolean(),
  claimedAt: v.optional(v.string()),
  createdAt: v.optional(v.string()),
  updatedAt: v.string(),
  mongoId: v.optional(v.string()),
};

export const groupProgressTable = defineTable(groupProgressFields)
  .index("by_user_group", ["userId", "groupId"]) 
  .index("by_user_completed", ["userId", "isCompleted"]) 
  .index("by_group_completed", ["groupId", "isCompleted"]);

export const groupProgressDoc = v.object({
  _id: v.id("group_progress"),
  _creationTime: v.number(),
  ...groupProgressFields,
});


