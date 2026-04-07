import { internalQuery, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import {
  cleanupAnalyticsValue,
  normalizeAnalyticsValue,
} from "../helpers/analytics";
import {
  analyticRewriteDoc,
  analyticRewriteFields,
} from "../models/analyticRewrite";

const analyticRewritesListResponse = v.object({
  items: v.array(analyticRewriteDoc),
  total: v.number(),
  page: v.number(),
  totalPages: v.number(),
  hasMore: v.boolean(),
});

const rewritePairValidator = v.object({
  rewrite_value: v.string(),
  rewrite_target: v.string(),
});

/** Для action-сборки summary: только пары значений, без лишних полей. */
export const listMinimalByQuestionInternal = internalQuery({
  args: { question_id: v.id("analytic_questions") },
  returns: v.array(rewritePairValidator),
  handler: async ({ db }, { question_id }) => {
    const items = await db
      .query("analytic_rewrites")
      .withIndex("by_question", (q) => q.eq("question_id", question_id))
      .collect();
    return items.map((r) => ({
      rewrite_value: r.rewrite_value,
      rewrite_target: r.rewrite_target,
    }));
  },
});

async function ensureRewriteUniqueness(
  db: any,
  questionId: any,
  rewriteValueNormalized: string,
  currentId?: any,
) {
  const existing = await db
    .query("analytic_rewrites")
    .withIndex("by_question_and_value", (q: any) =>
      q
        .eq("question_id", questionId)
        .eq("rewrite_value_normalized", rewriteValueNormalized),
    )
    .unique();

  if (existing && String(existing._id) !== String(currentId ?? "")) {
    throw new Error("Rewrite for this value already exists");
  }
}

export const list = query({
  args: {
    question_id: v.optional(v.id("analytic_questions")),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: analyticRewritesListResponse,
  handler: async ({ db }, { question_id, page = 1, limit = 50 }) => {
    const items = question_id
      ? await db
          .query("analytic_rewrites")
          .withIndex("by_question", (q) => q.eq("question_id", question_id))
          .collect()
      : await db.query("analytic_rewrites").collect();

    items.sort((a, b) =>
      a.rewrite_value.localeCompare(b.rewrite_value, "ru"),
    );

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

export const listByQuestion = query({
  args: { question_id: v.id("analytic_questions") },
  returns: v.array(analyticRewriteDoc),
  handler: async ({ db }, { question_id }) => {
    const items = await db
      .query("analytic_rewrites")
      .withIndex("by_question", (q) => q.eq("question_id", question_id))
      .collect();

    items.sort((a, b) => a.rewrite_value.localeCompare(b.rewrite_value, "ru"));
    return items;
  },
});

export const getById = query({
  args: { id: v.id("analytic_rewrites") },
  returns: v.union(analyticRewriteDoc, v.null()),
  handler: async ({ db }, { id }) => {
    return await db.get(id);
  },
});

export const insert = mutation({
  args: v.object({
    question_id: analyticRewriteFields.question_id,
    rewrite_value: analyticRewriteFields.rewrite_value,
    rewrite_target: analyticRewriteFields.rewrite_target,
  }),
  returns: analyticRewriteDoc,
  handler: async ({ db }, args) => {
    const rewriteValue = cleanupAnalyticsValue(args.rewrite_value);
    const rewriteTarget = cleanupAnalyticsValue(args.rewrite_target);

    if (!rewriteValue || !rewriteTarget) {
      throw new Error("rewrite_value and rewrite_target are required");
    }

    const rewriteValueNormalized = normalizeAnalyticsValue(rewriteValue);
    await ensureRewriteUniqueness(
      db,
      args.question_id,
      rewriteValueNormalized,
    );

    const id = await db.insert("analytic_rewrites", {
      question_id: args.question_id,
      rewrite_value: rewriteValue,
      rewrite_value_normalized: rewriteValueNormalized,
      rewrite_target: rewriteTarget,
      rewrite_target_normalized: normalizeAnalyticsValue(rewriteTarget),
    });

    return (await db.get(id))!;
  },
});

export const update = mutation({
  args: {
    id: v.id("analytic_rewrites"),
    data: v.object({
      question_id: v.optional(analyticRewriteFields.question_id),
      rewrite_value: v.optional(analyticRewriteFields.rewrite_value),
      rewrite_target: v.optional(analyticRewriteFields.rewrite_target),
      rewrite_value_normalized: v.optional(v.string()),
      rewrite_target_normalized: v.optional(v.string()),
      _id: v.optional(v.id("analytic_rewrites")),
      _creationTime: v.optional(v.number()),
    }),
  },
  returns: analyticRewriteDoc,
  handler: async ({ db }, { id, data }) => {
    const current = await db.get(id);
    if (!current) {
      throw new Error("Rewrite not found");
    }

    const questionId = data.question_id ?? current.question_id;
    const rewriteValue = cleanupAnalyticsValue(
      data.rewrite_value ?? current.rewrite_value,
    );
    const rewriteTarget = cleanupAnalyticsValue(
      data.rewrite_target ?? current.rewrite_target,
    );

    if (!rewriteValue || !rewriteTarget) {
      throw new Error("rewrite_value and rewrite_target are required");
    }

    const rewriteValueNormalized = normalizeAnalyticsValue(rewriteValue);
    await ensureRewriteUniqueness(db, questionId, rewriteValueNormalized, id);

    await db.patch(id, {
      question_id: questionId,
      rewrite_value: rewriteValue,
      rewrite_value_normalized: rewriteValueNormalized,
      rewrite_target: rewriteTarget,
      rewrite_target_normalized: normalizeAnalyticsValue(rewriteTarget),
    } as any);

    return (await db.get(id))!;
  },
});

export const remove = mutation({
  args: { id: v.id("analytic_rewrites") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return true;
  },
});
