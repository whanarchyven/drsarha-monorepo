import { httpAction, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { conferencePromocodeDoc } from "../models/conferencePromocode";

const conferencePromocodePatch = {
  code: v.optional(v.string()),
  amount: v.optional(v.number()),
  isActive: v.optional(v.boolean()),
  max_usage_count: v.optional(v.union(v.number(), v.null())),
  usage_count: v.optional(v.number()),
  payed_count: v.optional(v.number()),
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function isPromocodeValid(promocode: any) {
  if (!promocode || promocode.isActive !== true) {
    return false;
  }

  return (
    typeof promocode.max_usage_count !== "number" ||
    promocode.usage_count < promocode.max_usage_count
  );
}

async function getPromocodeByCode(db: any, code: string) {
  return await (db as any)
    .query("conference_promocodes")
    .withIndex("by_code", (q: any) => q.eq("code", code))
    .unique();
}

function extractPromocodeCode(body: any) {
  const candidates = [
    body?.code,
    body?.promocode,
    body?.promoCode,
    body?.promo_code,
    body?.conferencePromocode,
    body?.conference_promocode,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return normalizeCode(candidate);
    }
  }

  return "";
}

export const listConferencePromocodes = query({
  args: {},
  returns: v.array(conferencePromocodeDoc),
  handler: async ({ db }) => {
    return (await (db as any).query("conference_promocodes").collect()) as any;
  },
});

export const getConferencePromocode = query({
  args: {
    code: v.string(),
  },
  returns: v.union(conferencePromocodeDoc, v.null()),
  handler: async ({ db }, { code }) => {
    return ((await getPromocodeByCode(db, normalizeCode(code))) ?? null) as any;
  },
});

export const createConferencePromocode = mutation({
  args: {
    code: v.string(),
    amount: v.number(),
    isActive: v.optional(v.boolean()),
    max_usage_count: v.optional(v.union(v.number(), v.null())),
  },
  returns: conferencePromocodeDoc,
  handler: async ({ db }, { code, amount, isActive, max_usage_count }) => {
    const normalizedCode = normalizeCode(code);
    const existing = await getPromocodeByCode(db, normalizedCode);
    if (existing) {
      throw new Error("Conference promocode already exists");
    }

    const now = Date.now();
    const id = await db.insert("conference_promocodes", {
      code: normalizedCode,
      amount,
      isActive: isActive ?? true,
      max_usage_count,
      usage_count: 0,
      payed_count: 0,
      createdAt: now,
      updatedAt: now,
    } as any);

    return (await db.get(id))! as any;
  },
});

export const updateConferencePromocode = mutation({
  args: {
    id: v.id("conference_promocodes"),
    patch: v.object(conferencePromocodePatch),
  },
  returns: v.union(conferencePromocodeDoc, v.null()),
  handler: async ({ db }, { id, patch }) => {
    const existing = await db.get(id);
    if (!existing) {
      return null;
    }

    const nextCode = patch.code !== undefined ? normalizeCode(patch.code) : existing.code;
    if (nextCode !== existing.code) {
      const hit = await getPromocodeByCode(db, nextCode);
      if (hit) {
        throw new Error("Conference promocode already exists");
      }
    }

    await db.patch(id, {
      ...patch,
      code: nextCode,
      updatedAt: Date.now(),
    } as any);

    return (await db.get(id))! as any;
  },
});

export const deleteConferencePromocode = mutation({
  args: {
    id: v.id("conference_promocodes"),
  },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    const existing = await db.get(id);
    if (!existing) {
      return false;
    }

    await db.delete(id);
    return true;
  },
});

export const validateConferencePromocodeMutation = mutation({
  args: {
    code: v.string(),
  },
  returns: v.object({
    is_valid: v.boolean(),
    amount: v.number(),
  }),
  handler: async ({ db }, { code }) => {
    const promocode = await getPromocodeByCode(db, normalizeCode(code));
    if (!isPromocodeValid(promocode)) {
      return { is_valid: false, amount: 0 };
    }

    await db.patch(promocode._id, {
      usage_count: (promocode.usage_count ?? 0) + 1,
      updatedAt: Date.now(),
    } as any);

    return {
      is_valid: true,
      amount: typeof promocode.amount === "number" ? promocode.amount : 0,
    };
  },
});

export const markConferencePromocodePayed = mutation({
  args: {
    code: v.string(),
  },
  returns: v.boolean(),
  handler: async ({ db }, { code }) => {
    const promocode = await getPromocodeByCode(db, normalizeCode(code));
    if (!promocode) {
      return false;
    }

    await db.patch(promocode._id, {
      payed_count: (promocode.payed_count ?? 0) + 1,
      updatedAt: Date.now(),
    } as any);

    return true;
  },
});

export const validateConferencePromocode = httpAction(async (ctx, req) => {
  try {
    const body = await req.json();
    const code = extractPromocodeCode(body);

    if (!code) {
      return json({ is_valid: false, amount: 0, error: "promocode is required" }, 400);
    }

    const result = await ctx.runMutation(
      (api as any).functions.conference_promocodes.validateConferencePromocodeMutation,
      { code }
    );

    return json(result, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to validate conference promocode";
    return json({ is_valid: false, amount: 0, error: message }, 400);
  }
});

export const markConferencePromocodePayedHttp = httpAction(async (ctx, req) => {
  try {
    const body = await req.json();
    const code = extractPromocodeCode(body);

    if (!code) {
      return json({ marked: false, error: "promocode is required" }, 400);
    }

    const marked = await ctx.runMutation(
      (api as any).functions.conference_promocodes.markConferencePromocodePayed,
      { code }
    );

    return json({ marked }, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to mark conference promocode as payed";
    return json({ marked: false, error: message }, 400);
  }
});
