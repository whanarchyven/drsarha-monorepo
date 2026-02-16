import { query, mutation, internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { taskProgressDoc, taskProgressFields } from "../models/taskProgress";
import { groupProgressDoc, groupProgressFields } from "../models/groupProgress";
import { userLevelDoc, userLevelFields } from "../models/userLevel";
import { internal, api } from "../_generated/api";

// Task progress
export const getTaskProgress = query({
  args: { userId: v.id("users"), taskId: v.id("tasks") },
  returns: v.union(taskProgressDoc, v.null()),
  handler: async ({ db }, { userId, taskId }) => {
    const hit = await (db as any).query("task_progress").withIndex("by_user_task", (q: any) => q.eq("userId", userId).eq("taskId", taskId)).first();
    return hit ?? null;
  }
});

export const upsertTaskProgress = mutation({
  args: v.object(taskProgressFields),
  returns: taskProgressDoc,
  handler: async ({ db }, args) => {
    const existing = await (db as any).query("task_progress").withIndex("by_user_task", (q: any) => q.eq("userId", args.userId).eq("taskId", args.taskId)).first();
    if (existing) {
      await db.patch(existing._id, { ...args } as any);
      return (await db.get(existing._id))!;
    }
    const _id = await db.insert("task_progress", args as any);
    return (await db.get(_id))!;
  }
});

export const listTaskProgressByUserGroup = query({
  args: { userId: v.id("users"), groupId: v.id("task_groups") },
  returns: v.array(taskProgressDoc),
  handler: async ({ db }, { userId, groupId }) => {
    const items = await (db as any)
      .query("task_progress")
      .withIndex("by_user_group", (q: any) => q.eq("userId", userId).eq("groupId", groupId))
      .collect();
    return items;
  }
});

export const listCompletedByUser = query({
  args: { userId: v.id("users") },
  returns: v.array(taskProgressDoc),
  handler: async ({ db }, { userId }) => {
    const items = await (db as any)
      .query("task_progress")
      .withIndex("by_user_completed", (q: any) => q.eq("userId", userId).eq("isCompleted", true))
      .collect();
    return items;
  }
});

// Group progress
export const getGroupProgress = query({
  args: { userId: v.id("users"), groupId: v.id("task_groups") },
  returns: v.union(groupProgressDoc, v.null()),
  handler: async ({ db }, { userId, groupId }) => {
    const hit = await (db as any).query("group_progress").withIndex("by_user_group", (q: any) => q.eq("userId", userId).eq("groupId", groupId)).first();
    return hit ?? null;
  }
});

export const upsertGroupProgress = mutation({
  args: v.object(groupProgressFields),
  returns: groupProgressDoc,
  handler: async ({ db }, args) => {
    const existing = await (db as any).query("group_progress").withIndex("by_user_group", (q: any) => q.eq("userId", args.userId).eq("groupId", args.groupId)).first();
    if (existing) {
      await db.patch(existing._id, { ...args } as any);
      return (await db.get(existing._id))!;
    }
    const _id = await db.insert("group_progress", args as any);
    return (await db.get(_id))!;
  }
});

// User level
export const getUserLevel = query({
  args: { userId: v.id("users") },
  returns: v.union(userLevelDoc, v.null()),
  handler: async ({ db }, { userId }) => {
    const hit = await (db as any).query("user_levels").withIndex("by_user", (q: any) => q.eq("userId", userId)).first();
    return hit ?? null;
  }
});

// Internal versions for use in internal mutations
export const getUserLevelInternal = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(userLevelDoc, v.null()),
  handler: async ({ db }, { userId }) => {
    const hit = await (db as any).query("user_levels").withIndex("by_user", (q: any) => q.eq("userId", userId)).first();
    return hit ?? null;
  }
});

export const getGroupProgressInternal = internalQuery({
  args: { userId: v.id("users"), groupId: v.id("task_groups") },
  returns: v.union(groupProgressDoc, v.null()),
  handler: async ({ db }, { userId, groupId }) => {
    const hit = await (db as any).query("group_progress").withIndex("by_user_group", (q: any) => q.eq("userId", userId).eq("groupId", groupId)).first();
    return hit ?? null;
  }
});

export const getTaskProgressInternal = internalQuery({
  args: { userId: v.id("users"), taskId: v.id("tasks") },
  returns: v.union(taskProgressDoc, v.null()),
  handler: async ({ db }, { userId, taskId }) => {
    const hit = await (db as any).query("task_progress").withIndex("by_user_task", (q: any) => q.eq("userId", userId).eq("taskId", taskId)).first();
    return hit ?? null;
  }
});

