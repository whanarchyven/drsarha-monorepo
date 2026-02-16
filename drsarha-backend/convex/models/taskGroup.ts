import { defineTable } from "convex/server";
import { v } from "convex/values";

// Matches generated schema shape; link objectId → lootboxes
const rewardArrayItemFields = v.object({
  amount: v.number(),
  objectId: v.optional(v.union(v.id("lootboxes"), v.string())),
  title: v.string(),
  type: v.string(),
});

export const taskGroupFields = {
  name: v.string(),
  description: v.string(),
  startDate: v.string(),
  endDate: v.string(),
  timeType: v.string(),
  reward: v.object({
    items: v.array(rewardArrayItemFields),
  }),
  level: v.optional(v.union(v.null(), v.number())), // Изменено для совместимости с миграцией
  isActive: v.boolean(),
  createdAt: v.optional(v.string()),
  updatedAt: v.string(),
  mongoId: v.optional(v.string()),
};

export const taskGroupsTable = defineTable(taskGroupFields)
  .index("by_time", ["timeType"]) 
  .index("by_active", ["isActive"]) 
  .index("by_level", ["level"]);

export const taskGroupDoc = v.object({
  _id: v.id("task_groups"),
  _creationTime: v.number(),
  ...taskGroupFields,
});


