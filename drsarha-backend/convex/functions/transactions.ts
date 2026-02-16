import { query, mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { starsTransactionDoc, starsTransactionFields, expTransactionDoc, expTransactionFields } from "../models/transactions";

export const createStars = mutation({
  args: v.object(starsTransactionFields),
  returns: starsTransactionDoc,
  handler: async ({ db }, data) => {
    const id = await db.insert("stars_transactions", data as any);
    return (await db.get(id))!;
  },
});

export const createExp = mutation({
  args: v.object(expTransactionFields),
  returns: expTransactionDoc,
  handler: async ({ db }, data) => {
    const id = await db.insert("exp_transactions", data as any);
    return (await db.get(id))!;
  },
});

// Internal versions for use in internal mutations
export const createStarsInternal = internalMutation({
  args: v.object(starsTransactionFields),
  returns: starsTransactionDoc,
  handler: async ({ db }, data) => {
    const id = await db.insert("stars_transactions", data as any);
    return (await db.get(id))!;
  },
});

export const createExpInternal = internalMutation({
  args: v.object(expTransactionFields),
  returns: expTransactionDoc,
  handler: async ({ db }, data) => {
    const id = await db.insert("exp_transactions", data as any);
    return (await db.get(id))!;
  },
});

export const listStarsByUser = query({
  args: { userId: v.union(v.id("users"), v.string()), page: v.optional(v.number()), limit: v.optional(v.number()), type: v.optional(v.union(v.literal("plus"), v.literal("minus"))) },
  returns: v.object({ items: v.array(starsTransactionDoc), total: v.number(), page: v.number(), totalPages: v.number(), hasMore: v.boolean() }),
  handler: async ({ db }, { userId, page = 1, limit = 20, type }) => {
    let q = (db as any).query("stars_transactions").withIndex("by_user_created", (q: any) => q.eq("user_id", userId));
    let all = await q.collect();
    if (type) all = all.filter((t: any) => t.type === type);
    const total = all.length;
    const from = (page - 1) * limit;
    const items = all.sort((a: any, b: any) => b.created_at.localeCompare(a.created_at)).slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const listExpByUser = query({
  args: { userId: v.union(v.id("users"), v.string()), page: v.optional(v.number()), limit: v.optional(v.number()), type: v.optional(v.union(v.literal("plus"), v.literal("minus"))) },
  returns: v.object({ items: v.array(expTransactionDoc), total: v.number(), page: v.number(), totalPages: v.number(), hasMore: v.boolean() }),
  handler: async ({ db }, { userId, page = 1, limit = 20, type }) => {
    let q = (db as any).query("exp_transactions").withIndex("by_user_created", (q: any) => q.eq("user_id", userId));
    let all = await q.collect();
    if (type) all = all.filter((t: any) => t.type === type);
    const total = all.length;
    const from = (page - 1) * limit;
    const items = all.sort((a: any, b: any) => b.created_at.localeCompare(a.created_at)).slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});


