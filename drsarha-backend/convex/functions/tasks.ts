import { query, mutation, internalMutation, internalQuery, action } from "../_generated/server";
import { v } from "convex/values";
import { taskDoc, taskFields } from "../models/task";
import { internal, api } from "../_generated/api";

export const getAll = query({ args: {}, returns: v.array(taskDoc), handler: async ({ db }) => (db as any).query("tasks").collect() });

export const getById = query({ args: { id: v.id("tasks") }, returns: v.union(taskDoc, v.null()), handler: async ({ db }, { id }) => db.get(id) });

export const getByIdOrMongoId = query({
  args: { id: v.string() },
  returns: v.union(taskDoc, v.null()),
  handler: async ({ db }, { id }) => {
    try {
      const byId = await db.get(id as any);
      if (byId) return byId;
    } catch {
      // ignore invalid id format
    }
    const all = await (db as any).query("tasks").collect();
    return all.find((t: any) => String(t.mongoId) === id) ?? null;
  },
});

export const listActive = query({ args: {}, returns: v.array(taskDoc), handler: async ({ db }) => (db as any).query("tasks").withIndex("by_active", (q: any) => q.eq("isActive", true)).collect() });

export const create = mutation({ args: v.object(taskFields), returns: taskDoc, handler: async ({ db }, args) => { const _id = await db.insert("tasks", args as any); return (await db.get(_id))!; } });

export const update = mutation({ args: { id: v.id("tasks"), patch: v.object(Object.fromEntries(Object.entries(taskFields).map(([k, val]) => [k, (val as any).optional ? (val as any) : v.optional(val as any)]))) }, returns: taskDoc, handler: async ({ db }, { id, patch }) => { await db.patch(id, patch as any); return (await db.get(id))!; } });

export const remove = mutation({ args: { id: v.id("tasks") }, returns: v.boolean(), handler: async ({ db }, { id }) => { await db.delete(id); return true; } });

export const listByGroup = query({ args: { groupId: v.id("task_groups") }, returns: v.array(taskDoc), handler: async ({ db }, { groupId }) => (db as any).query("tasks").withIndex("by_group", (q: any) => q.eq("groupId", groupId)).collect() });

// Internal version for use in internal mutations
export const listByGroupInternal = internalQuery({ args: { groupId: v.id("task_groups") }, returns: v.array(taskDoc), handler: async ({ db }, { groupId }) => (db as any).query("tasks").withIndex("by_group", (q: any) => q.eq("groupId", groupId)).collect() });

export const completeTaskDirectly = action({
  args: { taskId: v.string(), userIds: v.array(v.id("users")) },
  returns: v.object({ success: v.boolean(), processed: v.number() }),
  handler: async (ctx, { taskId, userIds }) => {
    const task = await ctx.runQuery(api.functions.tasks.getByIdOrMongoId, {
      id: taskId,
    });
    if (!task) {
      return { success: false, processed: 0 };
    }

    const targetAmount = (task as any).config?.targetAmount ?? 1;
    let processed = 0;
    for (const userId of userIds) {
      await ctx.runMutation(internal.functions.progress.updateTaskProgressForAction, {
        userId,
        task: task as any,
        amount: targetAmount,
      });
      processed++;
    }

    return { success: true, processed };
  },
});

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


