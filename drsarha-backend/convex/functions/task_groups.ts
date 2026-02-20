import { query, mutation, internalQuery, action } from "../_generated/server";
import { v } from "convex/values";
import { taskGroupDoc, taskGroupFields } from "../models/taskGroup";
import { internal, api } from "../_generated/api";

export const getAll = query({ args: {}, returns: v.array(taskGroupDoc), handler: async ({ db }) => (db as any).query("task_groups").collect() });

export const getById = query({ args: { id: v.id("task_groups") }, returns: v.union(taskGroupDoc, v.null()), handler: async ({ db }, { id }) => db.get(id) });

export const getByTimeTypeAndStartDate = query({
  args: { timeType: v.string(), startDate: v.string() },
  returns: v.union(taskGroupDoc, v.null()),
  handler: async ({ db }, { timeType, startDate }) => {
    const items = await (db as any)
      .query("task_groups")
      .withIndex("by_time", (q: any) => q.eq("timeType", timeType))
      .collect();
    const hit = items.find((g: any) => g.startDate === startDate);
    return hit ?? null;
  },
});

export const getByDate = query({
  args: { date: v.string() },
  returns: v.object({
    daily: v.array(taskGroupDoc),
    weekly: v.array(taskGroupDoc),
    level: v.array(taskGroupDoc),
  }),
  handler: async ({ db }, { date }) => {
    const all: any[] = await (db as any).query("task_groups").collect();
    const targetDay = new Date(date).toISOString().slice(0, 10);
    const day = (iso: string) => new Date(iso).toISOString().slice(0, 10);

    const filtered = all.filter((g) => {
      if (!g.startDate || !g.endDate) return true;
      const start = day(g.startDate);
      const end = day(g.endDate);
      return start <= targetDay && targetDay <= end;
    });

    return {
      daily: filtered.filter((g) => g.timeType === "daily"),
      weekly: filtered.filter((g) => g.timeType === "weekly"),
      level: filtered.filter((g) => g.timeType === "level"),
    };
  },
});

export const listActive = query({
  args: { 
    date: v.optional(v.string()),
    userId: v.optional(v.union(v.id("users"), v.string())),
    userLevel: v.optional(v.number()),
  },
  returns: v.array(taskGroupDoc),
  handler: async (ctx, { date, userId, userLevel }) => {
    const all: any[] = await (ctx.db as any).query("task_groups").collect();
    const now = date ? new Date(date) : new Date();

    // Получаем уровень пользователя, если userId передан, но userLevel не указан
    let actualUserLevel: number | null = null;
    if (userId && userLevel === undefined) {
      const userLevelDoc = await ctx.runQuery(api.functions.progress.getUserLevel, { userId: userId as any });
      actualUserLevel = (userLevelDoc as any)?.level || 1;
    } else if (userLevel !== undefined) {
      actualUserLevel = userLevel;
    }

    // Фильтруем группы с учетом всех условий
    return all.filter((g) => {
      if (!g.isActive) return false;
      
      // Проверка дат
      const startOk = !g.startDate || new Date(g.startDate) <= now;
      const endOk = !g.endDate || new Date(g.endDate) >= now;
      if (!startOk || !endOk) return false;

      // Проверка типа группы и уровня пользователя
      if (g.timeType === 'level') {
        // Для групп уровня - проверяем соответствие уровня пользователя
        return actualUserLevel !== null && g.level === actualUserLevel;
      }
      
      // Для daily и weekly групп - возвращаем их
      return g.timeType === 'daily' || g.timeType === 'weekly';
    });
  },
});

// Internal versions for use in internal mutations
export const listActiveInternal = internalQuery({
  args: { date: v.optional(v.string()) },
  returns: v.array(taskGroupDoc),
  handler: async ({ db }, { date }) => {
    const all: any[] = await (db as any).query("task_groups").collect();
    const targetDay = (date ? new Date(date) : new Date()).toISOString().slice(0, 10);
    const day = (iso: string) => new Date(iso).toISOString().slice(0, 10);

    return all.filter((g) => {
      if (!g.isActive) return false;
      const start = day(g.startDate);
      const end = day(g.endDate);
      return start <= targetDay && targetDay <= end;
    });
  },
});

export const getByIdInternal = internalQuery({
  args: { id: v.id("task_groups") },
  returns: v.union(taskGroupDoc, v.null()),
  handler: async ({ db }, { id }) => db.get(id),
});

export const create = mutation({ args: v.object(taskGroupFields), returns: taskGroupDoc, handler: async ({ db }, args) => { const _id = await db.insert("task_groups", args as any); return (await db.get(_id))!; } });

export const update = mutation({ args: { id: v.id("task_groups"), patch: v.object(Object.fromEntries(Object.entries(taskGroupFields).map(([k, val]) => [k, (val as any).optional ? (val as any) : v.optional(val as any)]))) }, returns: taskGroupDoc, handler: async ({ db }, { id, patch }) => { await db.patch(id, patch as any); return (await db.get(id))!; } });

export const remove = mutation({ args: { id: v.id("task_groups") }, returns: v.boolean(), handler: async ({ db }, { id }) => { await db.delete(id); return true; } });

// removeWithCascade удалён по требованию: деактивация вместо удаления зависимостей

