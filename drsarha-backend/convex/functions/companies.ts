import {
  httpAction,
  internalQuery,
  mutation,
  query,
} from "../_generated/server";
import { v } from "convex/values";
import { companyDoc, companyFields } from "../models/company";
import {
  cleanupAnalyticsValue,
  getRandomTimestampInRange,
  normalizeAnalyticsValue,
  parseAnalyticsDate,
} from "../helpers/analytics";
import { internal, api } from "../_generated/api";
import { buildQuestionSummary } from "./analytic_insights";

declare const process: {
  env: Record<string, string | undefined>;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function getRequestSecret(req: Request) {
  return req.headers.get("authorization") ?? req.headers.get("Authorization");
}

function getAnalyticsHttpSecret() {
  return (
    process.env.ANALYTICS_HTTP_SECRET_KEY ||
    process.env.COMPANIES_FILL_SECRET_KEY ||
    ""
  );
}

function ensureAuthorized(req: Request) {
  const secret = getAnalyticsHttpSecret();
  if (!secret) {
    throw new Error("ANALYTICS_HTTP_SECRET_KEY is not configured");
  }

  const authHeader = getRequestSecret(req);
  if (authHeader !== `Bearer ${secret}`) {
    throw new Error("Unauthorized");
  }
}

function normalizeResultValue(value: unknown) {
  return normalizeAnalyticsValue(value);
}

function scaleQuestionSummaryResults(
  results: Array<{ value: string; count: number }>,
  stat: any,
) {
  const mergedResults = new Map<string, { value: string; count: number }>();

  for (const item of results) {
    const normalizedValue = normalizeResultValue(item.value);
    const cleanedValue = cleanupAnalyticsValue(item.value);
    if (!cleanedValue) {
      continue;
    }

    if (mergedResults.has(normalizedValue)) {
      mergedResults.get(normalizedValue)!.count += item.count || 0;
    } else {
      mergedResults.set(normalizedValue, {
        value: cleanedValue,
        count: item.count || 0,
      });
    }
  }

  let scaledResults = Array.from(mergedResults.values()).map((item) => ({
    ...item,
    count: item.count * (stat.scaleAll || 1),
  }));

  if (Array.isArray(stat.scales)) {
    for (const scale of stat.scales) {
      const normalizedScaleName = normalizeResultValue(scale.name);
      const matchingResult = scaledResults.find(
        (result) => normalizeResultValue(result.value) === normalizedScaleName,
      );

      if (matchingResult) {
        if (scale.type === "multiple") {
          matchingResult.count = matchingResult.count * Number(scale.value || 0);
        } else if (scale.type === "linear") {
          matchingResult.count = matchingResult.count + Number(scale.value || 0);
        }
      } else {
        scaledResults.push({
          value: cleanupAnalyticsValue(scale.name),
          count: scale.type === "linear" ? Number(scale.value || 0) : 0,
        });
      }
    }
  }

  scaledResults.sort((a, b) => (b.count || 0) - (a.count || 0));
  const allNumeric =
    scaledResults.length > 0 &&
    scaledResults.every((result) => !Number.isNaN(Number(result.value)));

  if (allNumeric) {
    scaledResults.sort((a, b) => Number(a.value) - Number(b.value));
  }

  return scaledResults;
}

function allocateStatResponses(stat: any, fillValue: number) {
  const scalesWithDistribution = Array.isArray(stat.scales)
    ? stat.scales.filter(
        (scale: any) =>
          scale.scaleDistribution !== undefined && scale.scaleDistribution > 0,
      )
    : [];

  const allocations = new Map<string, number>();
  const bigScales: Array<{ scale: any; expectedValue: number }> = [];
  const smallScales: Array<{ scale: any }> = [];

  for (const scale of scalesWithDistribution) {
    const expectedValue = fillValue * scale.scaleDistribution;
    if (expectedValue >= 1) {
      bigScales.push({ scale, expectedValue });
    } else {
      smallScales.push({ scale });
    }
  }

  let remainder = fillValue;

  for (const { scale, expectedValue } of bigScales) {
    const fillAmount = Math.floor(expectedValue);
    if (fillAmount <= 0) {
      continue;
    }
    const key = cleanupAnalyticsValue(scale.name);
    allocations.set(key, (allocations.get(key) ?? 0) + fillAmount);
    remainder -= fillAmount;
  }

  const availableSmallScales = [...smallScales];
  while (remainder > 0 && availableSmallScales.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableSmallScales.length);
    const [selected] = availableSmallScales.splice(randomIndex, 1);
    const fillAmount = remainder >= 2 ? (Math.random() < 0.5 ? 1 : 2) : 1;
    const actualFillAmount = Math.min(fillAmount, remainder);
    const key = cleanupAnalyticsValue(selected.scale.name);
    allocations.set(key, (allocations.get(key) ?? 0) + actualFillAmount);
    remainder -= actualFillAmount;
  }

  return Array.from(allocations.entries())
    .filter(([response, count]) => Boolean(response) && count > 0)
    .map(([response, count]) => ({ response, count }));
}

