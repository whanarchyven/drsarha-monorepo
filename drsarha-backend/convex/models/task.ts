import { defineTable } from "convex/server";
import { v } from "convex/values";

export const taskConfigFields = v.object({
  targetAmount: v.number(),
  knowledgeRef: v.optional(v.union(v.null(), v.string())),
  knowledgeType: v.optional(v.union(v.null(), v.string())),
});

export const taskRewardFields = v.object({
  stars: v.number(),
  exp: v.number(),
});

export const taskFields = {
  title: v.string(),
  description: v.string(),
  groupId: v.union(v.id("task_groups"), v.string()),
  actionType: v.string(),
  config: taskConfigFields,
  reward: taskRewardFields,
  isActive: v.boolean(),
  createdAt: v.optional(v.string()),
  updatedAt: v.string(),
  mongoId: v.optional(v.string()),
};

export const tasksTable = defineTable(taskFields)
  .index("by_group", ["groupId"]) 
  .index("by_action", ["actionType"]) 
  .index("by_active", ["isActive"]);

export const taskDoc = v.object({
  _id: v.id("tasks"),
  _creationTime: v.number(),
  ...taskFields,
});


