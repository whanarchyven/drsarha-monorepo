#!/usr/bin/env node
/**
 * Импорт компании из «расширенного» JSON (ответ getBySlugInfo и аналоги):
 * у каждого элемента question_summary.results может быть speciality_distribution[]
 * с { specialty, percent }; в документе бывают _id, totalInsights и др. поля API.
 *
 * Алгоритм тот же, что у seed-company-from-export.mjs:
 * вопросы → scales из count → без question_summary в stats → companies.insert → инсайты пакетами.
 *
 * Отличия от простого экспорта:
 * - results нормализуются до { value, count } (лишние поля не попадают в логику).
 * - stat в дашборде пересобирается только из полей схемы Convex (name, question_id, scaleAll, scales, graphics).
 * - Веса для pickWeightedSpecialty: сначала стат «специальность» по scales; иначе сумма по файлу
 *   count × (percent/100) по всем speciality_distribution (и specialty_distribution).
 *
 * Пример:
 *   cd drsarha-backend
 *   CONVEX_URL="https://xxxx.convex.cloud" node scripts/seed-company-from-rich-export.mjs scripts/problem-company.json
 *
 * Timestamp инсайтов: по умолчанию 2024–2027 UTC (см. resolveInsightTimestampRange), иначе ручка с узким
 * start_date/end_date не увидит данные. Переопределение: SEED_INSIGHT_START_MS, SEED_INSIGHT_END_MS.
 */

import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

function resolveInsightTimestampRange() {
  const s = process.env.SEED_INSIGHT_START_MS;
  const e = process.env.SEED_INSIGHT_END_MS;
  if (s != null && s !== "" && e != null && e !== "") {
    const start = Number(s);
    const end = Number(e);
    if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
      return { start, end };
    }
  }
  return {
    start: Date.UTC(2026, 2, 15, 0, 0, 0, 0),
    end: Date.UTC(2026, 3, 7, 0, 0, 0, 0),
  };
}

const { start: START_MS, end: END_MS } = resolveInsightTimestampRange();

const CHUNK_SUM_COUNTS = 250;
const USER_PREFIX = "seed:rich-import";

function normalizeResultRow(r) {
  if (!r || typeof r !== "object") return { value: "", count: 0 };
  const c = r.count;
  const count = typeof c === "number" && Number.isFinite(c) ? c : 0;
  const value = r.value == null ? "" : String(r.value);
  return { value, count };
}

function isNumericStatFromResults(statName, results) {
  if (!statName || typeof statName !== "string") return false;
  if (/возраст/i.test(statName)) return true;
  if (!Array.isArray(results) || results.length === 0) return false;
  return results.every(
    (r) =>
      r &&
      typeof r.value === "string" &&
      /^\d{1,3}$/.test(r.value.trim()) &&
      typeof r.count === "number",
  );
}

function aggregateSpecialtyWeightsFromRawDashboards(dashboards) {
  const tallies = new Map();
  for (const dash of dashboards || []) {
    for (const stat of dash.stats || []) {
      const raw = stat.question_summary?.results;
      if (!Array.isArray(raw)) continue;
      for (const row of raw) {
        const dist =
          row?.speciality_distribution ?? row?.specialty_distribution ?? null;
        if (!Array.isArray(dist) || dist.length === 0) continue;
        const cnt = typeof row.count === "number" ? row.count : 0;
        if (cnt <= 0) continue;
        for (const item of dist) {
          const name =
            typeof item?.specialty === "string" ? item.specialty.trim() : "";
          const pct = Number(item?.percent);
          if (!name || !Number.isFinite(pct)) continue;
          tallies.set(name, (tallies.get(name) || 0) + cnt * (pct / 100));
        }
      }
    }
  }
  if (tallies.size === 0) return [];
  return [...tallies.entries()]
    .filter(([, w]) => w > 0)
    .map(([name, weight]) => ({ name, weight }));
}

function sanitizeGraphic(g) {
  if (!g || typeof g !== "object") {
    return { type: "tab", cols: 1 };
  }
  const out = {
    type: g.type,
    cols: typeof g.cols === "number" ? g.cols : 1,
  };
  if (g.stat_tab !== undefined) out.stat_tab = g.stat_tab;
  if (g.stat_title !== undefined) out.stat_title = g.stat_title;
  if (g.stat_subtitle !== undefined) out.stat_subtitle = g.stat_subtitle;
  if (g.stat_unit !== undefined) out.stat_unit = g.stat_unit;
  if (g.stat_variant !== undefined) out.stat_variant = g.stat_variant;
  if (g.show_speciality_distribution !== undefined) {
    out.show_speciality_distribution = g.show_speciality_distribution;
  }
  return out;
}

function defaultAutoscale() {
  return {
    enabled: false,
    min_step: 0,
    max_step: 0,
    extremum: 0,
  };
}

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
    : resolve(__dirname, "problem-company.json");

  if (!CONVEX_URL) {
    console.error("Нужен CONVEX_URL или NEXT_PUBLIC_CONVEX_URL");
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(jsonPath, "utf8"));
  const client = new ConvexHttpClient(CONVEX_URL);

  const companyName = String(raw.name ?? "").trim();
  const companySlug = String(raw.slug ?? "").trim();
  const questionText = (statName) => {
    let prefix;
    if (companyName && companySlug) {
      prefix = `${companyName} - ${companySlug}`;
    } else if (companyName) {
      prefix = companyName;
    } else if (companySlug) {
      prefix = companySlug;
    } else {
      return statName;
    }
    return `${prefix}. ${statName}`;
  };

  const insightTasks = [];
  const dashboards = structuredClone(raw.dashboards || []);
  const rawDashboardsSnapshot = structuredClone(raw.dashboards || []);

  for (const dash of dashboards) {
    const stats = dash.stats || [];
    for (let si = 0; si < stats.length; si++) {
      const stat = stats[si];
      const resultsRaw = stat.question_summary?.results || [];
      const results = resultsRaw.map(normalizeResultRow);
      const numeric = isNumericStatFromResults(stat.name, results);

      const variants =
        results.length > 0
          ? numeric
            ? undefined
            : results.map((r) => String(r.value))
          : undefined;

      const doc = await client.mutation(api.functions.analytic_questions.insert, {
        text: questionText(stat.name),
        type: numeric ? "numeric" : "text",
        variants,
      });
      const newId = String(doc._id);

      const { scaleAll, scales } = buildScalesFromResults(results);
      const graphics = Array.isArray(stat.graphics)
        ? stat.graphics.map(sanitizeGraphic)
        : [];

      stats[si] = {
        name: String(stat.name ?? ""),
        question_id: newId,
        scaleAll,
        scales,
        graphics,
      };

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
  console.log(
    "Инсайты: timestamp в диапазоне UTC (ms)",
    START_MS,
    "…",
    END_MS,
    "— в getBySlugInfo / HTTP укажите start_date/end_date, пересекающиеся с этим интервалом.",
  );

  const batches = chunkInsightRows(insightTasks);
  let autoSpecialtyWeights = extractSpecialtyWeightsFromDashboards(dashboards);
  if (autoSpecialtyWeights.length === 0) {
    autoSpecialtyWeights = aggregateSpecialtyWeightsFromRawDashboards(
      rawDashboardsSnapshot,
    );
  }
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
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
