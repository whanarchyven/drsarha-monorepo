import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const insertRaw = mutation({
  args: {
    table: v.string(),
    doc: v.any(),
  },
  returns: v.string(),
  handler: async ({ db }, { table, doc }) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw: any = doc ?? {};
      const rest: any = { ...raw };
      // Перестраховка: переносим верхнеуровневый _id -> mongoId (если его нет)
      if (Object.prototype.hasOwnProperty.call(rest, "_id")) {
        let mongoId: string | undefined;
        if (rest._id && typeof rest._id === "object" && typeof rest._id["$oid"] === "string") {
          mongoId = String(rest._id["$oid"]);
        } else if (typeof rest._id === "string") {
          mongoId = rest._id as string;
        }
        delete rest._id;
        if (mongoId && rest.mongoId == null) rest.mongoId = mongoId;
      }
      // сохраняем исходные имена полей (camelCase)
      // вставляем без системного _id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const id = await (db as any).insert(table, rest as any);
      return String(id);
    } catch (error: any) {
      // Логируем детали ошибки для отладки
      const errorDetails: any = {
        table,
        errorMessage: error?.message || String(error),
        errorName: error?.name,
      };
      
      // Пытаемся извлечь информацию о валидации из ошибки
      if (error?.message) {
        errorDetails.validationError = error.message;
      }
      
      // Логируем ключевые поля документа для отладки (первые 5 ключей)
      const docKeys = Object.keys(doc || {}).slice(0, 5);
      errorDetails.docKeys = docKeys;
      
      console.error(`[insertRaw] Ошибка при вставке в таблицу ${table}:`, JSON.stringify(errorDetails, null, 2));
      
      // Пробрасываем ошибку дальше с дополнительной информацией
      throw new Error(`Ошибка валидации для таблицы ${table}: ${error?.message || String(error)}`);
    }
  },
});

export const patchById = mutation({
  args: {
    table: v.string(),
    id: v.string(),
    data: v.any(),
  },
  returns: v.boolean(),
  handler: async ({ db }, { table, id, data }) => {
    // Нормализация lootboxes.items к массиву при rewrite
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patchData: any = { ...(data as any) };
    if (table === "lootboxes" && patchData && patchData.items && !Array.isArray(patchData.items)) {
      if (Array.isArray(patchData.items.objectId)) {
        patchData.items = patchData.items.objectId;
      }
    }
    // Нормализация task_groups.reward.items к массиву при rewrite
    if (
      table === "task_groups" &&
      patchData &&
      patchData.reward &&
      typeof patchData.reward === "object" &&
      !Array.isArray(patchData.reward)
    ) {
      const rewardObj = patchData.reward as any;
      if (rewardObj.items && !Array.isArray(rewardObj.items)) {
        if (Array.isArray((rewardObj.items as any).objectId)) {
          rewardObj.items = (rewardObj.items as any).objectId;
          patchData.reward = rewardObj;
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).patch(id as any, patchData as any);
    return true;
  },
});

export const listAllPaged = query({
  args: {
    table: v.string(),
    limit: v.number(),
    cursor: v.optional(v.string()),
  },
  returns: v.object({
    items: v.array(v.any()),
    cursor: v.union(v.string(), v.null()),
    isDone: v.boolean(),
  }),
  handler: async ({ db }, { table, limit, cursor }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = (db as any).query(table);
    const page = await q.paginate({ numItems: limit, cursor: cursor ?? null });
    return {
      items: page.page,
      cursor: page.continueCursor ?? null,
      isDone: page.isDone,
    };
  },
});

export const idMapByMongoId = query({
  args: { table: v.string() },
  returns: v.array(v.object({ mongoId: v.string(), id: v.string() })),
  handler: async ({ db }, { table }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const all = await (db as any).query(table).collect();
    return all
      .filter((d: any) => typeof d.mongoId === "string")
      .map((d: any) => ({ mongoId: d.mongoId as string, id: String(d._id) }));
  },
});

export const removeFieldById = mutation({
  args: {
    table: v.string(),
    id: v.string(),
    field: v.string(),
  },
  returns: v.boolean(),
  handler: async ({ db }, { table, id, field }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = await (db as any).get(id as any);
    if (!doc) return false;
    const { _id, _creationTime, ...rest } = doc;
    // Remove field (top-level only)
    // If nested removal needed, use rewrite before calling replace
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (rest as any)[field];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).replace(id as any, rest as any);
    return true;
  },
});

export const truncateTable = mutation({
  args: { table: v.string(), batchSize: v.optional(v.number()) },
  returns: v.number(),
  handler: async ({ db }, { table, batchSize = 200 }) => {
    let deleted = 0;
    // Выполняем только один батч за вызов, чтобы не превысить лимит чтений
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = await (db as any).query(table).take(batchSize);
    for (const doc of page) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db as any).delete(doc._id);
      deleted++;
    }
    return deleted;
  },
});

