import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { lootboxClaimDoc, lootboxClaimFields } from "../models/lootboxClaim";
import { lootboxDoc } from "../models/lootbox";

export const listByUser = query({
  args: { user_id: v.string(), status: v.optional(v.union(v.literal("open"), v.literal("closed"))), page: v.optional(v.number()), limit: v.optional(v.number()) },
  returns: v.object({ items: v.array(lootboxClaimDoc), total: v.number(), page: v.number(), totalPages: v.number(), hasMore: v.boolean() }),
  handler: async ({ db }, { user_id, status, page = 1, limit = 20 }) => {
    let all = await (db as any).query("lootbox_claims").withIndex("by_user", (q: any) => q.eq("userId", user_id)).collect();
    if (status) all = all.filter((c: any) => c.status === status);
    const total = all.length;
    const from = (page - 1) * limit;
    const items = all.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const getById = query({ args: { id: v.id("lootbox_claims") }, returns: v.union(lootboxClaimDoc, v.null()), handler: async ({ db }, { id }) => db.get(id) });

export const create = mutation({
  args: { user_id: v.string(), lootbox_id: v.id("lootboxes") },
  returns: lootboxClaimDoc,
  handler: async ({ db }, { user_id, lootbox_id }) => {
    const now = new Date().toISOString();
    const id = await db.insert("lootbox_claims", { userId: user_id, lootboxId: lootbox_id, status: "closed", createdAt: now, updatedAt: now } as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const open = mutation({
  args: { id: v.id("lootbox_claims"), user_id: v.string() },
  returns: lootboxClaimDoc,
  handler: async ({ db }, { id, user_id }) => {
    const claim = await db.get(id);
    if (!claim) throw new Error("Claim not found");
    if ((claim as any).userId !== user_id) throw new Error("Forbidden");
    if (claim.status === "open") return claim;
    const lootbox = await db.get((claim as any).lootboxId);
    if (!lootbox) throw new Error("Lootbox not found");
    const items = lootbox.items;
    const rnd = Math.random();
    let acc = 0;
    let pickedIdx = items.length - 1;
    for (let i = 0; i < items.length; i++) {
      acc += items[i].chance;
      if (rnd <= acc) { pickedIdx = i; break; }
    }
    const picked = items[pickedIdx];
    await db.patch(id, { status: "open", item: picked as any, itemIndex: pickedIdx, updated_at: new Date().toISOString() } as any);
    const updated = await db.get(id);
    return updated!;
  },
});


