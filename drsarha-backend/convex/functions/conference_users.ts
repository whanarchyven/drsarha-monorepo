import { httpAction, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { conferenceUserDoc } from "../models/conferenceUser";

declare const process: {
  env: Record<string, string | undefined>;
};

const conferenceUserPatch = {
  name: v.optional(v.string()),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  isFullUser: v.optional(v.boolean()),
  isPaid: v.optional(v.boolean()),
  isApproved: v.optional(v.boolean()),
  side: v.optional(v.union(v.literal("jedi"), v.literal("sith"), v.literal("ai"))),
  password: v.optional(v.union(v.string(), v.null())),
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

function generatePassword(length = 12) {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function normalizeOptionalString(value: unknown) {
  const normalized = normalizeString(value);
  return normalized || undefined;
}

function extractConferenceUserEmail(payment: any, webhookData: any) {
  const candidates = [
    payment?.user?.email,
    payment?.metadata?.email,
    payment?.metadata?.conferenceUserEmail,
    payment?.object?.metadata?.email,
    payment?.object?.metadata?.conferenceUserEmail,
    webhookData?.object?.metadata?.email,
    webhookData?.object?.metadata?.conferenceUserEmail,
    payment?.description,
  ];

  for (const candidate of candidates) {
    const email = normalizeOptionalString(candidate);
    if (email && email.includes("@")) {
      return email.toLowerCase();
    }
  }

  return undefined;
}

async function subscribeConferenceUserToUniSender(user: {
  email: string;
  name: string;
  phone: string;
  password: string | null;
}) {
  const uniSenderApiKey = process.env.UNISENDER_API_KEY;
  if (!uniSenderApiKey) {
    return { success: false, skipped: true, reason: "UNISENDER_API_KEY is not configured" };
  }

  const params = new URLSearchParams({
    format: "json",
    api_key: uniSenderApiKey,
    list_ids: process.env.UNISENDER_CONFERENCE_LIST_ID || "66",
    "fields[email]": user.email,
    "fields[Name]": user.name || "",
    "fields[phone]": user.phone || "",
    "fields[password]": user.password || "",
    double_optin: "3",
  });

  const response = await fetch(
    `https://api.unisender.com/ru/api/subscribe?${params.toString()}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`UniSender subscribe failed: ${errorText}`);
  }

  return { success: true, skipped: false };
}

export const registerConferenceUser = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    side: v.union(v.literal("jedi"), v.literal("sith")),
  },
  returns: conferenceUserDoc,
  handler: async ({ db }, { name, phone, email, side }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    const approvedUserByEmail = await (db as any)
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", normalizedEmail))
      .first();

    const approvedUsersByPhone = approvedUserByEmail
      ? []
      : await (db as any)
          .query("users")
          .collect()
          .then((users: any[]) =>
            users.filter(
              (user) => user.phone === normalizedPhone && user.isApproved === true
            )
          );

    const isFullUser =
      approvedUserByEmail?.isApproved === true || approvedUsersByPhone.length > 0;

    const existingConferenceUser = await (db as any)
      .query("conference_users")
      .withIndex("by_email", (q: any) => q.eq("email", normalizedEmail))
      .first();

    if (existingConferenceUser) {
      await db.patch(existingConferenceUser._id, {
        name: name.trim(),
        phone: normalizedPhone,
        email: normalizedEmail,
        isFullUser,
        isPaid: false,
        isApproved: false,
        side,
        password: null,
      } as any);

      return (await db.get(existingConferenceUser._id))! as any;
    }

    const id = await db.insert("conference_users", {
      name: name.trim(),
      phone: normalizedPhone,
      email: normalizedEmail,
      isFullUser,
      isPaid: false,
      isApproved: false,
      side,
      password: null,
    } as any);

    return (await db.get(id))! as any;
  },
});

export const approveConferenceUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  returns: conferenceUserDoc,
  handler: async ({ db }, { email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const conferenceUser = await (db as any)
      .query("conference_users")
      .withIndex("by_email", (q: any) => q.eq("email", normalizedEmail))
      .first();

    if (!conferenceUser) {
      throw new Error("Conference user not found");
    }

    const nextPassword =
      typeof conferenceUser.password === "string" && conferenceUser.password
        ? conferenceUser.password
        : password;

    await db.patch(conferenceUser._id, {
      isApproved: true,
      isPaid: true,
      password: nextPassword,
    } as any);

    return (await db.get(conferenceUser._id))! as any;
  },
});

export const getConferenceUsers = query({
  args: {
    is_paid: v.optional(v.boolean()),
  },
  returns: v.array(conferenceUserDoc),
  handler: async ({ db }, { is_paid }) => {
    if (is_paid === true) {
      return (await (db as any)
        .query("conference_users")
        .withIndex("by_isPaid", (q: any) => q.eq("isPaid", true))
        .collect()) as any;
    }

    return (await (db as any).query("conference_users").collect()) as any;
  },
});

export const patchConferenceUserByEmail = mutation({
  args: {
    email: v.string(),
    patch: v.object(conferenceUserPatch),
  },
  returns: v.union(conferenceUserDoc, v.null()),
  handler: async ({ db }, { email, patch }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const conferenceUser = await (db as any)
      .query("conference_users")
      .withIndex("by_email", (q: any) => q.eq("email", normalizedEmail))
      .first();

    if (!conferenceUser) {
      return null;
    }

    await db.patch(conferenceUser._id, patch as any);
    return (await db.get(conferenceUser._id))! as any;
  },
});

export const registerConferenceUserHttp = httpAction(async (ctx, req) => {
  try {
    const body = await req.json();

    const name = normalizeString(body?.name);
    const phone = normalizeString(body?.phone);
    const email = normalizeString(body?.email);
    const side = body?.side;

    if (!name || !phone || !email || (side !== "jedi" && side !== "sith")) {
      return json(
        { error: "name, phone, email and valid side are required" },
        400
      );
    }

    const conferenceUser = await ctx.runMutation(
      (api as any).functions.conference_users.registerConferenceUser,
      {
      name,
      phone,
      email,
      side,
      }
    );

    return json(conferenceUser, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to register conference user";
    return json({ error: message }, 400);
  }
});

export const approveConferenceUserHttp = httpAction(async (ctx, req) => {
  try {
    const body = await req.json();
    const paymentId = normalizeString(body?.object?.id || body?.id || body?.paymentId);
    const event = normalizeString(body?.event);
    const status = normalizeOptionalString(body?.object?.status || body?.status);
    const paid =
      body?.object?.paid === true ||
      body?.paid === true ||
      event === "payment.succeeded";

    if (!paymentId) {
      return json({ error: "payment id is required" }, 400);
    }

    const payment = await ctx.runQuery(api.functions.payments.getByPaymentId, {
      paymentId,
    });
    if (!payment) {
      return json({ error: "Payment not found" }, 404);
    }

    const paymentPatch = {
      id: paymentId,
      event: event || undefined,
      status,
      paid,
      object:
        body?.object && typeof body.object === "object" && !Array.isArray(body.object)
          ? body.object
          : undefined,
    };

    await ctx.runMutation(api.functions.payments.updateByPaymentId, {
      paymentId,
      patch: paymentPatch as any,
    });

    const weekMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - payment._creationTime > weekMs) {
      return json({ error: "Payment is too old for conference approval" }, 400);
    }

    if (event !== "payment.succeeded") {
      return json({
        ok: true,
        approved: false,
        paymentId,
        status: status || "updated",
      });
    }

    const email = extractConferenceUserEmail(payment, body);
    if (!email) {
      return json({ error: "Conference user email not found in payment" }, 400);
    }

    const password = generatePassword();
    const conferenceUser = await ctx.runMutation(
      (api as any).functions.conference_users.approveConferenceUser,
      {
        email,
        password,
      }
    );

    const uniSenderResult = await subscribeConferenceUserToUniSender({
      email: conferenceUser.email,
      name: conferenceUser.name,
      phone: conferenceUser.phone,
      password: conferenceUser.password,
    });

    return json(
      {
        ok: true,
        conferenceUser,
        paymentId,
        status: status || "succeeded",
        uniSender: uniSenderResult,
      },
      200
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to approve conference user";
    const status = message.includes("not found") ? 404 : 400;
    return json({ error: message }, status);
  }
});

export const countConferenceUsers = query({
  returns: v.object({ approved: v.number(), all: v.number() }),
  handler: async ({ db }) => {
    const paid = await (db as any).query("conference_users").withIndex("by_isPaid", (q: any) => q.eq("isPaid", true)).collect();
    const all = await (db as any).query("conference_users").collect();
    return { approved: paid.length, all: all.length };
  },
});

export const countConferenceUsersHttpAction = httpAction(async (ctx, req) => {
  try {
    const count = await ctx.runQuery(api.functions.conference_users.countConferenceUsers, {});
    return json({ message: `Здравствуйте, Алёна. Всего зарегистрировано пользователей: ${count.all}, из них оплачено: ${count.approved}` }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to count conference users";
    return json({ message: `Ошибка: ${message}` }, 400);
  }
});