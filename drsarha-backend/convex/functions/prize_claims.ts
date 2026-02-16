import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { prizeClaimDoc, prizeClaimFields } from "../models/prizeClaim";
import { mutation as internalMutation } from "../_generated/server";

export const create = mutation({
  args: { userId: v.string(), prizeId: v.id("prizes"), transactionId: v.union(v.id("stars_transactions"), v.string()) },
  returns: prizeClaimDoc,
  handler: async ({ db }, { userId, prizeId, transactionId }) => {
    const id = await db.insert("prize_claims", { userId, prizeId, transactionId, status: "backlog", claimedAt: new Date().toISOString() } as any);
    return (await db.get(id))!;
  },
});

export const listByUser = query({
  args: { userId: v.string() },
  returns: v.array(prizeClaimDoc),
  handler: async ({ db }, { userId }) => {
    const all = await (db as any).query("prize_claims").withIndex("by_user", (q: any) => q.eq("userId", userId)).collect();
    return all;
  },
});

export const getById = query({ args: { id: v.id("prize_claims") }, returns: v.union(prizeClaimDoc, v.null()), handler: async ({ db }, { id }) => db.get(id) });

export const updateStatus = mutation({
  args: { id: v.id("prize_claims"), status: prizeClaimFields.status },
  returns: prizeClaimDoc,
  handler: async ({ db }, { id, status }) => {
    await db.patch(id, { status } as any);
    return (await db.get(id))!;
  },
});

export const list = query({
  args: {
    page: v.optional(v.union(v.number(), v.string())),
    limit: v.optional(v.union(v.number(), v.string())),
    userId: v.optional(v.string()),
    prizeId: v.optional(v.id("prizes")),
    status: v.optional(prizeClaimFields.status),
  },
  returns: v.object({ items: v.array(prizeClaimDoc), total: v.number(), page: v.number(), totalPages: v.number(), hasMore: v.boolean() }),
  handler: async ({ db }, { page = 1, limit = 10, userId, prizeId, status }) => {
    // Преобразуем строки в числа, если они пришли как строки
    const pageNum = typeof page === 'string' ? Number(page) : (page ?? 1);
    const limitNum = typeof limit === 'string' ? Number(limit) : (limit ?? 10);
    
    let candidates = await (db as any).query("prize_claims").collect();
    if (userId) candidates = candidates.filter((c: any) => c.userId === userId);
    if (prizeId) candidates = candidates.filter((c: any) => c.prizeId === prizeId);
    if (status) candidates = candidates.filter((c: any) => c.status === status);
    const total = candidates.length;
    const from = (pageNum - 1) * limitNum;
    const items = candidates.slice(from, from + limitNum);
    const totalPages = Math.ceil(total / limitNum) || 1;
    return { items, total, page: pageNum, totalPages, hasMore: pageNum < totalPages };
  },
});

export const remove = mutation({ args: { id: v.id("prize_claims") }, returns: v.boolean(), handler: async ({ db }, { id }) => { await db.delete(id); return true; } });

// Пользовательский инвентарь (минимум для approveRefund)
export const pullPrizeFromUserInventory = mutation({
  args: { userId: v.id("users"), prizeMongoId: v.string() },
  returns: v.boolean(),
  handler: async ({ db }, { userId, prizeMongoId }) => {
    const user = await db.get(userId);
    if (!user) return false;
    const prizes = (user as any).prizes || [];
    const filtered = prizes.filter((p: any) => p.prizeId !== prizeMongoId);
    await db.patch(userId, { prizes: filtered } as any);
    return true;
  }
});