export const seedByDateRange = action({
  args: { startDate: v.string(), endDate: v.string() },
  returns: v.object({
    createdDaily: v.number(),
    createdWeekly: v.number(),
    skippedDaily: v.number(),
    skippedWeekly: v.number(),
  }),
  handler: async (ctx, { startDate, endDate }) => {
    const toDate = (s: string) => new Date(`${s}T00:00:00.000Z`);
    const toIsoDayStart = (d: Date) =>
      new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)).toISOString();
    const toIsoDayEnd = (d: Date) =>
      new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 0)).toISOString();
    const formatRu = (d: Date) => {
      const dd = String(d.getUTCDate()).padStart(2, "0");
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
      const yyyy = d.getUTCFullYear();
      return `${dd}.${mm}.${yyyy}`;
    };

    const start = toDate(startDate);
    const end = toDate(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error("Invalid date range");
    }

    const dailyTasks = [
      {
        title: "Создай пин",
        description: "Создай новый пин",
        actionType: "create_pin",
        targetAmount: 1,
        rewardStars: 25,
        rewardExp: 50,
      },
      {
        title: "Поставь лайк",
        description: "Поставь лайк на пин",
        actionType: "like_pin",
        targetAmount: 3,
        rewardStars: 20,
        rewardExp: 40,
      },
      {
        title: "Оставь комментарий",
        description: "Оставь комментарий под пином",
        actionType: "create_comment",
        targetAmount: 1,
        rewardStars: 20,
        rewardExp: 40,
      },
      {
        title: "Создай папку",
        description: "Создай новую папку",
        actionType: "create_folder",
        targetAmount: 1,
        rewardStars: 30,
        rewardExp: 60,
      },
    ];

    const weeklyTasks = [
      {
        title: "Создай 5 пинов",
        description: "Создай 5 новых пинов",
        actionType: "create_pin",
        targetAmount: 5,
        rewardStars: 50,
        rewardExp: 100,
      },
      {
        title: "Поставь 20 лайков",
        description: "Поставь 20 лайков на пины",
        actionType: "like_pin",
        targetAmount: 20,
        rewardStars: 40,
        rewardExp: 80,
      },
      {
        title: "Оставь 10 комментариев",
        description: "Оставь 10 комментариев",
        actionType: "create_comment",
        targetAmount: 10,
        rewardStars: 30,
        rewardExp: 60,
      },
      {
        title: "Создай 3 папки",
        description: "Создай 3 новые папки",
        actionType: "create_folder",
        targetAmount: 3,
        rewardStars: 60,
        rewardExp: 120,
      },
      {
        title: "Пригласи друга",
        description: "Пригласи нового пользователя",
        actionType: "invite_user",
        targetAmount: 1,
        rewardStars: 100,
        rewardExp: 200,
      },
    ];

    let createdDaily = 0;
    let createdWeekly = 0;
    let skippedDaily = 0;
    let skippedWeekly = 0;

    const nowIso = new Date().toISOString();

    // Daily groups
    for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      const startIso = toIsoDayStart(cursor);
      const endIso = toIsoDayEnd(cursor);
      const dateRu = formatRu(cursor);
      const existing = await ctx.runQuery(api.functions.task_groups.getByTimeTypeAndStartDate, {
        timeType: "daily",
        startDate: startIso,
      });
      if (existing) {
        skippedDaily++;
        continue;
      }

      const group = await ctx.runMutation(api.functions.task_groups.create, {
        name: `Ежедневные задания ${dateRu}`,
        description: `Ежедневные задания на ${dateRu}`,
        startDate: startIso,
        endDate: endIso,
        timeType: "daily",
        reward: {
          items: [{ type: "stars", amount: 30, title: "Звезды за выполнение" }],
        },
        level: null,
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as any);

      for (const task of dailyTasks) {
        await ctx.runMutation(api.functions.tasks.create, {
          title: task.title,
          description: task.description,
          groupId: group._id,
          actionType: task.actionType,
          config: {
            targetAmount: task.targetAmount,
            knowledgeRef: (task as any).knowledgeRef ?? null,
            knowledgeType: (task as any).knowledgeType ?? null,
          },
          reward: {
            stars: task.rewardStars,
            exp: task.rewardExp,
          },
          isActive: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        } as any);
      }
      createdDaily++;
    }

    // Weekly groups: 7-day windows from startDate
    for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 7)) {
      const weekStart = new Date(cursor);
      const weekEnd = new Date(cursor);
      weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
      if (weekEnd > end) {
        weekEnd.setTime(end.getTime());
      }

      const startIso = toIsoDayStart(weekStart);
      const endIso = toIsoDayEnd(weekEnd);
      const weekStartStr = startIso.slice(0, 10);
      const weekEndStr = endIso.slice(0, 10);
      const existing = await ctx.runQuery(api.functions.task_groups.getByTimeTypeAndStartDate, {
        timeType: "weekly",
        startDate: startIso,
      });
      if (existing) {
        skippedWeekly++;
        continue;
      }

      const group = await ctx.runMutation(api.functions.task_groups.create, {
        name: `Еженедельные задания (${weekStartStr} - ${weekEndStr})`,
        description: `Еженедельные задания на неделю ${weekStartStr} - ${weekEndStr}`,
        startDate: startIso,
        endDate: endIso,
        timeType: "weekly",
        reward: {
          items: [{ type: "stars", amount: 100, title: "Звезды за выполнение" }],
        },
        level: null,
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as any);

      for (const task of weeklyTasks) {
        await ctx.runMutation(api.functions.tasks.create, {
          title: task.title,
          description: task.description,
          groupId: group._id,
          actionType: task.actionType,
          config: {
            targetAmount: task.targetAmount,
            knowledgeRef: (task as any).knowledgeRef ?? null,
            knowledgeType: (task as any).knowledgeType ?? null,
          },
          reward: {
            stars: task.rewardStars,
            exp: task.rewardExp,
          },
          isActive: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        } as any);
      }
      createdWeekly++;
    }

    return { createdDaily, createdWeekly, skippedDaily, skippedWeekly };
  },
});