/** Границы календарного дня UTC: [startMs, endMs) */
function utcDayBoundsMs(year: number, month: number, day: number) {
  const startMs = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  const endMs = Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0);
  return { startMs, endMs };
}

const analyticsCleanupDayArgs = v.object({
  /** По умолчанию 2026-04-08 UTC (день проблемной миграции). */
  year: v.optional(v.number()),
  month: v.optional(v.number()),
  day: v.optional(v.number()),
});

const analyticsCleanupDayResult = v.object({
  analytic_insights: v.number(),
  analytic_rewrites: v.number(),
  companies: v.number(),
  company_groups: v.number(),
  analytic_questions: v.number(),
  startMs: v.number(),
  endMs: v.number(),
});

async function countDocsInUtcDay(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  table: string,
  startMs: number,
  endMs: number,
) {
  let count = 0;
  let cursor: string | null = null;
  while (true) {
    const page = await db.query(table).paginate({ numItems: 400, cursor });
    for (const doc of page.page) {
      if (doc._creationTime >= startMs && doc._creationTime < endMs) {
        count += 1;
      }
    }
    if (page.isDone) break;
    cursor = page.continueCursor ?? null;
  }
  return count;
}

/**
 * ВРЕМЕННО: только подсчёт документов с `_creationTime` в указанный календарный день UTC.
 * Удаление — см. `deleteAnalyticsByCreationUtcDay`.
 */
export const previewDeleteAnalyticsByCreationUtcDay = query({
  args: analyticsCleanupDayArgs,
  returns: analyticsCleanupDayResult,
  handler: async ({ db }, args) => {
    const year = args.year ?? 2026;
    const month = args.month ?? 4;
    const day = args.day ?? 8;
    const { startMs, endMs } = utcDayBoundsMs(year, month, day);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = db as any;
    // Convex: в одной функции нельзя параллелить несколько paginate — только по очереди.
    const analytic_insights = await countDocsInUtcDay(
      d,
      "analytic_insights",
      startMs,
      endMs,
    );
    const analytic_rewrites = await countDocsInUtcDay(
      d,
      "analytic_rewrites",
      startMs,
      endMs,
    );
    const companies = await countDocsInUtcDay(d, "companies", startMs, endMs);
    const company_groups = await countDocsInUtcDay(
      d,
      "company_groups",
      startMs,
      endMs,
    );
    const analytic_questions = await countDocsInUtcDay(
      d,
      "analytic_questions",
      startMs,
      endMs,
    );
    return {
      analytic_insights,
      analytic_rewrites,
      companies,
      company_groups,
      analytic_questions,
      startMs,
      endMs,
    };
  },
});

/**
 * ВРЕМЕННО: удаляет компании, группы компаний, инсайты, вопросы и реврайты, у которых
 * `_creationTime` попадает в указанный календарный день UTC (по умолчанию 2026-04-08).
 *
 * Порядок: insights → rewrites → companies → company_groups → questions (компании
 * ссылаются на group_id; группы — после компаний того же дня).
 *
 * После использования удалите эти экспорты или закройте доступ.
 *
 * Запуск:
 *   npx convex run functions/migration:previewDeleteAnalyticsByCreationUtcDay '{}'
 *   npx convex run functions/migration:deleteAnalyticsByCreationUtcDay '{}'
 */
export const deleteAnalyticsByCreationUtcDay = mutation({
  args: analyticsCleanupDayArgs,
  returns: analyticsCleanupDayResult,
  handler: async ({ db }, args) => {
    const year = args.year ?? 2026;
    const month = args.month ?? 4;
    const day = args.day ?? 8;
    const { startMs, endMs } = utcDayBoundsMs(year, month, day);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = db as any;

    async function collectIds(table: string): Promise<string[]> {
      const ids: string[] = [];
      let cursor: string | null = null;
      while (true) {
        const page = await d.query(table).paginate({ numItems: 400, cursor });
        for (const doc of page.page) {
          if (doc._creationTime >= startMs && doc._creationTime < endMs) {
            ids.push(doc._id);
          }
        }
        if (page.isDone) break;
        cursor = page.continueCursor ?? null;
      }
      return ids;
    }

    async function deleteCollected(table: string): Promise<number> {
      const ids = await collectIds(table);
      for (const id of ids) {
        await d.delete(id);
      }
      return ids.length;
    }

    const analytic_insights = await deleteCollected("analytic_insights");
    const analytic_rewrites = await deleteCollected("analytic_rewrites");
    const companies = await deleteCollected("companies");
    const company_groups = await deleteCollected("company_groups");
    const analytic_questions = await deleteCollected("analytic_questions");

    return {
      analytic_insights,
      analytic_rewrites,
      companies,
      company_groups,
      analytic_questions,
      startMs,
      endMs,
    };
  },
});
