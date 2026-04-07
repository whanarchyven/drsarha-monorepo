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
  parseAnalyticsDate,
} from "../helpers/analytics";
import { allocateStatResponses } from "../helpers/companyFill";
import { extractSpecialtyWeightsFromCompanyDashboards } from "../helpers/insightSpecialty";
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

type SpecialityDistributionRow = Array<{ specialty: string; percent: number }>;

/** Для публичного slug API не отдаём sourceCount (value, count, speciality_distribution). */
function stripSourceCountFromSummaryResults(
  results: Array<{
    value: string | number;
    count: number;
    sourceCount?: number;
    speciality_distribution?: SpecialityDistributionRow;
  }>,
) {
  return results.map(({ value, count, speciality_distribution }) => {
    const row: {
      value: string | number;
      count: number;
      speciality_distribution?: SpecialityDistributionRow;
    } = { value, count };
    if (speciality_distribution !== undefined) {
      row.speciality_distribution = speciality_distribution;
    }
    return row;
  });
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

/** Только для HTTP: при неверном slug/пароле всегда false (без 404). */
export const verifyCompanyPasswordInternal = internalQuery({
  args: {
    slug: v.string(),
    password: v.string(),
  },
  returns: v.boolean(),
  handler: async ({ db }, { slug, password }) => {
    const trimmedSlug = slug.trim();
    if (!trimmedSlug) {
      return false;
    }
    const one = await (db as any)
      .query("companies")
      .withIndex("by_slug", (q: any) => q.eq("slug", trimmedSlug))
      .unique();
    if (!one) {
      return false;
    }
    const stored = (one as { password?: string }).password;
    if (typeof stored !== "string") {
      return false;
    }
    return stored.trim() === password.trim();
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
          results: stripSourceCountFromSummaryResults(summary.results),
          totalInsights: summary.totalInsights,
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
    console.log("[CompanySave] companies.update called", {
      id: String(id),
      dataKeys: data ? Object.keys(data as object) : [],
      dashboardsLen: Array.isArray((data as any)?.dashboards)
        ? (data as any).dashboards.length
        : "absent",
    });
    // Фильтруем системные поля, которые не должны быть в data
    const { _id, _creationTime, created_at, ...cleanData } = data as any;
    const patch = { ...cleanData, updated_at: cleanData.updated_at ?? new Date().toISOString() } as any;
    try {
      await db.patch(id, patch);
    } catch (patchErr) {
      console.error("[CompanySave] db.patch failed", patchErr);
      throw patchErr;
    }
    const doc = await db.get(id);
    console.log("[CompanySave] companies.update OK", {
      id: String(doc?._id),
      dashboardsLen: (doc as any)?.dashboards?.length,
    });
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

const fillInsightsScope = v.union(
  v.literal("all"),
  v.object({
    kind: v.literal("dashboard"),
    dashboardIndex: v.number(),
  }),
  v.object({
    kind: v.literal("stat"),
    dashboardIndex: v.number(),
    statIndex: v.number(),
  }),
);

/** Создаёт analytic_insights по распределениям масштабов компании (как HTTP /companies/fill), с учётом области. */
export const fillInsightsForCompany = mutation({
  args: {
    companyId: v.id("companies"),
    fillValue: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    scope: fillInsightsScope,
    userId: v.optional(v.string()),
  },
  returns: v.object({ createdInsights: v.number() }),
  handler: async (ctx, args) => {
    if (!Number.isFinite(args.fillValue) || args.fillValue <= 0) {
      throw new Error("fillValue must be a positive number");
    }
    if (args.endDate < args.startDate) {
      throw new Error("endDate must be >= startDate");
    }

    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new Error("Company not found");
    }

    const dashboards = (company as any).dashboards as any[];
    if (!Array.isArray(dashboards)) {
      throw new Error("Company has no dashboards");
    }

    const work: { stat: any; effectiveFill: number }[] = [];

    if (args.scope === "all") {
      for (const dashboard of dashboards) {
        const dashboardPercent = dashboard.dashboardPercent ?? 1;
        const dashboardFillValue = Math.floor(args.fillValue * dashboardPercent);
        for (const stat of dashboard.stats ?? []) {
          work.push({ stat, effectiveFill: dashboardFillValue });
        }
      }
    } else if (args.scope.kind === "dashboard") {
      const di = args.scope.dashboardIndex;
      if (di < 0 || di >= dashboards.length) {
        throw new Error("Invalid dashboard index");
      }
      const ef = Math.floor(args.fillValue);
      for (const stat of dashboards[di].stats ?? []) {
        work.push({ stat, effectiveFill: ef });
      }
    } else {
      const di = args.scope.dashboardIndex;
      const si = args.scope.statIndex;
      if (di < 0 || di >= dashboards.length) {
        throw new Error("Invalid dashboard index");
      }
      const stats = dashboards[di].stats ?? [];
      if (si < 0 || si >= stats.length) {
        throw new Error("Invalid stat index");
      }
      work.push({ stat: stats[si], effectiveFill: Math.floor(args.fillValue) });
    }

    const questionIds = Array.from(
      new Set(
        work
          .map((w) => String(w.stat?.question_id ?? "").trim())
          .filter(Boolean),
      ),
    );

    if (questionIds.length === 0) {
      return { createdInsights: 0 };
    }

    const resolvedQuestionIds = await ctx.runQuery(
      internal.functions.analytic_questions.resolveQuestionIdsInternal,
      { ids: questionIds },
    );
    const questionIdMap = new Map<string, any>();
    questionIds.forEach((questionId, index) => {
      questionIdMap.set(questionId, resolvedQuestionIds[index] ?? null);
    });

    const autoUserId =
      cleanupAnalyticsValue(args.userId) || "system:auto-fill";

    const autoSpecialtyWeights = extractSpecialtyWeightsFromCompanyDashboards(
      dashboards,
    );
    const autoSpecialtyWeightsArg =
      autoSpecialtyWeights.length > 0 ? autoSpecialtyWeights : undefined;

    let createdInsights = 0;

    for (const { stat, effectiveFill } of work) {
      const qid = String(stat?.question_id ?? "").trim();
      const questionId = questionIdMap.get(qid);
      if (!questionId || effectiveFill <= 0) {
        continue;
      }

      const allocations = allocateStatResponses(stat, effectiveFill);
      const items = allocations.flatMap((allocation) =>
        Array.from({ length: allocation.count }, () => ({
          question_id: questionId,
          user_id: `${autoUserId}:${String(company._id)}`,
          response: allocation.response,
          type: "auto" as const,
          timestamp: getRandomTimestampInRange(args.startDate, args.endDate),
        })),
      );

      if (items.length === 0) {
        continue;
      }

      createdInsights += await ctx.runMutation(
        internal.functions.analytic_insights.createManyInternal,
        { items, auto_specialty_weights: autoSpecialtyWeightsArg },
      );
    }

    return { createdInsights };
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

        const autoSpecialtyWeights = extractSpecialtyWeightsFromCompanyDashboards(
          company.dashboards,
        );
        const autoSpecialtyWeightsArg =
          autoSpecialtyWeights.length > 0 ? autoSpecialtyWeights : undefined;

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
              { items, auto_specialty_weights: autoSpecialtyWeightsArg },
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

/**
 * POST JSON: { "slug": "...", "password": "..." }
 * Ответ: JSON `true` / `false` — пароль совпал с паролем компании.
 * При отсутствии компании или неверном пароле — `false` (без раскрытия факта существования slug).
 */
export const verifyCompanyPasswordHttp = httpAction(async (ctx, req) => {
  try {
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const slug = cleanupAnalyticsValue(body?.slug);
    const password =
      typeof body?.password === "string" ? body.password : "";

    if (!slug || password === "") {
      return json(
        { error: "slug и password обязательны в теле JSON" },
        400,
      );
    }

    const ok = await ctx.runQuery(
      internal.functions.companies.verifyCompanyPasswordInternal,
      { slug, password },
    );

    return json(ok);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Ошибка при проверке пароля компании";
    return json({ error: message }, 500);
  }
});


