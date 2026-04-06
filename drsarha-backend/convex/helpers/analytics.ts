import { v } from "convex/values";

export const analyticsQuestionType = v.union(
  v.literal("numeric"),
  v.literal("text"),
);

export const analyticsInsightType = v.union(
  v.literal("user"),
  v.literal("auto"),
);

export const analyticsCountResult = v.object({
  value: v.string(),
  count: v.number(),
});

export const analyticsSummaryResult = v.object({
  value: v.string(),
  count: v.number(),
  sourceCount: v.optional(v.number()),
});

export const analyticsSummaryRange = v.union(
  v.object({
    start_date: v.optional(v.number()),
    end_date: v.optional(v.number()),
  }),
  v.null(),
);

export function cleanupAnalyticsValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/\s*\(\*\)\s*$/u, "")
    .trim();
}

export function normalizeAnalyticsValue(value: unknown) {
  return cleanupAnalyticsValue(value).toLowerCase();
}

export function parseAnalyticsDate(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const asNumber = Number(value);
    if (Number.isFinite(asNumber) && value.trim() !== "") {
      return asNumber;
    }

    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

export function getRangeBounds(start?: number, end?: number) {
  return {
    start: start ?? Number.MIN_SAFE_INTEGER,
    end: end ?? Number.MAX_SAFE_INTEGER,
  };
}

export function getRandomTimestampInRange(start: number, end: number) {
  if (end <= start) {
    return start;
  }

  return Math.floor(start + Math.random() * (end - start + 1));
}

export function sanitizeVariants(variants?: string[]) {
  if (!Array.isArray(variants)) {
    return undefined;
  }

  const result: string[] = [];
  const seen = new Set<string>();

  for (const variant of variants) {
    const cleaned = cleanupAnalyticsValue(variant);
    if (!cleaned) {
      continue;
    }

    const normalized = normalizeAnalyticsValue(cleaned);
    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(cleaned);
  }

  return result.length > 0 ? result : undefined;
}

type InsightSummaryInput = {
  response: string;
};

type RewriteSummaryInput = {
  rewrite_value: string;
  rewrite_target: string;
};

type QuestionSummaryInput = {
  variants?: string[];
};

export function summarizeAnalyticsResponses(
  question: QuestionSummaryInput,
  insights: InsightSummaryInput[],
  rewrites: RewriteSummaryInput[],
) {
  const variants = sanitizeVariants(question.variants) ?? [];
  const variantNormSet = new Set(
    variants.map((v) => normalizeAnalyticsValue(v)),
  );

  const directByNorm = new Map<string, number>();
  const finalByNorm = new Map<string, number>();
  const labelByNorm = new Map<string, string>();

  for (const variant of variants) {
    const normalized = normalizeAnalyticsValue(variant);
    directByNorm.set(normalized, 0);
    finalByNorm.set(normalized, 0);
    labelByNorm.set(normalized, variant);
  }

  const rewriteMap = new Map<string, string>();
  const rewriteTargetLabel = new Map<string, string>();
  for (const rewrite of rewrites) {
    const rewriteValue = normalizeAnalyticsValue(rewrite.rewrite_value);
    const targetClean = cleanupAnalyticsValue(rewrite.rewrite_target);
    const rewriteTarget = normalizeAnalyticsValue(rewrite.rewrite_target);
    if (!rewriteValue || !rewriteTarget) {
      continue;
    }
    rewriteMap.set(rewriteValue, rewriteTarget);
    if (!rewriteTargetLabel.has(rewriteTarget)) {
      rewriteTargetLabel.set(rewriteTarget, targetClean || rewrite.rewrite_target);
    }
  }

  const isVariantNorm = (n: string) => variantNormSet.has(n);

  for (const insight of insights) {
    const raw = cleanupAnalyticsValue(insight.response);
    const normalizedResponse = normalizeAnalyticsValue(raw);
    if (!normalizedResponse) {
      continue;
    }

    if (isVariantNorm(normalizedResponse)) {
      directByNorm.set(
        normalizedResponse,
        (directByNorm.get(normalizedResponse) ?? 0) + 1,
      );
      finalByNorm.set(
        normalizedResponse,
        (finalByNorm.get(normalizedResponse) ?? 0) + 1,
      );
      continue;
    }

    const rewriteTarget = rewriteMap.get(normalizedResponse);
    if (rewriteTarget) {
      if (isVariantNorm(rewriteTarget)) {
        finalByNorm.set(
          rewriteTarget,
          (finalByNorm.get(rewriteTarget) ?? 0) + 1,
        );
      } else {
        if (!finalByNorm.has(rewriteTarget)) {
          finalByNorm.set(rewriteTarget, 0);
          directByNorm.set(rewriteTarget, 0);
          labelByNorm.set(
            rewriteTarget,
            rewriteTargetLabel.get(rewriteTarget) ?? rewriteTarget,
          );
        }
        finalByNorm.set(
          rewriteTarget,
          (finalByNorm.get(rewriteTarget) ?? 0) + 1,
        );
      }
      continue;
    }

    if (!finalByNorm.has(normalizedResponse)) {
      finalByNorm.set(normalizedResponse, 0);
      directByNorm.set(normalizedResponse, 0);
      labelByNorm.set(normalizedResponse, raw);
    }
    finalByNorm.set(
      normalizedResponse,
      (finalByNorm.get(normalizedResponse) ?? 0) + 1,
    );
  }

  const results: Array<{
    value: string;
    count: number;
    sourceCount?: number;
  }> = variants.map((variant) => {
    const normalized = normalizeAnalyticsValue(variant);
    return {
      value: variant,
      count: finalByNorm.get(normalized) ?? 0,
      sourceCount: directByNorm.get(normalized) ?? 0,
    };
  });

  const extraNorms = Array.from(finalByNorm.keys()).filter(
    (n) => !variantNormSet.has(n) && (finalByNorm.get(n) ?? 0) > 0,
  );
  extraNorms.sort((a, b) => {
    const ca = finalByNorm.get(a) ?? 0;
    const cb = finalByNorm.get(b) ?? 0;
    if (cb !== ca) {
      return cb - ca;
    }
    return (labelByNorm.get(a) ?? a).localeCompare(labelByNorm.get(b) ?? b);
  });

  for (const n of extraNorms) {
    results.push({
      value: labelByNorm.get(n) ?? n,
      count: finalByNorm.get(n) ?? 0,
    });
  }

  return {
    results,
    totalInsights: insights.length,
  };
}