function createPublicCompanyResponse(company: any) {
  const companyForClient = JSON.parse(JSON.stringify(company));
  delete companyForClient.password;
  delete companyForClient.minGrowth;
  delete companyForClient.maxGrowth;
  delete companyForClient.totalGrowth;
  delete companyForClient.isActive;
  return companyForClient;
}

export const list = query({
  args: {
    search: v.optional(v.string()),
    slug: v.optional(v.string()),
    id: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(companyDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { search, slug, id, page = 1, limit = 30 }) => {
    let candidates = await db.query("companies").collect();
    if (search) {
      const s = search.toLowerCase();
      candidates = candidates.filter(c => c.name.toLowerCase().includes(s));
    }
    if (slug) candidates = candidates.filter(c => c.slug === slug);
    if (id) candidates = candidates.filter(c => String((c as any)._id) === id);
    const total = candidates.length;
    const from = (page - 1) * limit;
    const items = candidates.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    return { items: items as any, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const listAllInternal = internalQuery({
  args: {},
  returns: v.array(companyDoc),
  handler: async ({ db }) => {
    return (await db.query("companies").collect()) as any;
  },
});

export const getById = query({
  args: { id: v.string() },
  returns: v.union(companyDoc, v.null()),
  handler: async ({ db }, { id }) => {
    const all = await db.query("companies").collect();
    const found = all.find(c => String((c as any)._id) === id);
    return (found ?? null) as any;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(companyDoc, v.null()),
  handler: async ({ db }, { slug }) => {
    const one = await (db as any)
      .query("companies")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .unique();
    return one ?? null;
  },
});

export const getBySlugInfo = query({
  args: {
    slug: v.string(),
    start_date: v.optional(v.number()),
    end_date: v.optional(v.number()),
  },
  returns: v.any(),
  handler: async ({ db }, { slug, start_date, end_date }) => {
    const company = await (db as any)
      .query("companies")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .unique();

    if (!company) {
      return null;
    }

    const companyForClient = createPublicCompanyResponse(company);

    for (const dashboard of companyForClient.dashboards) {
      for (const stat of dashboard.stats) {
        const normalizedQuestionId = await (db as any).normalizeId(
          "analytic_questions",
          stat.question_id,
        );

        if (!normalizedQuestionId) {
          stat.question_summary = { results: [] };
          continue;
        }

        const summary = await buildQuestionSummary(
          db as any,
          normalizedQuestionId,
          start_date,
          end_date,
        );

        stat.question_summary = {
          results: scaleQuestionSummaryResults(summary.results, stat),
        };

        delete stat.scales;
        delete stat.scaleAll;
      }
    }

    return companyForClient;
  },
});

export const insert = mutation({
  args: v.object(companyFields),
  returns: companyDoc,
  handler: async ({ db }, data) => {
    const now = new Date().toISOString();
    const id = await db.insert("companies", { ...data, created_at: data.created_at ?? now, updated_at: data.updated_at ?? now });
    const doc = await db.get(id);
    return doc! as any;
  },
});

export const update = mutation({
  args: {
    id: v.id("companies"),
    data: v.object({
      name: v.optional(companyFields.name),
      slug: v.optional(companyFields.slug),
      created_at: v.optional(companyFields.created_at),
      updated_at: v.optional(companyFields.updated_at),
      logo: v.optional(companyFields.logo),
      description: v.optional(companyFields.description),
      dashboards: v.optional(companyFields.dashboards),
      isActive: v.optional(companyFields.isActive),
      minGrowth: v.optional(companyFields.minGrowth),
      maxGrowth: v.optional(companyFields.maxGrowth),
      totalGrowth: v.optional(companyFields.totalGrowth),
      password: v.optional(companyFields.password),
      mongoId: v.optional(companyFields.mongoId),
      _id: v.optional(v.id("companies")), // Системное поле, игнорируется
      _creationTime: v.optional(v.number()), // Системное поле, игнорируется
    }),
  },
  returns: companyDoc,
  handler: async ({ db }, { id, data }) => {
    // Фильтруем системные поля, которые не должны быть в data
    const { _id, _creationTime, created_at, ...cleanData } = data as any;
    const patch = { ...cleanData, updated_at: cleanData.updated_at ?? new Date().toISOString() } as any;
    await db.patch(id, patch);
    const doc = await db.get(id);
    return doc! as any;
  },
});

export const remove = mutation({
  args: { id: v.id("companies") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return true;
  },
});

export const getQuestionIdMigrationStatus = query({
  args: {},
  returns: v.array(v.any()),
  handler: async ({ db }) => {
    const companies = await db.query("companies").collect();
    const result: any[] = [];

    for (const company of companies) {
      const stats: any[] = [];

      for (const dashboard of company.dashboards) {
        for (const stat of dashboard.stats) {
          const resolvedId = await (db as any).normalizeId(
            "analytic_questions",
            stat.question_id,
          );

          stats.push({
            dashboardName: dashboard.name,
            statName: stat.name,
            question_id: stat.question_id,
            resolvedQuestionId: resolvedId ? String(resolvedId) : null,
            exists: Boolean(resolvedId),
          });
        }
      }

      result.push({
        companyId: String(company._id),
        companyName: company.name,
        stats,
      });
    }

    return result;
  },
});

export const migrateDashboardQuestionIds = mutation({
  args: {
    mappings: v.array(
      v.object({
        from: v.string(),
        to: v.id("analytic_questions"),
      }),
    ),
  },
  returns: v.number(),
  handler: async ({ db }, { mappings }) => {
    if (mappings.length === 0) {
      return 0;
    }

    const mappingMap = new Map(
      mappings.map((mapping) => [mapping.from, String(mapping.to)]),
    );
    const companies = await db.query("companies").collect();
    let updatedCompanies = 0;

    for (const company of companies) {
      let changed = false;
      const dashboards = company.dashboards.map((dashboard) => ({
        ...dashboard,
        stats: dashboard.stats.map((stat) => {
          const mappedQuestionId = mappingMap.get(stat.question_id);
          if (!mappedQuestionId) {
            return stat;
          }

          changed = true;
          return {
            ...stat,
            question_id: mappedQuestionId,
          };
        }),
      }));

      if (!changed) {
        continue;
      }

      await db.patch(company._id, {
        dashboards,
        updated_at: new Date().toISOString(),
      } as any);
      updatedCompanies += 1;
    }

    return updatedCompanies;
  },
});

export const fillCompaniesHttp = httpAction(async (ctx, req) => {
  try {
    ensureAuthorized(req);

    const body = await req.json().catch(() => ({}));
    const startDate = parseAnalyticsDate(body?.start_date);
    const endDate = parseAnalyticsDate(body?.end_date);

    if (startDate === undefined || endDate === undefined) {
      return json({ error: "start_date and end_date are required" }, 400);
    }

    const fillValue = parseAnalyticsDate(body?.fill_value);
    const companyIds = Array.isArray(body?.company_ids)
      ? body.company_ids.map((value: unknown) => cleanupAnalyticsValue(value)).filter(Boolean)
      : [];

    const autoUserId =
      cleanupAnalyticsValue(body?.user_id) || "system:auto-fill";

    const companies = await ctx.runQuery(internal.functions.companies.listAllInternal, {});
    const filteredCompanies =
      companyIds.length > 0
        ? companies.filter((company) => companyIds.includes(String(company._id)))
        : companies;

    const allQuestionIds = Array.from(
      new Set(
        filteredCompanies.flatMap((company) =>
          company.dashboards.flatMap((dashboard) =>
            dashboard.stats.map((stat) => stat.question_id),
          ),
        ),
      ),
    ) as string[];
    const resolvedQuestionIds = await ctx.runQuery(
      internal.functions.analytic_questions.resolveQuestionIdsInternal,
      { ids: allQuestionIds },
    );
    const questionIdMap = new Map<string, any>();
    allQuestionIds.forEach((questionId, index) => {
      questionIdMap.set(questionId, resolvedQuestionIds[index] ?? null);
    });

    let processed = 0;
    let errors = 0;
    let createdInsights = 0;
    const skippedCompanies: string[] = [];

    for (const company of filteredCompanies) {
      try {
        const baseFillValue =
          fillValue !== undefined
            ? Math.floor(fillValue)
            : company.minGrowth !== undefined && company.maxGrowth !== undefined
              ? Math.floor(
                  company.minGrowth +
                    Math.random() * (company.maxGrowth - company.minGrowth),
                )
              : undefined;

        if (baseFillValue === undefined) {
          skippedCompanies.push(company.name);
          continue;
        }

        for (const dashboard of company.dashboards) {
          const dashboardPercent = dashboard.dashboardPercent ?? 1;
          const dashboardFillValue = Math.floor(baseFillValue * dashboardPercent);

          for (const stat of dashboard.stats) {
            const questionId = questionIdMap.get(stat.question_id);
            if (!questionId) {
              continue;
            }

            const allocations = allocateStatResponses(stat, dashboardFillValue);
            const items = allocations.flatMap((allocation) =>
              Array.from({ length: allocation.count }, () => ({
                question_id: questionId,
                user_id: `${autoUserId}:${String(company._id)}`,
                response: allocation.response,
                type: "auto" as const,
                timestamp: getRandomTimestampInRange(startDate, endDate),
              })),
            );

            if (items.length === 0) {
              continue;
            }

            createdInsights += await ctx.runMutation(
              internal.functions.analytic_insights.createManyInternal,
              { items },
            );
          }
        }

        processed += 1;
      } catch (error) {
        console.error("Failed to fill company analytics", {
          companyId: String(company._id),
          error,
        });
        errors += 1;
      }
    }

    return json({
      success: true,
      processed,
      errors,
      createdInsights,
      skippedCompanies,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fill companies";
    const status = message === "Unauthorized" ? 401 : 500;
    return json({ error: message }, status);
  }
});

export const getBySlugInfoHttp = httpAction(async (ctx, req) => {
  try {
    const url = new URL(req.url);
    const slug = cleanupAnalyticsValue(url.searchParams.get("slug"));

    if (!slug) {
      return json({ error: "slug is required" }, 400);
    }

    const company = await ctx.runQuery(api.functions.companies.getBySlugInfo, {
      slug,
      start_date: parseAnalyticsDate(url.searchParams.get("start_date")),
      end_date: parseAnalyticsDate(url.searchParams.get("end_date")),
    });

    if (!company) {
      return json({ error: "Компания не найдена" }, 404);
    }

    return json(company);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Ошибка при получении компании по слагу";
    return json({ error: message }, 500);
  }
});


