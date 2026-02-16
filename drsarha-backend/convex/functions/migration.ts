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
