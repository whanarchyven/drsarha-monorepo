import { mutation } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { v } from "convex/values";
import {
  getRandomTimestampInRange,
  normalizeInsightResponseForStorage,
} from "../helpers/analytics";

const insightSeedRow = v.object({
  question_id: v.id("analytic_questions"),
  response: v.union(v.string(), v.number()),
  count: v.number(),
});

/**
 * Пакетная вставка auto-инсайтов для миграции (например из company.json).
 * Публичная мутация — не вызывайте из клиента в проде без отдельной защиты.
 * Ограничьте сумму count в одном вызове (~300–500), иначе таймаут мутации.
 */
export const importInsightSeeds = mutation({
  args: {
    start_date: v.number(),
    end_date: v.number(),
    user_id_prefix: v.string(),
    rows: v.array(insightSeedRow),
  },
  returns: v.object({ created: v.number() }),
  handler: async ({ db }, args) => {
    if (args.end_date < args.start_date) {
      throw new Error("end_date must be >= start_date");
    }

    const typeCache = new Map<string, "numeric" | "text">();
    async function questionType(
      qid: Id<"analytic_questions">,
    ): Promise<"numeric" | "text"> {
      const key = String(qid);
      const hit = typeCache.get(key);
      if (hit) {
        return hit;
      }
      const q = (await db.get(qid)) as Doc<"analytic_questions"> | null;
      const t = q?.type === "numeric" ? "numeric" : "text";
      typeCache.set(key, t);
      return t;
    }

    let created = 0;
    let seq = 0;

    for (const row of args.rows) {
      if (row.count <= 0) {
        continue;
      }
      const qType = await questionType(row.question_id);
      for (let i = 0; i < row.count; i++) {
        const normalized = normalizeInsightResponseForStorage(
          row.response,
          qType,
        );
        if (!normalized) {
          continue;
        }
        await db.insert("analytic_insights", {
          question_id: row.question_id,
          user_id: `${args.user_id_prefix}:${seq}`,
          response: normalized.response,
          responseNormalized: normalized.responseNormalized,
          type: "auto",
          timestamp: getRandomTimestampInRange(
            args.start_date,
            args.end_date,
          ),
        });
        seq += 1;
        created += 1;
      }
    }

    return { created };
  },
});

/**
 * Откат импорта «компания + вопросы из её stats»: удаляет компанию по slug,
 * все analytic_insights и analytic_rewrites по question_id из дашбордов,
 * сами analytic_questions.
 *
 * Внимание: если тот же question_id привязан к другой компании или используется
 * где-то ещё, документ вопроса всё равно будет удалён — для сида, где вопросы
 * создавались только под этот импорт, это ожидаемо.
 */
export const rollbackCompanyImportBySlug = mutation({
  args: { slug: v.string() },
  returns: v.object({
    deletedInsights: v.number(),
    deletedRewrites: v.number(),
    deletedQuestions: v.number(),
    deletedCompany: v.boolean(),
  }),
  handler: async ({ db }, { slug }) => {
    const trimmed = slug.trim();
    if (!trimmed) {
      throw new Error("slug is required");
    }

    const company = await (db as any)
      .query("companies")
      .withIndex("by_slug", (q: any) => q.eq("slug", trimmed))
      .unique();

    if (!company) {
      throw new Error(`Company not found: ${trimmed}`);
    }

    const qidStrings = new Set<string>();
    for (const d of company.dashboards ?? []) {
      for (const s of d.stats ?? []) {
        const q = s?.question_id;
        if (q != null && String(q).trim() !== "") {
          qidStrings.add(String(q).trim());
        }
      }
    }

    let deletedInsights = 0;
    let deletedRewrites = 0;
    let deletedQuestions = 0;

    for (const qs of qidStrings) {
      const qid = await (db as any).normalizeId("analytic_questions", qs);
      if (!qid) {
        continue;
      }

      const insights = await db
        .query("analytic_insights")
        .withIndex("by_question", (q) => q.eq("question_id", qid))
        .collect();
      for (const row of insights) {
        await db.delete(row._id);
        deletedInsights += 1;
      }

      const rewrites = await db
        .query("analytic_rewrites")
        .withIndex("by_question", (q) => q.eq("question_id", qid))
        .collect();
      for (const row of rewrites) {
        await db.delete(row._id);
        deletedRewrites += 1;
      }

      await db.delete(qid);
      deletedQuestions += 1;
    }

    await db.delete(company._id);

    return {
      deletedInsights,
      deletedRewrites,
      deletedQuestions,
      deletedCompany: true,
    };
  },
});
