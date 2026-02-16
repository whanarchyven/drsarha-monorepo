import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { companyDoc, companyFields } from "../models/company";

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


