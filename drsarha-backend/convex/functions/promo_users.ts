import { httpAction, internalMutation, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";
import { promoUserDoc } from "../models/promoUser";
import { promoUsersCodeMaterialDoc } from "../models/promoUsersCodeMaterial";
import { v } from "convex/values";

type PromoUserInput = {
  email: string;
  phone: string;
  username?: string;
  name: string;
  code: string;
  utm?: string[];
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseUtm(value: unknown): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new Error("utm must be an array of strings");
  }
  const tags: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      throw new Error("utm must be an array of strings");
    }
    const t = item.trim();
    if (t) {
      tags.push(t);
    }
  }
  return tags.length > 0 ? tags : undefined;
}

function buildPromoUserInput(body: unknown): PromoUserInput {
  if (!isRecord(body)) {
    throw new Error("Request body must be a JSON object");
  }

  const email = normalizeString(body.email).toLowerCase();
  const phone = normalizeString(body.phone);
  const usernameRaw = normalizeString(body.username);
  const username = usernameRaw || undefined;
  const name = normalizeString(body.name);
  const code = normalizeString(body.code);
  const utm = parseUtm(body.utm);

  if (!email || !phone || !name || !code) {
    throw new Error("email, phone, name and code are required");
  }

  if (!email.includes("@")) {
    throw new Error("Invalid email address");
  }

  return {
    email,
    phone,
    ...(username !== undefined ? { username } : {}),
    name,
    code,
    utm,
  };
}

export const getMaterialByCodeInternal = internalQuery({
  args: { code: v.string() },
  returns: v.union(promoUsersCodeMaterialDoc, v.null()),
  handler: async ({ db }, { code }) => {
    const row = await db
      .query("promo_users_code_materials")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
    return row ?? null;
  },
});

export const createPromoUserInternal = internalMutation({
  args: {
    email: v.string(),
    phone: v.string(),
    username: v.optional(v.string()),
    name: v.string(),
    code: v.string(),
    utm: v.optional(v.array(v.string())),
  },
  returns: promoUserDoc,
  handler: async ({ db }, args) => {
    const { utm, username, ...rest } = args;
    const doc = {
      ...rest,
      ...(username !== undefined ? { username } : {}),
      ...(utm !== undefined ? { utm } : {}),
    };
    const promoUserId = await db.insert("promo_users", doc);
    const promoUser = await db.get(promoUserId);

    if (!promoUser) {
      throw new Error("Failed to create promo user");
    }

    return promoUser;
  },
});

export const collectPromoUserHttp = httpAction(async (ctx, req) => {
  try {
    const body: unknown = await req.json();
    const input = buildPromoUserInput(body);

    const material = await ctx.runQuery(
      internal.functions.promo_users.getMaterialByCodeInternal,
      { code: input.code }
    );

    if (!material) {
      return json({ error: "Не нашли такого кода :(" }, 401);
    }

    const promoUser = await ctx.runMutation(
      internal.functions.promo_users.createPromoUserInternal,
      {
        email: input.email,
        phone: input.phone,
        name: input.name,
        code: input.code,
        utm: input.utm,
        ...(input.username !== undefined ? { username: input.username } : {}),
      }
    );

    return json(
      {
        ...promoUser,
        material_url: material.material_url,
      },
      201
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to collect promo user";

    return json({ error: message }, 400);
  }
});
