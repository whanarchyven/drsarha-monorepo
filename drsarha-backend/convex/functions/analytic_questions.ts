import { internalQuery, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import {
  cleanupAnalyticsValue,
  normalizeAnalyticsValue,
  sanitizeVariants,
} from "../helpers/analytics";
import {
  analyticQuestionDoc,
  analyticQuestionFields,
} from "../models/analyticQuestion";

const analyticQuestionsListResponse = v.object({
  items: v.array(analyticQuestionDoc),
  total: v.number(),
  page: v.number(),
  totalPages: v.number(),
  hasMore: v.boolean(),
});

async function getAnalyticQuestionByStringId(db: any, id: string) {
  const normalizedId = await db.normalizeId("analytic_questions", id);
  if (!normalizedId) {
    return null;
  }

  return await db.get(normalizedId);
}

export const list = query({
  args: {
    search: v.optional(v.string()),
    id: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: analyticQuestionsListResponse,
  handler: async ({ db }, { search, id, page = 1, limit = 30 }) => {
    let items = await db.query("analytic_questions").collect();

    if (id) {
      items = items.filter((item) => String(item._id) === id);
    }

    if (search) {
      const normalizedSearch = normalizeAnalyticsValue(search);
      items = items.filter(
        (item) =>
          String(item._id) === search ||
          item.textNormalized.includes(normalizedSearch),
      );
    }

    items.sort((a, b) => a.text.localeCompare(b.text, "ru"));

    const total = items.length;
    const from = (page - 1) * limit;
    const pagedItems = items.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: pagedItems,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  },
});

export const getById = query({
  args: { id: v.string() },
  returns: v.union(analyticQuestionDoc, v.null()),
  handler: async ({ db }, { id }) => {
    return await getAnalyticQuestionByStringId(db as any, id);
  },
});

export const getByIdsInternal = internalQuery({
  args: { ids: v.array(v.id("analytic_questions")) },
  returns: v.array(v.union(analyticQuestionDoc, v.null())),
  handler: async ({ db }, { ids }) => {
    return await Promise.all(ids.map((id) => db.get(id)));
  },
});

export const resolveQuestionIdsInternal = internalQuery({
  args: { ids: v.array(v.string()) },
  returns: v.array(v.union(v.id("analytic_questions"), v.null())),
  handler: async ({ db }, { ids }) => {
    return await Promise.all(
      ids.map((id) => (db as any).normalizeId("analytic_questions", id)),
    );
  },
});

export const insert = mutation({
  args: v.object({
    text: analyticQuestionFields.text,
    type: analyticQuestionFields.type,
    variants: analyticQuestionFields.variants,
  }),
  returns: analyticQuestionDoc,
  handler: async ({ db }, args) => {
    const text = cleanupAnalyticsValue(args.text);
    if (!text) {
      throw new Error("Question text is required");
    }

    const id = await db.insert("analytic_questions", {
      text,
      textNormalized: normalizeAnalyticsValue(text),
      type: args.type,
      variants: sanitizeVariants(args.variants),
    });

    return (await db.get(id))!;
  },
});

export const update = mutation({
  args: {
    id: v.id("analytic_questions"),
    data: v.object({
      text: v.optional(analyticQuestionFields.text),
      type: v.optional(analyticQuestionFields.type),
      variants: v.optional(analyticQuestionFields.variants),
      _id: v.optional(v.id("analytic_questions")),
      _creationTime: v.optional(v.number()),
      textNormalized: v.optional(v.string()),
    }),
  },
  returns: analyticQuestionDoc,
  handler: async ({ db }, { id, data }) => {
    const patch: Record<string, unknown> = {};

    if (data.text !== undefined) {
      const text = cleanupAnalyticsValue(data.text);
      if (!text) {
        throw new Error("Question text is required");
      }
      patch.text = text;
      patch.textNormalized = normalizeAnalyticsValue(text);
    }

    if (data.type !== undefined) {
      patch.type = data.type;
    }

    if (data.variants !== undefined) {
      patch.variants = sanitizeVariants(data.variants);
    }

    await db.patch(id, patch as any);
    return (await db.get(id))!;
  },
});

export const remove = mutation({
  args: { id: v.id("analytic_questions") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return true;
  },
});
