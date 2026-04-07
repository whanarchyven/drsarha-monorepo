#!/usr/bin/env node
/**
 * Импорт компании из JSON-экспорта (как company.json в корне монорепо).
 *
 * Делает по шагам:
 * 1) Создаёт analytic_questions (текст = name статистики, варианты из question_summary.results).
 * 2) «Возраст» и вопросы, где все значения — 1–3 цифры, помечаются как numeric, инсайты — числа.
 * 3) Собирает dashboards: question_id → новый Convex id, scales[].scaleDistribution = count/сумма.
 * 4) Удаляет question_summary из stats (в схеме компании его нет).
 * 5) companies.insert
 * 6) Пакетами создаёт auto-инсайты с timestamp в заданном диапазоне.
 *
 * Переменные окружения:
 *   CONVEX_URL или NEXT_PUBLIC_CONVEX_URL — URL деплоя Convex
 *
 * Пример:
 *   cd drsarha-backend
 *   CONVEX_URL="https://xxxx.convex.cloud" node scripts/seed-company-from-export.mjs ../company.json
 *
 * Откат «плохого» импорта (компания + вопросы из её stats + инсайты + rewrites):
 *   cd drsarha-backend && npx convex run functions/company_import:rollbackCompanyImportBySlug '{"slug":"bluecap"}'
 *   (slug подставь свой; в Dashboard: Functions → company_import → rollbackCompanyImportBySlug)
 *
 * Диапазон дат по умолчанию: 6–30 апреля 2026 (UTC). Была оговорка «30 апреля – 6 апреля» — если имелось в виду
 * 30 марта – 6 апреля или наоборот порядок, поменяйте START_MS / END_MS ниже.
 */

import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

/** 6 апреля 2026 00:00 UTC */
const START_MS = Date.UTC(2025, 0, 1, 0, 0, 0, 0);
/** 30 апреля 2026 23:59:59 UTC */
const END_MS = Date.UTC(2025, 0, 2, 0, 0, 0, 0);

const CHUNK_SUM_COUNTS = 250;
const USER_PREFIX = "seed:import";

function isNumericStat(stat) {
  if (!stat?.name || typeof stat.name !== "string") return false;
  if (/возраст/i.test(stat.name)) return true;
  const results = stat.question_summary?.results;
  if (!Array.isArray(results) || results.length === 0) return false;
  return results.every(
    (r) =>
      r &&
      typeof r.value === "string" &&
      /^\d{1,3}$/.test(r.value.trim()) &&
      typeof r.count === "number",
  );
}

function defaultAutoscale() {
  return {
    enabled: false,
    min_step: 0,
    max_step: 0,
    extremum: 0,
  };
}

/** Совпадает с extractSpecialtyWeightsFromCompanyDashboards в Convex (стат «специальность»). */
function extractSpecialtyWeightsFromDashboards(dashboards) {
  const re = /специальност/i;
  for (const d of dashboards || []) {
    for (const stat of d.stats || []) {
      if (typeof stat.name === "string" && re.test(stat.name)) {
        const out = [];
        for (const scale of stat.scales || []) {
          const w = scale?.scaleDistribution;
          const n = scale?.name;
          if (
            typeof n === "string" &&
            n.trim() &&
            typeof w === "number" &&
            Number.isFinite(w) &&
            w > 0
          ) {
            out.push({ name: n.trim(), weight: w });
          }
        }
        if (out.length > 0) {
          return out;
        }
      }
    }
  }
  return [];
}

function buildScalesFromResults(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return {
      scaleAll: 1,
      scales: [
        {
          name: "—",
          value: 0,
          type: "linear",
          autoscale: defaultAutoscale(),
          scaleDistribution: 1,
        },
      ],
    };
  }
  const total = results.reduce((s, r) => s + (r.count || 0), 0);
  if (total <= 0) {
    return {
      scaleAll: 1,
      scales: [
        {
          name: "—",
          value: 0,
          type: "linear",
          autoscale: defaultAutoscale(),
          scaleDistribution: 1,
        },
      ],
    };
  }
  return {
    scaleAll: 1,
    scales: results.map((r) => ({
      name: String(r.value),
      value: 0,
      type: "linear",
      autoscale: defaultAutoscale(),
      scaleDistribution: (r.count || 0) / total,
    })),
  };
}

