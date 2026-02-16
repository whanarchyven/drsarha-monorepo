import { defineTable } from "convex/server";
import { v } from "convex/values";

export const taskProgressFields = {
  userId: v.union(v.id("users"), v.string()),
  taskId: v.union(v.id("tasks"), v.string()),
  groupId: v.union(v.id("task_groups"), v.string()),
  currentProgress: v.number(),
  targetAmount: v.number(),
  isCompleted: v.boolean(),
  completedAt: v.optional(v.union(v.null(), v.string())),
  rewardClaimed: v.boolean(),
  claimedAt: v.optional(v.string()),
  createdAt: v.optional(v.string()),
  updatedAt: v.string(),
  mongoId: v.optional(v.string()),
};

export const taskProgressTable = defineTable(taskProgressFields)
  .index("by_user_task", ["userId", "taskId"]) 
  .index("by_user_group", ["userId", "groupId"]) 
  .index("by_user_completed", ["userId", "isCompleted"]);

export const taskProgressDoc = v.object({
  _id: v.id("task_progress"),
  _creationTime: v.number(),
  ...taskProgressFields,
});


