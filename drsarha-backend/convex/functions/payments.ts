import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { paymentDoc, paymentFields } from "../models/payment";

export const create = mutation({
  args: v.object(paymentFields),
  returns: paymentDoc,
  handler: async ({ db }, args) => {
    const _id = await db.insert("payments", args as any);
    return (await db.get(_id))!;
  },
});

export const updateByPaymentId = mutation({
  args: { paymentId: v.string(), patch: v.object({ status: v.optional(v.string()) }) },
  returns: v.boolean(),
  handler: async ({ db }, { paymentId, patch }) => {
    const hit = await (db as any).query("payments").withIndex("by_payment_id", (q: any) => q.eq("paymentId", paymentId)).first();
    if (!hit) return false;
    await db.patch(hit._id, patch as any);
    return true;
  },
});

export const getByPaymentId = query({
  args: { paymentId: v.string() },
  returns: v.union(paymentDoc, v.null()),
  handler: async ({ db }, { paymentId }) => {
    const hit = await (db as any).query("payments").withIndex("by_payment_id", (q: any) => q.eq("paymentId", paymentId)).first();
    return hit ?? null;
  },
});

export const listByEmail = query({
  args: { email: v.string() },
  returns: v.array(paymentDoc),
  handler: async ({ db }, { email }) => {
    const items = await (db as any).query("payments").withIndex("by_description", (q: any) => q.eq("description", email)).collect();
    // optionally filter by succeeded
    return items.filter((p: any) => p.payment?.status === 'succeeded' || p.status === 'succeeded');
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  returns: v.array(paymentDoc),
  handler: async ({ db }, { userId }) => {
    const items = await (db as any).query("payments").withIndex("by_user", (q: any) => q.eq("userId", userId)).collect();
    return items;
  },
});

