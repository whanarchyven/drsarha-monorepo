import { httpAction, internalAction } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import {
  cleanupAnalyticsValue,
  parseAnalyticsDate,
} from "../helpers/analytics";

declare const process: {
  env: Record<string, string | undefined>;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function extractVariantsFromPayload(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload.map(cleanupAnalyticsValue).filter(Boolean);
  }

  if (payload && typeof payload === "object") {
    const candidate = (payload as any).variants ??
      (payload as any).responses ??
      (payload as any).data ??
      (payload as any).result;

    if (Array.isArray(candidate)) {
      return candidate.map(cleanupAnalyticsValue).filter(Boolean);
    }

    if (typeof candidate === "string") {
      const cleaned = cleanupAnalyticsValue(candidate);
      return cleaned ? [cleaned] : [];
    }
  }

  if (typeof payload === "string") {
    const trimmed = payload.trim();
    // Convex run-method / LLM часто возвращает тело как JSON-строку: "[\"бананы\"]"
    if (trimmed.startsWith("[")) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(cleanupAnalyticsValue).filter(Boolean);
        }
      } catch {
        // не JSON-массив — ниже одиночная строка
      }
    }
    const cleaned = cleanupAnalyticsValue(payload);
    return cleaned ? [cleaned] : [];
  }

  return [];
}

