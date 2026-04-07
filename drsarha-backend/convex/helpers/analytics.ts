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
  value: v.union(v.string(), v.number()),
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

/** Число из ответа инсайта (число в БД, строка из заливки/legacy). */
export function coerceToFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value === 0 ? 0 : value;
  }
  if (typeof value === "string") {
    const s = cleanupAnalyticsValue(value).replace(",", ".");
    if (s === "") {
      return null;
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Ключ группировки для числовых ответов (совпадает с String(n) для обычных чисел). */
export function numericNormalizedKey(n: number): string {
  if (!Number.isFinite(n)) {
    return "";
  }
  const x = n === 0 ? 0 : n;
  return String(x);
}

export function normalizeInsightResponseForStorage(
  value: unknown,
  questionType: "numeric" | "text",
): { response: string | number; responseNormalized: string } | null {
  if (questionType === "numeric") {
    const n = coerceToFiniteNumber(value);
    if (n === null) {
      return null;
    }
    return { response: n, responseNormalized: numericNormalizedKey(n) };
  }
  const s = cleanupAnalyticsValue(value);
  if (!s) {
    return null;
  }
  return { response: s, responseNormalized: normalizeAnalyticsValue(s) };
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
  response: string | number;
};

type RewriteSummaryInput = {
  rewrite_value: string;
  rewrite_target: string;
};

export type QuestionSummaryInput = {
  variants?: string[];
  type?: "numeric" | "text";
};

function summarizeNumericAnalyticsResponses(
  question: QuestionSummaryInput,
  insights: InsightSummaryInput[],
  rewrites: RewriteSummaryInput[],
) {
  const variants = sanitizeVariants(question.variants) ?? [];

  const variantNormForLabel = (label: string): string => {
    const n = coerceToFiniteNumber(label);
    return n !== null ? numericNormalizedKey(n) : normalizeAnalyticsValue(label);
  };

  const variantNormSet = new Set(variants.map(variantNormForLabel));

  const directByNorm = new Map<string, number>();
  const finalByNorm = new Map<string, number>();
  const labelByNorm = new Map<string, string | number>();

  for (const variant of variants) {
    const norm = variantNormForLabel(variant);
    const displayNum = coerceToFiniteNumber(variant);
    directByNorm.set(norm, 0);
    finalByNorm.set(norm, 0);
    labelByNorm.set(norm, displayNum !== null ? displayNum : variant);
  }

  const rewriteMap = new Map<string, string>();
  const rewriteTargetLabel = new Map<string, string | number>();
  for (const rewrite of rewrites) {
    const srcNum = coerceToFiniteNumber(rewrite.rewrite_value);
    const tgtNum = coerceToFiniteNumber(rewrite.rewrite_target);
    const rewriteValueNorm =
      srcNum !== null
        ? numericNormalizedKey(srcNum)
        : normalizeAnalyticsValue(cleanupAnalyticsValue(rewrite.rewrite_value));
    const rewriteTargetNorm =
      tgtNum !== null
        ? numericNormalizedKey(tgtNum)
        : normalizeAnalyticsValue(cleanupAnalyticsValue(rewrite.rewrite_target));
    if (!rewriteValueNorm || !rewriteTargetNorm) {
      continue;
    }
    rewriteMap.set(rewriteValueNorm, rewriteTargetNorm);
    if (!rewriteTargetLabel.has(rewriteTargetNorm)) {
      const targetClean = cleanupAnalyticsValue(rewrite.rewrite_target);
      rewriteTargetLabel.set(
        rewriteTargetNorm,
        tgtNum !== null ? tgtNum : targetClean || rewrite.rewrite_target,
      );
    }
  }

  const isVariantNorm = (n: string) => variantNormSet.has(n);

  for (const insight of insights) {
    const num = coerceToFiniteNumber(insight.response);
    if (num === null) {
      continue;
    }
    const normalizedResponse = numericNormalizedKey(num);

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
      labelByNorm.set(normalizedResponse, num);
    }
    finalByNorm.set(
      normalizedResponse,
      (finalByNorm.get(normalizedResponse) ?? 0) + 1,
    );
  }

  const results: Array<{
    value: string | number;
    count: number;
    sourceCount?: number;
  }> = variants.map((variant) => {
    const norm = variantNormForLabel(variant);
    const displayNum = coerceToFiniteNumber(variant);
    return {
      value: displayNum !== null ? displayNum : variant,
      count: finalByNorm.get(norm) ?? 0,
      sourceCount: directByNorm.get(norm) ?? 0,
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
    const la = labelByNorm.get(a);
    const lb = labelByNorm.get(b);
    const na = typeof la === "number" ? la : Number.NaN;
    const nb = typeof lb === "number" ? lb : Number.NaN;
    if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) {
      return na - nb;
    }
    return String(la ?? a).localeCompare(String(lb ?? b));
  });

  for (const n of extraNorms) {
    const label = labelByNorm.get(n);
    const value: string | number =
      label !== undefined
        ? label
        : (() => {
            const parsed = coerceToFiniteNumber(n);
            return parsed !== null ? parsed : n;
          })();
    results.push({
      value,
      count: finalByNorm.get(n) ?? 0,
    });
  }

  return {
    results,
    totalInsights: insights.length,
  };
}

export function summarizeAnalyticsResponses(
  question: QuestionSummaryInput,
  insights: InsightSummaryInput[],
  rewrites: RewriteSummaryInput[],
) {
  if (question.type === "numeric") {
    return summarizeNumericAnalyticsResponses(question, insights, rewrites);
  }

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
    value: string | number;
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
