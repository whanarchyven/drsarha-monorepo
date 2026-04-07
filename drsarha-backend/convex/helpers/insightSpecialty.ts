/**
 * Распределение специальностей для auto-инсайтов (fallback, если в дашборде компании нет стата «специальность»).
 * Веса в процентах (сумма ~100).
 */
export const DEFAULT_AUTO_SPECIALTY_WEIGHTS: Array<{ name: string; weight: number }> = [
  { name: "Дерматолог", weight: 34.3 },
  { name: "Педиатр", weight: 33.4 },
  { name: "Дерматовенеролог", weight: 15.2 },
  { name: "Трихолог", weight: 12.6 },
  { name: "Аллерголог-иммунолог", weight: 1.9 },
  { name: "Пульмонолог", weight: 0.6 },
  { name: "Врач-ординатор/аспирант", weight: 0.6 },
  { name: "ВОП", weight: 0.3 },
  { name: "Дерматолог, косметолог", weight: 0.3 },
  { name: "Инфекционист", weight: 0.2 },
  { name: "Терапевт", weight: 0.2 },
  { name: "Гастроэнтеролог", weight: 0.2 },
  { name: "Кардиолог", weight: 0.1 },
  { name: "Детский аллерголог", weight: 0.1 },
  { name: "Врач-косметолог", weight: 0.1 },
];

const SPECIALTY_STAT_NAME_RE = /специальност/i;

export function extractSpecialtyWeightsFromCompanyDashboards(
  dashboards: unknown,
): Array<{ name: string; weight: number }> {
  if (!Array.isArray(dashboards)) {
    return [];
  }

  for (const dashboard of dashboards) {
    const stats = (dashboard as { stats?: unknown }).stats;
    if (!Array.isArray(stats)) {
      continue;
    }

    for (const stat of stats) {
      const name = (stat as { name?: unknown }).name;
      if (typeof name !== "string" || !SPECIALTY_STAT_NAME_RE.test(name)) {
        continue;
      }

      const scales = (stat as { scales?: unknown }).scales;
      if (!Array.isArray(scales)) {
        continue;
      }

      const out: Array<{ name: string; weight: number }> = [];
      for (const scale of scales) {
        if (!scale || typeof scale !== "object") {
          continue;
        }
        const scaleName = (scale as { name?: unknown }).name;
        const dist = (scale as { scaleDistribution?: unknown }).scaleDistribution;
        if (typeof scaleName !== "string") {
          continue;
        }
        const trimmed = scaleName.trim();
        if (!trimmed) {
          continue;
        }
        const w =
          typeof dist === "number" && Number.isFinite(dist) && dist > 0 ? dist : 0;
        if (w <= 0) {
          continue;
        }
        out.push({ name: trimmed, weight: w });
      }

      if (out.length > 0) {
        return out;
      }
    }
  }

  return [];
}

export function pickWeightedSpecialty(
  entries: Array<{ name: string; weight: number }>,
  random: () => number = Math.random,
): string {
  if (entries.length === 0) {
    return "не указана";
  }

  const sanitized = entries
    .map((e) => ({
      name: String(e.name).trim(),
      weight: Math.max(0, e.weight),
    }))
    .filter((e) => e.name.length > 0 && e.weight > 0);

  if (sanitized.length === 0) {
    return "не указана";
  }

  const sum = sanitized.reduce((acc, e) => acc + e.weight, 0);
  let r = random() * sum;

  for (const e of sanitized) {
    r -= e.weight;
    if (r <= 0) {
      return e.name;
    }
  }

  return sanitized[sanitized.length - 1].name;
}

export function specialtyLabelForInsight(specialty: string | undefined): string {
  const t = (specialty ?? "").trim();
  return t.length > 0 ? t : "не указана";
}

export async function resolveUserSpecialtyFromDb(
  db: any,
  userLookup: string,
): Promise<string | undefined> {
  const trimmed = userLookup.trim();
  if (!trimmed) {
    return undefined;
  }

  const asId = await db.normalizeId("users", trimmed);
  if (asId) {
    const u = await db.get(asId);
    const s = (u as { specialization?: string } | null)?.specialization;
    return typeof s === "string" && s.trim() ? s.trim() : undefined;
  }

  const byMongo = await db
    .query("users")
    .withIndex("by_mongo_id", (q: any) => q.eq("mongoId", trimmed))
    .unique();

  const s = (byMongo as { specialization?: string } | null)?.specialization;
  return typeof s === "string" && s.trim() ? s.trim() : undefined;
}
