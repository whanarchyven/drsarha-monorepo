import { httpAction, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { paymentDoc, paymentFields } from "../models/payment";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function normalizePaymentData(raw: Record<string, unknown>) {
  const objectData =
    raw.object && typeof raw.object === "object" && !Array.isArray(raw.object)
      ? (raw.object as Record<string, unknown>)
      : undefined;

  return {
    ...raw,
    id:
      (typeof raw.id === "string" && raw.id) ||
      (typeof objectData?.id === "string" ? objectData.id : undefined),
    status:
      (typeof raw.status === "string" && raw.status) ||
      (typeof objectData?.status === "string" ? objectData.status : undefined),
    paid:
      typeof raw.paid === "boolean"
        ? raw.paid
        : typeof objectData?.paid === "boolean"
          ? objectData.paid
          : undefined,
    metadata:
      raw.metadata !== undefined ? raw.metadata : objectData?.metadata,
  };
}

export const create = mutation({
  args: v.object(paymentFields),
  returns: paymentDoc,
  handler: async ({ db }, args) => {
    const _id = await db.insert("payments", normalizePaymentData(args as any) as any);
    return (await db.get(_id))! as any;
  },
});

export const upsertByPaymentId = mutation({
  args: { data: v.object(paymentFields) },
  returns: paymentDoc,
  handler: async ({ db }, { data }) => {
    const normalizedData = normalizePaymentData(data as any);
    const paymentId =
      typeof normalizedData.id === "string" ? normalizedData.id : undefined;

    if (paymentId) {
      const hit = await (db as any)
        .query("payments")
        .withIndex("by_payment_id", (q: any) => q.eq("id", paymentId))
        .first();

      if (hit) {
        await db.patch(hit._id, normalizedData as any);
        return (await db.get(hit._id))! as any;
      }
    }

    const _id = await db.insert("payments", normalizedData as any);
    return (await db.get(_id))! as any;
  },
});

export const updateByPaymentId = mutation({
  args: { paymentId: v.string(), patch: v.object(paymentFields) },
  returns: v.boolean(),
  handler: async ({ db }, { paymentId, patch }) => {
    const hit = await (db as any)
      .query("payments")
      .withIndex("by_payment_id", (q: any) => q.eq("id", paymentId))
      .first();
    if (!hit) return false;
    await db.patch(hit._id, patch as any);
    return true;
  },
});

export const getByPaymentId = query({
  args: { paymentId: v.string() },
  returns: v.union(paymentDoc, v.null()),
  handler: async ({ db }, { paymentId }) => {
    const hit = await (db as any)
      .query("payments")
      .withIndex("by_payment_id", (q: any) => q.eq("id", paymentId))
      .first();
    return hit ?? null;
  },
});

export const createPaymentHttp = httpAction(async (ctx, req) => {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json({ error: "Payment payload must be an object" }, 400);
    }

    const payment = await ctx.runMutation(api.functions.payments.upsertByPaymentId, {
      data: body as any,
    });

    return json(payment, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create payment";
    return json({ error: message }, 400);
  }
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