export const extractQuestionResponsesInternal = internalAction({
  args: {
    question_ids: v.array(v.id("analytic_questions")),
    user_response: v.string(),
  },
  returns: v.array(
    v.object({
      question_id: v.id("analytic_questions"),
      responses: v.array(v.string()),
    }),
  ),
  handler: async (ctx, { question_ids, user_response }) => {
    // Без завершающего слэша: иначе run-method регистрирует имя как "analytics-extractor/"
    const extractorUrl = process.env.ANALYTICS_EXTRACTOR_URL?.replace(
      /\/+$/u,
      "",
    );
    if (!extractorUrl) {
      throw new Error("ANALYTICS_EXTRACTOR_URL is not configured");
    }

    const extractorToken =
      process.env.ANALYTICS_EXTRACTOR_AUTH_TOKEN ||
      process.env.ANALYTICS_EXTRACTOR_API_KEY;

    const questions = await ctx.runQuery(
      internal.functions.analytic_questions.getByIdsInternal,
      { ids: question_ids },
    );

    const results: Array<{ question_id: typeof question_ids[number]; responses: string[] }> =
      [];

    for (const question of questions) {
      if (!question) {
        continue;
      }

      const response = await fetch(extractorUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(extractorToken
            ? { authorization: `Bearer ${extractorToken}` }
            : {}),
        },
        body: JSON.stringify({
          question_id: String(question._id),
          question_text: question.text,
          question_type: question.type,
          question_variants: question.variants ?? [],
          user_response,
          // Шаблон экстрактора ожидает опечатку user_responce
          user_responce: user_response,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Extractor failed for question ${String(question._id)}: ${errorText}`,
        );
      }

      const payload = await response.json();
      results.push({
        question_id: question._id,
        responses: extractVariantsFromPayload(payload),
      });
    }

    return results;
  },
});

export const extractUserInsightsHttp = httpAction(async (ctx, req) => {
  try {
    const body = await req.json();
    const questionIds = Array.isArray(body?.question_ids)
      ? body.question_ids
          .map((value: unknown) => cleanupAnalyticsValue(value))
          .filter(Boolean)
      : [];
    const userId = cleanupAnalyticsValue(body?.user_id);
    const userResponse = cleanupAnalyticsValue(body?.user_response);

    if (questionIds.length === 0 || !userId || !userResponse) {
      return json(
        { error: "question_ids, user_id and user_response are required" },
        400,
      );
    }

    const resolvedIds = await ctx.runQuery(
      internal.functions.analytic_questions.resolveQuestionIdsInternal,
      { ids: questionIds },
    );

    const invalidIds = questionIds.filter((_, index) => !resolvedIds[index]);
    if (invalidIds.length > 0) {
      return json(
        { error: "Some analytic questions were not found", invalidIds },
        400,
      );
    }

    const extracted = await ctx.runAction(
      internal.functions.analytic_pipeline.extractQuestionResponsesInternal,
      { question_ids: resolvedIds.filter(Boolean) as any, user_response: userResponse },
    );

    const timestamp = Date.now();
    const items = extracted.flatMap((entry) =>
      entry.responses.map((response) => ({
        question_id: entry.question_id,
        user_id: userId,
        response,
        type: "user" as const,
        timestamp,
      })),
    );

    const created = await ctx.runMutation(
      internal.functions.analytic_insights.createManyInternal,
      { items },
    );

    return json({
      success: true,
      created,
      questionsProcessed: extracted.length,
      extracted,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to extract insights";
    return json({ error: message }, 500);
  }
});

export const getQuestionSummaryHttp = httpAction(async (ctx, req) => {
  try {
    const url = new URL(req.url);
    const questionId = cleanupAnalyticsValue(
      url.searchParams.get("question_id") ?? url.searchParams.get("id"),
    );

    if (!questionId) {
      return json({ error: "question_id is required" }, 400);
    }

    const [resolvedId] = await ctx.runQuery(
      internal.functions.analytic_questions.resolveQuestionIdsInternal,
      { ids: [questionId] },
    );

    if (!resolvedId) {
      return json({ error: "Analytic question not found" }, 404);
    }

    const summary = await ctx.runQuery(api.functions.analytic_insights.summaryByQuestion, {
      question_id: resolvedId,
      start_date: parseAnalyticsDate(url.searchParams.get("start_date")),
      end_date: parseAnalyticsDate(url.searchParams.get("end_date")),
    });

    return json(summary);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to build question summary";
    return json({ error: message }, 500);
  }
});

/** Сырые инсайты по вопросу (без агрегации), новее — выше в массиве. */
export const getQuestionInsightsHttp = httpAction(async (ctx, req) => {
  try {
    const url = new URL(req.url);
    const questionId = cleanupAnalyticsValue(
      url.searchParams.get("question_id") ?? url.searchParams.get("id"),
    );

    if (!questionId) {
      return json({ error: "question_id is required" }, 400);
    }

    const [resolvedId] = await ctx.runQuery(
      internal.functions.analytic_questions.resolveQuestionIdsInternal,
      { ids: [questionId] },
    );

    if (!resolvedId) {
      return json({ error: "Analytic question not found" }, 404);
    }

    const insights = await ctx.runQuery(
      api.functions.analytic_insights.listByQuestion,
      {
        question_id: resolvedId,
        start_date: parseAnalyticsDate(url.searchParams.get("start_date")),
        end_date: parseAnalyticsDate(url.searchParams.get("end_date")),
      },
    );

    return json({ question_id: String(resolvedId), count: insights.length, insights });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list question insights";
    return json({ error: message }, 500);
  }
});

export const getQuestionInfoHttp = httpAction(async (ctx, req) => {
  try {
    const url = new URL(req.url);
    const questionId = cleanupAnalyticsValue(
      url.searchParams.get("question_id") ?? url.searchParams.get("id"),
    );

    if (!questionId) {
      return json({ error: "question_id is required" }, 400);
    }

    const question = await ctx.runQuery(api.functions.analytic_questions.getById, {
      id: questionId,
    });

    if (!question) {
      return json({ error: "Analytic question not found" }, 404);
    }

    return json({
      id: String(question._id),
      text: question.text,
      variants: question.variants ?? [],
      variants_text: (question.variants ?? []).join(", "),
      formatted: {
        question_text: `Текст вопроса - ${question.text}`,
        variants_text: `Варианты ответа (через запятую) - ${(question.variants ?? []).join(", ")}`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get question info";
    return json({ error: message }, 500);
  }
});