export const upsertTaskProgressInternal = internalMutation({
  args: v.object(taskProgressFields),
  returns: taskProgressDoc,
  handler: async ({ db }, args) => {
    const existing = await (db as any).query("task_progress").withIndex("by_user_task", (q: any) => q.eq("userId", args.userId).eq("taskId", args.taskId)).first();
    if (existing) {
      await db.patch(existing._id, { ...args } as any);
      return (await db.get(existing._id))!;
    }
    const _id = await db.insert("task_progress", args as any);
    return (await db.get(_id))!;
  }
});

export const upsertGroupProgressInternal = internalMutation({
  args: v.object(groupProgressFields),
  returns: groupProgressDoc,
  handler: async ({ db }, args) => {
    const existing = await (db as any).query("group_progress").withIndex("by_user_group", (q: any) => q.eq("userId", args.userId).eq("groupId", args.groupId)).first();
    if (existing) {
      await db.patch(existing._id, { ...args } as any);
      return (await db.get(existing._id))!;
    }
    const _id = await db.insert("group_progress", args as any);
    return (await db.get(_id))!;
  }
});

export const upsertUserLevel = mutation({
  args: v.object(userLevelFields),
  returns: userLevelDoc,
  handler: async ({ db }, args) => {
    const existing = await (db as any).query("user_levels").withIndex("by_user", (q: any) => q.eq("userId", args.userId)).first();
    if (existing) {
      await db.patch(existing._id, { ...args } as any);
      return (await db.get(existing._id))!;
    }
    const _id = await db.insert("user_levels", args as any);
    return (await db.get(_id))!;
  }
});

// Internal: Update knowledge progress in task groups
export const updateKnowledgeProgress = internalMutation({
  args: { userId: v.id("users"), knowledgeId: v.string(), knowledgeType: v.string() },
  returns: v.any(),
  handler: async (ctx, { userId, knowledgeId, knowledgeType }) => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    
    // Get user level
    const userLevel = await ctx.runQuery(internal.functions.progress.getUserLevelInternal, { userId });
    const userLevelValue = (userLevel as any)?.level || 1;
    
    // Get active groups
    const allGroups: any[] = await ctx.runQuery(internal.functions.task_groups.listActiveInternal, { date: dateStr });
    const groups = allGroups.filter(g => g.timeType !== 'level' || g.level === userLevelValue);
    
    for (const group of groups) {
      const tasks: any[] = await ctx.runQuery(internal.functions.tasks.listByGroupInternal, { groupId: group._id });
      const matched = tasks.filter((t: any) => {
        const okType = t.actionType === 'complete_knowledge';
        const okRef = t.config?.knowledgeRef === knowledgeId;
        const okKind = t.config?.knowledgeType === knowledgeType;
        return okType && okRef && okKind;
      });
      
      for (const task of matched) {
        await ctx.runMutation(internal.functions.progress.updateTaskProgressForKnowledge, { 
          userId, 
          task: task as any,
          amount: 1
        });
      }
    }
    
    return { success: true };
  }
});

