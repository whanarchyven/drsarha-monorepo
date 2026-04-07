import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { v } from "convex/values";
import {
  analyticsSummaryRange,
  analyticsSummaryResult,
  getRangeBounds,
  normalizeInsightResponseForStorage,
  summarizeAnalyticsResponses,
} from "../helpers/analytics";
import {
  DEFAULT_AUTO_SPECIALTY_WEIGHTS,
  pickWeightedSpecialty,
  resolveUserSpecialtyFromDb,
} from "../helpers/insightSpecialty";
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

const insightSummaryRowValidator = v.object({
  response: v.union(v.string(), v.number()),
  specialty: v.optional(v.string()),
});

/**
 * Одна страница инсайтов для агрегации summary в action (каждый вызов — отдельный лимит чтений Convex).
 */
export const insightsSummaryPageInternal = internalQuery({
  args: {
    question_id: v.id("analytic_questions"),
    start_date: v.optional(v.number()),
    end_date: v.optional(v.number()),
    cursor: v.union(v.string(), v.null()),
    limit: v.number(),
  },
  returns: v.object({
    items: v.array(insightSummaryRowValidator),
    cursor: v.union(v.string(), v.null()),
    isDone: v.boolean(),
  }),
  handler: async ({ db }, { question_id, start_date, end_date, cursor, limit }) => {
    const numItems = Math.min(4000, Math.max(1, Math.floor(limit)));

    if (start_date !== undefined || end_date !== undefined) {
      const { start, end } = getRangeBounds(start_date, end_date);
      const page = await (db as any)
        .query("analytic_insights")
        .withIndex("by_question_timestamp", (q: any) =>
          q.eq("question_id", question_id).gte("timestamp", start).lte("timestamp", end),
        )
        .paginate({ numItems, cursor: cursor ?? null });

      return {
        items: page.page.map((row: Doc<"analytic_insights">) => ({
          response: row.response,
          specialty: row.specialty,
        })),
        cursor: page.continueCursor ?? null,
        isDone: page.isDone,
      };
    }

    const page = await (db as any)
      .query("analytic_insights")
      .withIndex("by_question", (q: any) => q.eq("question_id", question_id))
      .paginate({ numItems, cursor: cursor ?? null });

    return {
      items: page.page.map((row: Doc<"analytic_insights">) => ({
        response: row.response,
        specialty: row.specialty,
      })),
      cursor: page.continueCursor ?? null,
      isDone: page.isDone,
    };
  },
});

export async function buildQuestionSummary(
  db: any,
  questionId: any,
  startDate?: number,
  endDate?: number,
  options?: { onlyUserResponses?: boolean },
) {
  const question = await db.get(questionId);
  if (!question) {
    throw new Error("Analytic question not found");
  }

  const [rawInsights, rewrites] = await Promise.all([
    listInsightsForQuestion(db, questionId, startDate, endDate),
    db
      .query("analytic_rewrites")
      .withIndex("by_question", (q: any) => q.eq("question_id", questionId))
      .collect(),
  ]);

  const insights = options?.onlyUserResponses
    ? rawInsights.filter((row: { type?: string }) => row.type === "user")
    : rawInsights;

  const summary = summarizeAnalyticsResponses(
    question,
    insights.map((row: { response: string | number; specialty?: string }) => ({
      response: row.response,
      specialty: row.specialty,
    })),
    rewrites,
  );

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
    /** Только инсайты type:user (для админки) */
    only_user_responses: v.optional(v.boolean()),
  },
  returns: analyticQuestionSummaryResponse,
  handler: async ({ db }, { question_id, start_date, end_date, only_user_responses }) => {
    return await buildQuestionSummary(db as any, question_id, start_date, end_date, {
      onlyUserResponses: only_user_responses === true,
    });
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
    specialty: v.optional(v.string()),
  }),
  returns: analyticInsightDoc,
  handler: async ({ db }, args) => {
    const question = (await db.get(
      args.question_id,
    )) as Doc<"analytic_questions"> | null;
    if (!question) {
      throw new Error("Analytic question not found");
    }

    const qType = question.type === "numeric" ? "numeric" : "text";
    const normalized = normalizeInsightResponseForStorage(args.response, qType);
    if (!normalized) {
      throw new Error("Insight response is required");
    }

    let specialty =
      args.specialty !== undefined && String(args.specialty).trim() !== ""
        ? String(args.specialty).trim()
        : undefined;

    if (specialty === undefined) {
      if (args.type === "user") {
        specialty = await resolveUserSpecialtyFromDb(db, args.user_id);
      } else {
        specialty = pickWeightedSpecialty(DEFAULT_AUTO_SPECIALTY_WEIGHTS);
      }
    }

    const id = await db.insert("analytic_insights", {
      question_id: args.question_id,
      user_id: args.user_id,
      response: normalized.response,
      responseNormalized: normalized.responseNormalized,
      type: args.type,
      timestamp: args.timestamp ?? Date.now(),
      ...(specialty !== undefined ? { specialty } : {}),
    });

    return (await db.get(id))!;
  },
});

