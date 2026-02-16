import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

const knowledgeItem = v.object({ id: v.string(), type: v.string() });
const userSavedKnowledgeDoc = v.object({
  _id: v.id("user_saved_knowledge"),
  _creationTime: v.number(),
  user_id: v.union(v.null(), v.string()),
  knowledge: v.array(knowledgeItem),
  mongoId: v.optional(v.string()),
});

// Get or create user saved knowledge record
export const getByUser = query({
  args: { userId: v.string() },
  returns: v.union(userSavedKnowledgeDoc, v.null()),
  handler: async ({ db }, { userId }) => {
    const hit = await (db as any)
      .query("user_saved_knowledge")
      .filter((q: any) => q.eq(q.field("user_id"), userId))
      .first();
    return hit ?? null;
  },
});

// Save or toggle knowledge
export const saveKnowledge = mutation({
  args: { userId: v.string(), knowledgeId: v.string(), type: v.string() },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async ({ db }, { userId, knowledgeId, type }) => {
    let record = await (db as any)
      .query("user_saved_knowledge")
      .filter((q: any) => q.eq(q.field("user_id"), userId))
      .first();

    if (!record) {
      // Create new record
      await db.insert("user_saved_knowledge", {
        user_id: userId,
        knowledge: [{ id: knowledgeId, type }],
        mongoId: "",
      } as any);
      return { success: true, message: "Знание сохранено" };
    }

    // Check if already saved
    const existing = (record.knowledge || []).find(
      (k: any) => k.id === knowledgeId && k.type === type
    );

    if (existing) {
      // Remove it (toggle)
      const updated = (record.knowledge || []).filter(
        (k: any) => !(k.id === knowledgeId && k.type === type)
      );
      await db.patch(record._id, { knowledge: updated } as any);
      return { success: true, message: "Знание удалено из сохраненных" };
    } else {
      // Add it
      const updated = [...(record.knowledge || []), { id: knowledgeId, type }];
      await db.patch(record._id, { knowledge: updated } as any);
      return { success: true, message: "Знание сохранено" };
    }
  },
});

// Get user knowledge list
export const getUserKnowledge = query({
  args: { userId: v.string() },
  returns: v.object({ saved_knowledge: v.array(knowledgeItem) }),
  handler: async ({ db }, { userId }) => {
    const record = await (db as any)
      .query("user_saved_knowledge")
      .filter((q: any) => q.eq(q.field("user_id"), userId))
      .first();

    if (!record || !record.knowledge || record.knowledge.length === 0) {
      return { saved_knowledge: [] };
    }

    return { saved_knowledge: record.knowledge };
  },
});

// Get user knowledge with full details
export const getUserKnowledgeFull = query({
  args: { userId: v.string() },
  returns: v.object({ saved_knowledge: v.array(v.any()) }),
  handler: async (ctx, { userId }) => {
    const record = await (ctx.db as any)
      .query("user_saved_knowledge")
      .filter((q: any) => q.eq(q.field("user_id"), userId))
      .first();

    if (!record || !record.knowledge || record.knowledge.length === 0) {
      return { saved_knowledge: [] };
    }

    // Fetch full knowledge details by type
    const savedKnowledgeWithDetails = await Promise.all(
      record.knowledge.map(async (item: { id: string; type: string }) => {
        try {
          let knowledgeItem = null;
          switch (item.type) {
            case "lection":
              knowledgeItem = await ctx.runQuery(
                internal.functions.user_completions.fetchKnowledgeByType,
                { type: item.type, id: item.id as any }
              );
              break;
            case "clinic_task":
              knowledgeItem = await ctx.runQuery(
                internal.functions.user_completions.fetchKnowledgeByType,
                { type: item.type, id: item.id as any }
              );
              break;
            case "interactive_task":
              knowledgeItem = await ctx.runQuery(
                internal.functions.user_completions.fetchKnowledgeByType,
                { type: item.type, id: item.id as any }
              );
              break;
            case "interactive_quiz":
              knowledgeItem = await ctx.runQuery(
                internal.functions.user_completions.fetchKnowledgeByType,
                { type: item.type, id: item.id as any }
              );
              break;
            case "interactive_match":
              knowledgeItem = await ctx.runQuery(
                internal.functions.user_completions.fetchKnowledgeByType,
                { type: item.type, id: item.id as any }
              );
              break;
            case "brochure":
              knowledgeItem = await ctx.runQuery(
                internal.functions.user_completions.fetchKnowledgeByType,
                { type: item.type, id: item.id as any }
              );
              break;
            case "clinic_atlas":
              knowledgeItem = await ctx.runQuery(
                internal.functions.user_completions.fetchKnowledgeByType,
                { type: item.type, id: item.id as any }
              );
              break;
            default:
              knowledgeItem = null;
          }

          if (knowledgeItem) {
            return {
              ...knowledgeItem,
              type: item.type,
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching knowledge ${item.id}:`, error);
          return null;
        }
      })
    );

    const filtered = savedKnowledgeWithDetails.filter((item) => item !== null);
    return { saved_knowledge: filtered };
  },
});

// Delete knowledge
export const deleteKnowledge = mutation({
  args: { userId: v.string(), knowledgeId: v.string(), type: v.string() },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async ({ db }, { userId, knowledgeId, type }) => {
    const record = await (db as any)
      .query("user_saved_knowledge")
      .filter((q: any) => q.eq(q.field("user_id"), userId))
      .first();

    if (!record) {
      return { success: false, message: "Записи о сохраненных знаниях не найдены" };
    }

    const updated = (record.knowledge || []).filter(
      (k: any) => !(k.id === knowledgeId && k.type === type)
    );

    if (updated.length === record.knowledge.length) {
      return { success: false, message: "Знание не найдено или уже удалено" };
    }

    await db.patch(record._id, { knowledge: updated } as any);
    return { success: true, message: "Знание успешно удалено из сохраненных" };
  },
});