// Internal: Update task progress for knowledge completion
export const updateTaskProgressForKnowledge = internalMutation({
  args: { 
    userId: v.id("users"), 
    task: v.any(), 
    amount: v.number() 
  },
  returns: v.any(),
  handler: async (ctx, { userId, task, amount }) => {
    let groupProgress = await ctx.runQuery(internal.functions.progress.getGroupProgressInternal, { 
      userId, 
      groupId: task.groupId as any 
    });
    
    // Create groupProgress if it doesn't exist
    if (!groupProgress) {
      const nowIso = new Date().toISOString();
      // Get all tasks in the group to determine totalTasks
      const allTasks = await ctx.runQuery(internal.functions.tasks.listByGroupInternal, { 
        groupId: task.groupId as any 
      });
      const totalTasks = allTasks.length;
      
      groupProgress = await ctx.runMutation(internal.functions.progress.upsertGroupProgressInternal, {
        userId,
        groupId: task.groupId as any,
        completedTasks: [],
        totalTasks,
        isCompleted: false,
        completedAt: undefined,
        rewardClaimed: false,
        claimedAt: undefined,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as any);
    }
    
    // Get or create task progress
    let taskProgress = await ctx.runQuery(internal.functions.progress.getTaskProgressInternal, { 
      userId, 
      taskId: task._id as any 
    });
    
    if (!taskProgress) {
      const nowIso = new Date().toISOString();
      taskProgress = await ctx.runMutation(internal.functions.progress.upsertTaskProgressInternal, {
        userId,
        taskId: task._id as any,
        groupId: task.groupId as any,
        currentProgress: 0,
        targetAmount: task.config.targetAmount,
        isCompleted: false,
        rewardClaimed: false,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as any);
    }
    
    // Update task progress if not completed
    if (!(taskProgress as any).isCompleted) {
      const newProgress = Math.min(
        ((taskProgress as any).currentProgress || 0) + amount, 
        task.config.targetAmount
      );
      
      const nowIso = new Date().toISOString();
      const isTaskCompleted = newProgress >= task.config.targetAmount;
      
      await ctx.runMutation(internal.functions.progress.upsertTaskProgressInternal, {
        userId,
        taskId: task._id as any,
        groupId: task.groupId as any,
        currentProgress: newProgress,
        targetAmount: task.config.targetAmount,
        isCompleted: isTaskCompleted,
        rewardClaimed: false,
        createdAt: (taskProgress as any).createdAt || nowIso,
        updatedAt: nowIso,
      } as any);
      
      // If task completed, give reward
      if (isTaskCompleted && !(taskProgress as any).isCompleted) {
        await ctx.runMutation(internal.functions.tasks.giveTaskReward, {
          userId,
          task: task as any,
        });
        
        // Update group progress
        if (!(groupProgress as any).completedTasks.includes(task._id)) {
          const updatedCompleted = [...((groupProgress as any).completedTasks || []), task._id];
          const isGroupCompleted = updatedCompleted.length >= (groupProgress as any).totalTasks;
          
          await ctx.runMutation(internal.functions.progress.upsertGroupProgressInternal, {
            userId,
            groupId: (groupProgress as any).groupId as any,
            totalTasks: (groupProgress as any).totalTasks,
            completedTasks: updatedCompleted,
            isCompleted: isGroupCompleted,
            completedAt: isGroupCompleted ? ((groupProgress as any).completedAt || nowIso) : undefined,
            rewardClaimed: (groupProgress as any).rewardClaimed ?? false,
            claimedAt: (groupProgress as any).claimedAt,
            createdAt: (groupProgress as any).createdAt ?? nowIso,
            updatedAt: nowIso,
          } as any);
        }
      }
    }
    
    return { success: true };
  }
});

// Internal: Update action progress in task groups (for create_pin, like_pin, create_comment, create_folder, invite_user)
export const updateActionProgress = internalMutation({
  args: { 
    userId: v.id("users"), 
    actionType: v.union(
      v.literal("create_pin"),
      v.literal("like_pin"),
      v.literal("create_comment"),
      v.literal("create_folder"),
      v.literal("invite_user")
    ),
    amount: v.optional(v.number())
  },
  returns: v.any(),
  handler: async (ctx, { userId, actionType, amount = 1 }) => {
    
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    
    // Get user level
    const userLevel = await ctx.runQuery(internal.functions.progress.getUserLevelInternal, { userId });
    const userLevelValue = (userLevel as any)?.level || 1;
    
    // Get active groups
    const allGroups: any[] = await ctx.runQuery(internal.functions.task_groups.listActiveInternal, { date: dateStr });
    const groups = allGroups.filter(g => g.timeType !== 'level' || g.level === userLevelValue);

    
    
    for (const group of groups) {
      const tasks: any[] = await ctx.runQuery(internal.functions.tasks.listByGroupInternal, { groupId: group._id });
      const matched = tasks.filter((t: any) => t.actionType === actionType);
      
      for (const task of matched) {
        
        await ctx.runMutation(internal.functions.progress.updateTaskProgressForAction, { 
          userId, 
          task: task as any,
          amount
        });
      }
    }
    
    return { success: true };
  }
});

// Internal: Update task progress for action completion
export const updateTaskProgressForAction = internalMutation({
  args: { 
    userId: v.id("users"), 
    task: v.any(), 
    amount: v.number() 
  },
  returns: v.any(),
  handler: async (ctx, { userId, task, amount }) => {
    let groupProgress = await ctx.runQuery(internal.functions.progress.getGroupProgressInternal, { 
      userId, 
      groupId: task.groupId as any 
    });

    
    
    // Create groupProgress if it doesn't exist
    if (!groupProgress) {
      const nowIso = new Date().toISOString();
      // Get all tasks in the group to determine totalTasks
      const allTasks = await ctx.runQuery(internal.functions.tasks.listByGroupInternal, { 
        groupId: task.groupId as any 
      });
      const totalTasks = allTasks.length;
      
      groupProgress = await ctx.runMutation(internal.functions.progress.upsertGroupProgressInternal, {
        userId,
        groupId: task.groupId as any,
        completedTasks: [],
        totalTasks,
        isCompleted: false,
        completedAt: undefined,
        rewardClaimed: false,
        claimedAt: undefined,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as any);
    }
    
    // Get or create task progress
    let taskProgress = await ctx.runQuery(internal.functions.progress.getTaskProgressInternal, { 
      userId, 
      taskId: task._id as any 
    });
    
    console.log('taskProgress', taskProgress);


    if (!taskProgress) {
      const nowIso = new Date().toISOString();
      taskProgress = await ctx.runMutation(internal.functions.progress.upsertTaskProgressInternal, {
        userId,
        taskId: task._id as any,
        groupId: task.groupId as any,
        currentProgress: 0,
        targetAmount: task.config.targetAmount,
        isCompleted: false,
        rewardClaimed: false,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as any);
    }
    
    // Update task progress if not completed
    if (!(taskProgress as any).isCompleted) {
      const newProgress = Math.min(
        ((taskProgress as any).currentProgress || 0) + amount, 
        task.config.targetAmount
      );
      
      const nowIso = new Date().toISOString();
      const isTaskCompleted = newProgress >= task.config.targetAmount;
      
      await ctx.runMutation(internal.functions.progress.upsertTaskProgressInternal, {
        userId,
        taskId: task._id as any,
        groupId: task.groupId as any,
        currentProgress: newProgress,
        targetAmount: task.config.targetAmount,
        isCompleted: isTaskCompleted,
        rewardClaimed: false,
        createdAt: (taskProgress as any).createdAt || nowIso,
        updatedAt: nowIso,
      } as any);
      
      // If task completed, give reward
      if (isTaskCompleted && !(taskProgress as any).isCompleted) {
        await ctx.runMutation(internal.functions.tasks.giveTaskReward, {
          userId,
          task: task as any,
        });
        
        // Update group progress
        if (!(groupProgress as any).completedTasks.includes(task._id)) {
          const updatedCompleted = [...((groupProgress as any).completedTasks || []), task._id];
          const isGroupCompleted = updatedCompleted.length >= (groupProgress as any).totalTasks;
          
          await ctx.runMutation(internal.functions.progress.upsertGroupProgressInternal, {
            userId,
            groupId: (groupProgress as any).groupId as any,
            totalTasks: (groupProgress as any).totalTasks,
            completedTasks: updatedCompleted,
            isCompleted: isGroupCompleted,
            completedAt: isGroupCompleted ? ((groupProgress as any).completedAt || nowIso) : undefined,
            rewardClaimed: (groupProgress as any).rewardClaimed ?? false,
            claimedAt: (groupProgress as any).claimedAt,
            createdAt: (groupProgress as any).createdAt ?? nowIso,
            updatedAt: nowIso,
          } as any);
        }
      }
    }
    
    return { success: true };
  }
});

// Claim group reward
export const claimGroupReward = mutation({
  args: {
    userId: v.id("users"),
    groupId: v.id("task_groups"),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    reward: v.optional(v.any()),
    rewards: v.optional(v.array(v.object({
      type: v.union(v.literal("stars"), v.literal("exp"), v.literal("prize"), v.literal("lootbox")),
      amount: v.number(),
      title: v.string(),
      id: v.optional(v.string()),
    }))),
  }),
  handler: async (ctx, { userId, groupId }) => {
    // Get group progress
    const progress = await ctx.runQuery(api.functions.progress.getGroupProgress, {
      userId,
      groupId,
    });
    
    if (!progress) {
      return { success: false, message: 'Прогресс группы не найден' };
    }

    if (!(progress as any).isCompleted) {
      return { success: false, message: 'Группа заданий не завершена' };
    }

    if ((progress as any).rewardClaimed) {
      return { success: false, message: 'Награда уже получена' };
    }

    // Get group
    const group = await ctx.runQuery(api.functions.task_groups.getById, { id: groupId });
    if (!group) {
      return { success: false, message: 'Группа не найдена' };
    }

    // Process rewards
    const updateFields: any = {};
    let totalExpGain = 0;
    const rewards: {
      type: 'stars' | 'exp' | 'prize' | 'lootbox';
      amount: number;
      title: string;
      id?: string;
    }[] = [];

    const rewardItems = (group as any).reward?.items || [];
    for (const rewardItem of rewardItems) {
      switch (rewardItem.type) {
        case 'stars':
          updateFields.stars = (updateFields.stars || 0) + rewardItem.amount;
          rewards.push({
            type: 'stars',
            amount: rewardItem.amount,
            title: rewardItem.title
          });
          break;
        case 'exp':
          totalExpGain += rewardItem.amount;
          rewards.push({
            type: 'exp',
            amount: rewardItem.amount,
            title: rewardItem.title
          });
          break;
        case 'prize':
          if (rewardItem.objectId) {
            // Add prize to user inventory
            try {
              await ctx.runMutation(api.functions.users.pushPrize, {
                id: userId,
                prizeId: rewardItem.objectId.toString(),
                obtainedAt: new Date().toISOString(),
              });
              rewards.push({
                type: 'prize',
                amount: rewardItem.amount,
                title: rewardItem.title,
                id: rewardItem.objectId.toString()
              });
            } catch (error) {
              console.error('Error adding prize to user:', error);
            }
          }
          break;
        case 'lootbox':
          if (rewardItem.objectId) {
            // Create lootbox claim
            try {
              const claim = await ctx.runMutation(api.functions.lootbox_claims.create, {
                user_id: userId as any,
                lootbox_id: rewardItem.objectId as any,
              });
              if (claim) {
                rewards.push({
                  type: 'lootbox',
                  amount: rewardItem.amount,
                  title: rewardItem.title,
                  id: (claim as any)._id
                });
              }
            } catch (error) {
              console.error('Error creating lootbox claim:', error);
            }
          }
          break;
      }
    }

    // Update stars and exp
    if (Object.keys(updateFields).length > 0) {
      await ctx.runMutation(api.functions.users.inc, {
        id: userId,
        stars: updateFields.stars,
        exp: updateFields.exp,
      } as any);
    }

    // Update user level if exp gained
    if (totalExpGain > 0) {
      const current = await ctx.runQuery(api.functions.progress.getUserLevel, { userId });
      const nowIso = new Date().toISOString();
      await ctx.runMutation(api.functions.progress.upsertUserLevel, {
        userId: userId as any,
        level: (current as any)?.level ?? 1,
        exp: ((current as any)?.exp ?? 0) + totalExpGain,
        expToNextLevel: (current as any)?.expToNextLevel ?? 100,
        updatedAt: nowIso,
        createdAt: (current as any)?.createdAt ?? nowIso,
      } as any);
    }

    // Mark reward as claimed
    const nowIso = new Date().toISOString();
    await ctx.runMutation(api.functions.progress.upsertGroupProgress, {
      userId: userId as any,
      groupId: groupId as any,
      completedTasks: (progress as any).completedTasks,
      totalTasks: (progress as any).totalTasks,
      isCompleted: (progress as any).isCompleted,
      rewardClaimed: true,
      claimedAt: nowIso,
      createdAt: (progress as any).createdAt,
      updatedAt: nowIso,
    } as any);

    return {
      success: true,
      message: 'Награда успешно получена',
      reward: (group as any).reward,
      rewards
    };
  },
});

// Get user level progress
export const getUserLevelProgress = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.object({
    completed: v.number(),
    need: v.number(),
    level: v.number(),
    groupName: v.optional(v.string()),
    groupId: v.optional(v.string()),
  }),
  handler: async ({ db, runQuery }, { userId }) => {
    try {
      const userLevel = await runQuery(api.functions.progress.getUserLevel, { userId });
      if (!userLevel) {
        return {
          completed: 0,
          need: 0,
          level: 1,
        };
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      const groups: any[] = await runQuery(api.functions.task_groups.listActive, { 
        date: dateStr,
        userId,
        userLevel: (userLevel as any).level,
      } as any);
      const levelGroup = groups.find((g: any) => g.timeType === 'level' && g.level === (userLevel as any).level);

      if (!levelGroup) {
        return {
          completed: 0,
          need: 0,
          level: (userLevel as any).level,
        };
      }

      const tasks: any[] = await runQuery(api.functions.tasks.listByGroup, { 
        groupId: levelGroup._id as any 
      });

      // Check each task completion
      let completedCount = 0;
      const taskProgresses: any[] = await runQuery(api.functions.progress.listTaskProgressByUserGroup, { 
        userId, 
        groupId: levelGroup._id as any 
      });
      const progByTask: Record<string, any> = Object.fromEntries(
        taskProgresses.map((p: any) => [p.taskId, p])
      );
      
      for (const task of tasks) {
        const tp = progByTask[task._id] as any;
        if (tp?.isCompleted) completedCount++;
      }

      return {
        completed: completedCount,
        need: tasks.length,
        level: (userLevel as any).level,
        groupName: (levelGroup as any).name,
        groupId: String(levelGroup._id),
      };
    } catch (error) {
      console.error('Error getting user level progress:', error);
      return {
        completed: 0,
        need: 0,
        level: 1,
      };
    }
  },
});

// Internal: Check level group completion
export const checkLevelGroupCompletionInternal = internalQuery({
  args: {
    userId: v.id("users"),
    level: v.number(),
  },
  returns: v.object({
    isCompleted: v.boolean(),
    groupId: v.optional(v.string()),
    groupName: v.optional(v.string()),
    message: v.optional(v.string()),
  }),
  handler: async (ctx, { userId, level }) => {
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      const allGroups: any[] = await ctx.runQuery(internal.functions.task_groups.listActiveInternal, { date: dateStr });
      const levelGroup = allGroups.find((g: any) => g.timeType === 'level' && g.level === level);
      
      if (!levelGroup) {
        return {
          isCompleted: false,
          message: `Группа заданий для уровня ${level} не найдена`,
        };
      }

      const progress = await ctx.runQuery(internal.functions.progress.getGroupProgressInternal, {
        userId,
        groupId: levelGroup._id as any,
      });

      if (!progress) {
        return {
          isCompleted: false,
          groupId: String(levelGroup._id),
          groupName: (levelGroup as any).name,
          message: 'Прогресс по группе не найден',
        };
      }

      return {
        isCompleted: (progress as any).isCompleted,
        groupId: String(levelGroup._id),
        groupName: (levelGroup as any).name,
        message: (progress as any).isCompleted
          ? `Группа "${(levelGroup as any).name}" полностью завершена`
          : `Группа "${(levelGroup as any).name}" не завершена (${(progress as any).completedTasks.length}/${(progress as any).totalTasks} заданий)`,
      };
    } catch (error) {
      console.error(`Error checking level group completion for level ${level}:`, error);
      return {
        isCompleted: false,
        message: 'Ошибка при проверке завершения группы',
      };
    }
  },
});

// Level up user
export const levelUp = mutation({
  args: {
    userId: v.id("users"),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    newLevel: v.optional(v.number()),
    lootboxes: v.optional(v.array(v.any())),
  }),
  handler: async (ctx, { userId }) => {
    try {
      const user = await ctx.runQuery(api.functions.users.getById, { id: userId });
      if (!user) {
        return { success: false, message: 'Пользователь не найден' };
      }

      const currentLevel = (user as any).level || 1;
      const nextLevel = currentLevel + 1;

      // Check level group completion
      const groupCheck = await ctx.runQuery(internal.functions.progress.checkLevelGroupCompletionInternal, {
        userId,
        level: currentLevel,
      });

      if (!(groupCheck as any).isCompleted) {
        return {
          success: false,
          message: (groupCheck as any).message || `Для повышения уровня необходимо завершить все задания группы уровня ${currentLevel}`,
        };
      }

      const nowIso = new Date().toISOString();
      
      // Update user level
      await ctx.runMutation(api.functions.users.patchById, {
        id: userId,
        patch: { level: nextLevel, updatedAt: nowIso } as any,
      });

      // Sync user_levels
      const currentLevelData = await ctx.runQuery(api.functions.progress.getUserLevel, { userId });
      await ctx.runMutation(api.functions.progress.upsertUserLevel, {
        userId: userId as any,
        level: nextLevel,
        exp: (currentLevelData as any)?.exp || (user as any).exp || 0,
        expToNextLevel: nextLevel * 100,
        leveledUpAt: nowIso,
        createdAt: (currentLevelData as any)?.createdAt || nowIso,
        updatedAt: nowIso,
      } as any);

      return {
        success: true,
        message: `Поздравляем! Уровень повышен до ${nextLevel} за завершение группы "${(groupCheck as any).groupName}"!`,
        newLevel: nextLevel,
      };
    } catch (error: any) {
      console.error('Error leveling up user:', error);
      return {
        success: false,
        message: 'Ошибка при повышении уровня: ' + (error.message || String(error)),
      };
    }
  },
});

