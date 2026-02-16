import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { userSavedPinDoc } from "../models/pin";

export const save = mutation({
  args: { userId: v.string(), pinId: v.string() },
  returns: userSavedPinDoc,
  handler: async ({ db }, { userId, pinId }) => {
    const exists = await (db as any).query("user_saved_pins").withIndex("by_user_pin", (q: any) => q.eq("userId", userId).eq("pinId", pinId)).unique();
    if (exists) throw new Error("Already saved");
    const id = await db.insert("user_saved_pins", { userId, pinId, savedAt: new Date().toISOString() } as any);
    return (await db.get(id))!;
  },
});

export const remove = mutation({
  args: { userId: v.string(), pinId: v.string() },
  returns: v.boolean(),
  handler: async ({ db }, { userId, pinId }) => {
    const exists = await (db as any).query("user_saved_pins").withIndex("by_user_pin", (q: any) => q.eq("userId", userId).eq("pinId", pinId)).unique();
    if (!exists) return false;
    await db.delete(exists._id);
    return true;
  },
});

export const list = query({
  args: { userId: v.string(), page: v.optional(v.number()), limit: v.optional(v.number()) },
  returns: v.object({ items: v.array(userSavedPinDoc), total: v.number(), page: v.number(), totalPages: v.number(), hasMore: v.boolean() }),
  handler: async ({ db }, { userId, page = 1, limit = 20 }) => {
    let all = await (db as any).query("user_saved_pins").withIndex("by_user_saved", (q: any) => q.eq("userId", userId)).collect();
    all.sort((a: any, b: any) => b.savedAt.localeCompare(a.savedAt));
    const total = all.length; const from = (page - 1) * limit; const items = all.slice(from, from + limit); const totalPages = Math.ceil(total / limit) || 1; return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const checkSaved = query({
  args: { userId: v.string(), pinIds: v.array(v.string()) },
  returns: v.array(v.string()),
  handler: async ({ db }, { userId, pinIds }) => {
    const saved: Array<string> = [];
    for (const pinId of pinIds) {
      const exists = await (db as any).query("user_saved_pins").withIndex("by_user_pin", (q: any) => q.eq("userId", userId).eq("pinId", pinId)).unique();
      if (exists) saved.push(pinId);
    }
    return saved;
  },
});


