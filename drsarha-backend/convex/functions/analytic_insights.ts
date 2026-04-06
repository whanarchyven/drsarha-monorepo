import { internalMutation, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import {
  analyticsSummaryRange,
  analyticsSummaryResult,
  cleanupAnalyticsValue,
  getRangeBounds,
  normalizeAnalyticsValue,
  summarizeAnalyticsResponses,
} from "../helpers/analytics";
import { analyticInsightDoc, analyticInsightFields } from "../models/analyticInsight";
import { analyticQuestionDoc } from "../models/analyticQuestion";

const analyticInsightsListResponse = v.object({
  items: v.array(analyticInsightDoc),
  total: v.number(),
  page: v.number(),
  totalPages: v.number(),
  hasMore: v.boolean(),
});

const analyticQuestionSummaryResponse = v.object({
  question: analyticQuestionDoc,
  results: v.array(analyticsSummaryResult),
  totalInsights: v.number(),
  range: analyticsSummaryRange,
});

async function listInsightsForQuestion(
  db: any,
  questionId: any,
  startDate?: number,
  endDate?: number,
) {
  if (startDate !== undefined || endDate !== undefined) {
    const { start, end } = getRangeBounds(startDate, endDate);
    return await db
      .query("analytic_insights")
      .withIndex("by_question_timestamp", (q: any) =>
        q.eq("question_id", questionId).gte("timestamp", start).lte("timestamp", end),
      )
      .collect();
  }

  return await db
    .query("analytic_insights")
    .withIndex("by_question", (q: any) => q.eq("question_id", questionId))
    .collect();
}

export async function buildQuestionSummary(
  db: any,
  questionId: any,
  startDate?: number,
  endDate?: number,
) {
  const question = await db.get(questionId);
  if (!question) {
    throw new Error("Analytic question not found");
  }

  const [insights, rewrites] = await Promise.all([
    listInsightsForQuestion(db, questionId, startDate, endDate),
    db
      .query("analytic_rewrites")
      .withIndex("by_question", (q: any) => q.eq("question_id", questionId))
      .collect(),
  ]);

  const summary = summarizeAnalyticsResponses(question, insights, rewrites);

  return {
    question,
    results: summary.results,
    totalInsights: summary.totalInsights,
    range:
      startDate !== undefined || endDate !== undefined
        ? { start_date: startDate, end_date: endDate }
        : null,
  };
}

export const list = query({
  args: {
    question_id: v.optional(v.id("analytic_questions")),
    user_id: v.optional(v.string()),
    type: v.optional(analyticInsightFields.type),
    start_date: v.optional(v.number()),
    end_date: v.optional(v.number()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: analyticInsightsListResponse,
  handler: async (
    { db },
    { question_id, user_id, type, start_date, end_date, page = 1, limit = 50 },
  ) => {
    let items = question_id
      ? await listInsightsForQuestion(db as any, question_id, start_date, end_date)
      : await db.query("analytic_insights").collect();

    if (!question_id && (start_date !== undefined || end_date !== undefined)) {
      items = items.filter((item) => {
        const afterStart = start_date === undefined || item.timestamp >= start_date;
        const beforeEnd = end_date === undefined || item.timestamp <= end_date;
        return afterStart && beforeEnd;
      });
    }

    if (user_id) {
      items = items.filter((item) => item.user_id === user_id);
    }

    if (type) {
      items = items.filter((item) => item.type === type);
    }

    items.sort((a, b) => b.timestamp - a.timestamp);

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
  args: {
    question_id: v.id("analytic_questions"),
    start_date: v.optional(v.number()),
    end_date: v.optional(v.number()),
  },
  returns: v.array(analyticInsightDoc),
  handler: async ({ db }, { question_id, start_date, end_date }) => {
    const items = await listInsightsForQuestion(
      db as any,
      question_id,
      start_date,
      end_date,
    );
    items.sort((a, b) => b.timestamp - a.timestamp);
    return items;
  },
});

export const summaryByQuestion = query({
  args: {
    question_id: v.id("analytic_questions"),
    start_date: v.optional(v.number()),
    end_date: v.optional(v.number()),
  },
  returns: analyticQuestionSummaryResponse,
  handler: async ({ db }, { question_id, start_date, end_date }) => {
    return await buildQuestionSummary(db as any, question_id, start_date, end_date);
  },
});

export const getById = query({
  args: { id: v.id("analytic_insights") },
  returns: v.union(analyticInsightDoc, v.null()),
  handler: async ({ db }, { id }) => {
    return await db.get(id);
  },
});

export const insert = mutation({
  args: v.object({
    question_id: analyticInsightFields.question_id,
    user_id: analyticInsightFields.user_id,
    response: analyticInsightFields.response,
    type: analyticInsightFields.type,
    timestamp: v.optional(v.number()),
  }),
  returns: analyticInsightDoc,
  handler: async ({ db }, args) => {
    const response = cleanupAnalyticsValue(args.response);
    if (!response) {
      throw new Error("Insight response is required");
    }

    const id = await db.insert("analytic_insights", {
      question_id: args.question_id,
      user_id: args.user_id,
      response,
      responseNormalized: normalizeAnalyticsValue(response),
      type: args.type,
      timestamp: args.timestamp ?? Date.now(),
    });

    return (await db.get(id))!;
  },
});

export const createManyInternal = internalMutation({
  args: {
    items: v.array(
      v.object({
        question_id: analyticInsightFields.question_id,
        user_id: analyticInsightFields.user_id,
        response: analyticInsightFields.response,
        type: analyticInsightFields.type,
        timestamp: v.number(),
      }),
    ),
  },
  returns: v.number(),
  handler: async ({ db }, { items }) => {
    let created = 0;

    for (const item of items) {
      const response = cleanupAnalyticsValue(item.response);
      if (!response) {
        continue;
      }

      await db.insert("analytic_insights", {
        question_id: item.question_id,
        user_id: item.user_id,
        response,
        responseNormalized: normalizeAnalyticsValue(response),
        type: item.type,
        timestamp: item.timestamp,
      });
      created += 1;
    }

    return created;
  },
});

export const update = mutation({
  args: {
    id: v.id("analytic_insights"),
    data: v.object({
      question_id: v.optional(analyticInsightFields.question_id),
      user_id: v.optional(analyticInsightFields.user_id),
      response: v.optional(analyticInsightFields.response),
      type: v.optional(analyticInsightFields.type),
      timestamp: v.optional(v.number()),
      responseNormalized: v.optional(v.string()),
      _id: v.optional(v.id("analytic_insights")),
      _creationTime: v.optional(v.number()),
    }),
  },
  returns: analyticInsightDoc,
  handler: async ({ db }, { id, data }) => {
    const current = await db.get(id);
    if (!current) {
      throw new Error("Insight not found");
    }

    const patch: Record<string, unknown> = {};

    if (data.question_id !== undefined) {
      patch.question_id = data.question_id;
    }

    if (data.user_id !== undefined) {
      patch.user_id = data.user_id;
    }

    if (data.type !== undefined) {
      patch.type = data.type;
    }

    if (data.timestamp !== undefined) {
      patch.timestamp = data.timestamp;
    }

    if (data.response !== undefined) {
      const response = cleanupAnalyticsValue(data.response);
      if (!response) {
        throw new Error("Insight response is required");
      }
      patch.response = response;
      patch.responseNormalized = normalizeAnalyticsValue(response);
    }

    await db.patch(id, patch as any);
    return (await db.get(id))!;
  },
});

export const remove = mutation({
  args: { id: v.id("analytic_insights") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return true;
  },
});
