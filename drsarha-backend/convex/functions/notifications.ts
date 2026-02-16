import { query, mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { notificationDoc, notificationFields } from "../models/notification";

export const listByUser = query({
  args: { userId: v.union(v.id("users"), v.string()), page: v.optional(v.number()), limit: v.optional(v.number()), onlyUnread: v.optional(v.boolean()), type: v.optional(v.string()) },
  returns: v.object({ items: v.array(notificationDoc), total: v.number(), page: v.number(), totalPages: v.number(), hasMore: v.boolean(), unreadCount: v.number() }),
  handler: async ({ db }, { userId, page = 1, limit = 20, onlyUnread, type }) => {
    let q = (db as any).query("notifications").withIndex("by_user_created", (q: any) => q.eq("userId", userId));
    let all = await q.collect();
    if (onlyUnread) all = all.filter((n: any) => !n.isViewed);
    if (type) all = all.filter((n: any) => n.type === type);
    const total = all.length;
    const from = (page - 1) * limit;
    const items = all.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)).slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    const unreadCount = all.filter((n: any) => !n.isViewed).length;
    return { items, total, page, totalPages, hasMore: page < totalPages, unreadCount };
  },
});

export const create = mutation({ args: v.object(notificationFields), returns: notificationDoc, handler: async ({ db }, data) => { const id = await db.insert("notifications", data as any); return (await db.get(id))!; } });

// Internal version for use in internal mutations
export const createInternal = internalMutation({ args: v.object(notificationFields), returns: notificationDoc, handler: async ({ db }, data) => { const id = await db.insert("notifications", data as any); return (await db.get(id))!; } });

export const markAsRead = mutation({
  args: { id: v.id("notifications"), userId: v.union(v.id("users"), v.string()) },
  returns: v.boolean(),
  handler: async ({ db }, { id, userId }) => {
    const n = await db.get(id);
    if (!n || (n as any).userId !== userId) return false;
    await db.patch(id, { isViewed: true, updatedAt: new Date().toISOString() } as any);
    return true;
  },
});

export const markAllAsRead = mutation({
  args: { userId: v.union(v.id("users"), v.string()) },
  returns: v.number(),
  handler: async ({ db }, { userId }) => {
    const items = await (db as any).query("notifications").withIndex("by_user_viewed", (q: any) => q.eq("userId", userId).eq("isViewed", false)).collect();
    let count = 0;
    for (const n of items) {
      await db.patch(n._id, { isViewed: true, updatedAt: new Date().toISOString() } as any);
      count++;
    }
    return count;
  },
});

export const remove = mutation({ args: { id: v.id("notifications"), userId: v.union(v.id("users"), v.string()) }, returns: v.boolean(), handler: async ({ db }, { id, userId }) => { const n = await db.get(id); if (!n || (n as any).userId !== userId) return false; await db.delete(id); return true; } });

export const deleteAllByUser = mutation({
  args: { userId: v.union(v.id("users"), v.string()), batchSize: v.optional(v.number()) },
  returns: v.number(),
  handler: async ({ db }, { userId, batchSize = 200 }) => {
    let deleted = 0;
    let hasMore = true;
    
    // Удаляем батчами, чтобы не превысить лимиты Convex
    while (hasMore) {
      const page = await (db as any)
        .query("notifications")
        .withIndex("by_user_created", (q: any) => q.eq("userId", userId))
        .take(batchSize);
      
      if (page.length === 0) {
        hasMore = false;
        break;
      }
      
      for (const doc of page) {
        await db.delete(doc._id);
        deleted++;
      }
      
      // Если получили меньше документов, чем batchSize, значит это последний батч
      if (page.length < batchSize) {
        hasMore = false;
      }
    }
    
    return deleted;
  },
});


