import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { userBanDoc } from "../models/userBan";

export const create = mutation({
  args: { userId: v.string(), bannedUserId: v.string() },
  returns: userBanDoc,
  handler: async ({ db }, { userId, bannedUserId }) => {
    const existing = await (db as any)
      .query("user_bans")
      .withIndex("by_user_and_banned", (q: any) =>
        q.eq("userId", userId).eq("bannedUserId", bannedUserId),
      )
      .unique();
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const id = await db.insert("user_bans", {
      userId,
      bannedUserId,
      createdAt: now,
    } as any);
    return (await db.get(id))!;
  },
});

export const remove = mutation({
  args: { userId: v.string(), bannedUserId: v.string() },
  returns: v.boolean(),
  handler: async ({ db }, { userId, bannedUserId }) => {
    const bans = await (db as any)
      .query("user_bans")
      .withIndex("by_user_and_banned", (q: any) =>
        q.eq("userId", userId).eq("bannedUserId", bannedUserId),
      )
      .collect();
    for (const ban of bans) {
      await db.delete(ban._id);
    }
    return true;
  },
});

export const list = query({
  args: { userId: v.string(), page: v.optional(v.number()), limit: v.optional(v.number()) },
  returns: v.object({
    items: v.array(userBanDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { userId, page = 1, limit = 50 }) => {
    const all = await (db as any)
      .query("user_bans")
      .withIndex("by_user_and_created", (q: any) => q.eq("userId", userId))
      .collect();
    all.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
    const total = all.length;
    const from = (page - 1) * limit;
    const items = all.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

