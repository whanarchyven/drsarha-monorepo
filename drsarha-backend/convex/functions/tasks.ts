import { query, mutation, internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { taskDoc, taskFields } from "../models/task";
import { internal } from "../_generated/api";

export const getAll = query({ args: {}, returns: v.array(taskDoc), handler: async ({ db }) => (db as any).query("tasks").collect() });

export const getById = query({ args: { id: v.id("tasks") }, returns: v.union(taskDoc, v.null()), handler: async ({ db }, { id }) => db.get(id) });

export const listActive = query({ args: {}, returns: v.array(taskDoc), handler: async ({ db }) => (db as any).query("tasks").withIndex("by_active", (q: any) => q.eq("isActive", true)).collect() });

export const create = mutation({ args: v.object(taskFields), returns: taskDoc, handler: async ({ db }, args) => { const _id = await db.insert("tasks", args as any); return (await db.get(_id))!; } });

export const update = mutation({ args: { id: v.id("tasks"), patch: v.object(Object.fromEntries(Object.entries(taskFields).map(([k, val]) => [k, (val as any).optional ? (val as any) : v.optional(val as any)]))) }, returns: taskDoc, handler: async ({ db }, { id, patch }) => { await db.patch(id, patch as any); return (await db.get(id))!; } });

export const remove = mutation({ args: { id: v.id("tasks") }, returns: v.boolean(), handler: async ({ db }, { id }) => { await db.delete(id); return true; } });

export const listByGroup = query({ args: { groupId: v.id("task_groups") }, returns: v.array(taskDoc), handler: async ({ db }, { groupId }) => (db as any).query("tasks").withIndex("by_group", (q: any) => q.eq("groupId", groupId)).collect() });

// Internal version for use in internal mutations
export const listByGroupInternal = internalQuery({ args: { groupId: v.id("task_groups") }, returns: v.array(taskDoc), handler: async ({ db }, { groupId }) => (db as any).query("tasks").withIndex("by_group", (q: any) => q.eq("groupId", groupId)).collect() });

// Internal: Give reward for task completion
export const giveTaskReward = internalMutation({
  args: { userId: v.id("users"), task: v.any() },
  returns: v.any(),
  handler: async (ctx, { userId, task }) => {
    const reward = task.reward || { stars: 0, exp: 0 };
    
    if (reward.stars || reward.exp) {
      // Update user balance
      await ctx.runMutation(internal.functions.users.incInternal, { 
        id: userId, 
        stars: reward.stars || 0, 
        exp: reward.exp || 0 
      } as any);
      
      // Get group info
      let groupName = 'Неизвестная группа';
      if (task.groupId) {
        const group = await ctx.runQuery(internal.functions.task_groups.getByIdInternal, { 
          id: task.groupId as any 
        });
        if (group) {
          groupName = (group as any).name;
        }
      }
      
      // Create notification
      const now = new Date().toISOString();
      await ctx.runMutation(internal.functions.notifications.createInternal, {
        userId,
        type: "TaskReward",
        isViewed: false,
        data: {
          taskId: task._id,
          taskTitle: task.title,
          groupId: task.groupId,
          groupName,
          rewardStars: reward.stars || 0,
          rewardExp: reward.exp || 0,
        },
        createdAt: now,
        updatedAt: now,
        mongoId: "",
      } as any);
    }
    
    return { success: true };
  }
});


