import { defineTable } from "convex/server";
import { v } from "convex/values";

const dashboardType = v.union(
  v.literal("line"),
  v.literal("bar"),
  v.literal("pie"),
  v.literal("area"),
  v.literal("table"),
);

export const scaleFields = v.object({
  name: v.string(),
  value: v.number(),
  type: v.union(v.literal("linear"), v.literal("multiple")),
  autoscale: v.optional(v.object({
    enabled: v.boolean(),
    min_step: v.number(),
    max_step: v.number(),
    extremum: v.number(),
  })),
  scaleDistribution: v.optional(v.number()),
});

export const graphicFields = v.object({
  type: dashboardType,
  cols: v.number(),
});

export const statFields = v.object({
  name: v.string(),
  question_id: v.string(),
  scaleAll: v.number(),
  scales: v.array(scaleFields),
  graphics: v.array(graphicFields),
  // В сгенерированной схеме поля question_summary нет — удаляем для полной совместимости
});

export const dashboardFields = v.object({
  name: v.string(),
  icon: v.string(),
  stats: v.array(statFields),
  dashboardPercent: v.optional(v.number()),
});

export const companyFields = {
  name: v.string(),
  slug: v.string(),
  created_at: v.string(),
  updated_at: v.string(),
  logo: v.string(),
  description: v.string(),
  dashboards: v.array(dashboardFields),
  isActive: v.optional(v.boolean()),
  minGrowth: v.optional(v.number()),
  maxGrowth: v.optional(v.number()),
  totalGrowth: v.optional(v.number()),
  password: v.string(),
  mongoId: v.optional(v.string()),
};

export const companiesTable = defineTable(companyFields)
  .index("by_slug", ["slug"]) 
  .index("by_mongo_id", ["mongoId"]);

export const companyDoc = v.object({
  ...companyFields,
  _id: v.id("companies"),
  _creationTime: v.number(),
});