const specialtyWeightEntry = v.object({
  name: v.string(),
  weight: v.number(),
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
        specialty: v.optional(v.string()),
      }),
    ),
    auto_specialty_weights: v.optional(v.array(specialtyWeightEntry)),
  },
  returns: v.number(),
  handler: async ({ db }, { items, auto_specialty_weights }) => {
    let created = 0;
    const typeCache = new Map<string, "numeric" | "text">();
    const userSpecialtyCache = new Map<string, string | undefined>();

    const autoWeights =
      auto_specialty_weights && auto_specialty_weights.length > 0
        ? auto_specialty_weights
        : DEFAULT_AUTO_SPECIALTY_WEIGHTS;

    async function questionType(
      qid: Id<"analytic_questions">,
    ): Promise<"numeric" | "text"> {
      const key = String(qid);
      const cached = typeCache.get(key);
      if (cached) {
        return cached;
      }
      const q = (await db.get(qid)) as Doc<"analytic_questions"> | null;
      const t = q?.type === "numeric" ? "numeric" : "text";
      typeCache.set(key, t);
      return t;
    }

    for (const item of items) {
      const qType = await questionType(item.question_id);
      const normalized = normalizeInsightResponseForStorage(item.response, qType);
      if (!normalized) {
        continue;
      }

      let specialty =
        item.specialty !== undefined && String(item.specialty).trim() !== ""
          ? String(item.specialty).trim()
          : undefined;

      if (specialty === undefined) {
        if (item.type === "user") {
          const uid = item.user_id;
          if (!userSpecialtyCache.has(uid)) {
            userSpecialtyCache.set(
              uid,
              await resolveUserSpecialtyFromDb(db, uid),
            );
          }
          specialty = userSpecialtyCache.get(uid);
        } else {
          specialty = pickWeightedSpecialty(autoWeights);
        }
      }

      await db.insert("analytic_insights", {
        question_id: item.question_id,
        user_id: item.user_id,
        response: normalized.response,
        responseNormalized: normalized.responseNormalized,
        type: item.type,
        timestamp: item.timestamp,
        ...(specialty !== undefined ? { specialty } : {}),
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
      specialty: v.optional(v.string()),
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

    if (data.specialty !== undefined) {
      patch.specialty = data.specialty;
    }

    if (data.response !== undefined) {
      const targetQuestionId =
        data.question_id !== undefined ? data.question_id : current.question_id;
      const question = (await db.get(
        targetQuestionId,
      )) as Doc<"analytic_questions"> | null;
      if (!question) {
        throw new Error("Analytic question not found");
      }
      const qType = question.type === "numeric" ? "numeric" : "text";
      const normalized = normalizeInsightResponseForStorage(data.response, qType);
      if (!normalized) {
        throw new Error("Insight response is required");
      }
      patch.response = normalized.response;
      patch.responseNormalized = normalized.responseNormalized;
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