function chunkInsightRows(tasks) {
  const batches = [];
  let batch = [];
  let sum = 0;

  for (const row of tasks) {
    if (row.count <= 0) continue;

    if (row.count > CHUNK_SUM_COUNTS) {
      let left = row.count;
      while (left > 0) {
        const part = Math.min(left, CHUNK_SUM_COUNTS);
        batches.push([
          {
            question_id: row.question_id,
            response: row.response,
            count: part,
          },
        ]);
        left -= part;
      }
      continue;
    }

    if (sum + row.count > CHUNK_SUM_COUNTS && batch.length > 0) {
      batches.push(batch);
      batch = [];
      sum = 0;
    }
    batch.push(row);
    sum += row.count;
  }
  if (batch.length) batches.push(batch);
  return batches;
}

async function main() {
  const argPath = process.argv[2];
  const jsonPath = argPath
    ? resolve(process.cwd(), argPath)
    : resolve(__dirname, "..", "..", "company.json");

  if (!CONVEX_URL) {
    console.error("Нужен CONVEX_URL или NEXT_PUBLIC_CONVEX_URL");
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(jsonPath, "utf8"));
  const client = new ConvexHttpClient(CONVEX_URL);

  const insightTasks = [];
  const dashboards = structuredClone(raw.dashboards || []);

  for (const dash of dashboards) {
    for (const stat of dash.stats || []) {
      const numeric = isNumericStat(stat);
      const results = stat.question_summary?.results || [];

      const variants =
        results.length > 0
          ? numeric
            ? undefined
            : results.map((r) => String(r.value))
          : undefined;

      const doc = await client.mutation(api.functions.analytic_questions.insert, {
        text: stat.name,
        type: numeric ? "numeric" : "text",
        variants,
      });
      const newId = String(doc._id);
      stat.question_id = newId;

      delete stat.question_summary;

      const { scaleAll, scales } = buildScalesFromResults(results);
      stat.scaleAll = scaleAll;
      stat.scales = scales;

      for (const r of results) {
        const count = r.count || 0;
        if (count <= 0) continue;
        const response = numeric
          ? Number(String(r.value).trim())
          : String(r.value);
        insightTasks.push({
          question_id: newId,
          response,
          count,
        });
      }

    }
  }

  const companyPayload = {
    name: raw.name,
    slug: raw.slug,
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    logo: raw.logo || "",
    description: raw.description || "",
    password: raw.password || "",
    dashboards,
  };

  let company;
  try {
    company = await client.mutation(
      api.functions.companies.insert,
      companyPayload,
    );
  } catch (e) {
    console.error(
      "Ошибка companies.insert (возможно, slug уже занят):",
      e?.message || e,
    );
    throw e;
  }
  console.log("Компания создана:", String(company._id), company.slug);

  const batches = chunkInsightRows(insightTasks);
  const autoSpecialtyWeights = extractSpecialtyWeightsFromDashboards(dashboards);
  let totalCreated = 0;
  for (let bi = 0; bi < batches.length; bi++) {
    const rows = batches[bi];
    const res = await client.mutation(
      api.functions.company_import.importInsightSeeds,
      {
        start_date: START_MS,
        end_date: END_MS,
        user_id_prefix: `${USER_PREFIX}:b${bi}`,
        rows,
        ...(autoSpecialtyWeights.length > 0
          ? { auto_specialty_weights: autoSpecialtyWeights }
          : {}),
      },
    );
    totalCreated += res.created;
    console.log(
      `Инсайты пакет ${bi + 1}/${batches.length}: +${res.created} (всего ${totalCreated})`,
    );
  }

  const totalsByQuestion = new Map();
  for (const t of insightTasks) {
    totalsByQuestion.set(
      t.question_id,
      (totalsByQuestion.get(t.question_id) || 0) + t.count,
    );
  }

  console.log("\n--- Итого ---");
  console.log("Всего инсайтов создано:", totalCreated);
  console.log("Ожидалось по JSON:", insightTasks.reduce((s, t) => s + t.count, 0));
  console.log("По вопросам (сумма count из JSON):");
  for (const [qid, n] of totalsByQuestion) {
    console.log(`  ${qid}: ${n}`);
  }

  console.log("\n--- Если бы использовали только fill (fillInsightsForCompany) ---");
  console.log(
    "Для каждой статистики задайте fillValue = сумма count по question_summary (число ответов). scaleDistribution уже выставлены как count/сумма.",
  );
  console.log(
    "Из-за Math.floor и случайного распределения остатка заливка НЕ гарантирует те же числа, что в JSON; для точного совпадения используйте импорт инсайтов этим скриптом.",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
