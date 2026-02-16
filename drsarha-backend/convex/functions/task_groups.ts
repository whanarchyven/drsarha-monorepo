import { query, mutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { taskGroupDoc, taskGroupFields } from "../models/taskGroup";
import { internal, api } from "../_generated/api";

export const getAll = query({ args: {}, returns: v.array(taskGroupDoc), handler: async ({ db }) => (db as any).query("task_groups").collect() });

export const getById = query({ args: { id: v.id("task_groups") }, returns: v.union(taskGroupDoc, v.null()), handler: async ({ db }, { id }) => db.get(id) });

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

