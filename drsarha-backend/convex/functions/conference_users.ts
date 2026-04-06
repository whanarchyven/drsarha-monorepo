import { action, httpAction, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { conferenceEmailLogDoc } from "../models/conferenceEmailLog";
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

const CONFERENCE_ACCESS_EMAIL_SUBJECT =
  "Ваши доступы на конференцию Равновесие силы 4 апреля.";

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

const conferenceUsersListResponse = v.object({
  items: v.array(conferenceUserDoc),
  total: v.number(),
  page: v.number(),
  totalPages: v.number(),
  hasMore: v.boolean(),
});

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

function extractConferencePromocode(payment: any, webhookData: any) {
  const candidates = [
    payment?.metadata?.promocode,
    payment?.metadata?.promoCode,
    payment?.metadata?.promo_code,
    payment?.metadata?.conferencePromocode,
    payment?.metadata?.conference_promocode,
    payment?.object?.metadata?.promocode,
    payment?.object?.metadata?.promoCode,
    payment?.object?.metadata?.promo_code,
    payment?.object?.metadata?.conferencePromocode,
    payment?.object?.metadata?.conference_promocode,
    webhookData?.metadata?.promocode,
    webhookData?.metadata?.promoCode,
    webhookData?.metadata?.promo_code,
    webhookData?.metadata?.conferencePromocode,
    webhookData?.metadata?.conference_promocode,
    webhookData?.object?.metadata?.promocode,
    webhookData?.object?.metadata?.promoCode,
    webhookData?.object?.metadata?.promo_code,
    webhookData?.object?.metadata?.conferencePromocode,
    webhookData?.object?.metadata?.conference_promocode,
  ];

  for (const candidate of candidates) {
    const value = normalizeOptionalString(candidate);
    if (value) {
      return value.toUpperCase();
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

async function sendConferenceAccessEmailToUser(user: {
  email: string;
  password: string | null;
  log: (message: string, details?: unknown) => void;
}) {
  const uniSenderApiKey = process.env.UNISENDER_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL;
  const listId = "70";

  if (!uniSenderApiKey || !senderEmail) {
    user.log("skip: unisender config is missing", {
      hasApiKey: Boolean(uniSenderApiKey),
      hasSenderEmail: Boolean(senderEmail),
    });
    return {
      success: false,
      skipped: true,
      reason: "UNISENDER_API_KEY or SENDER_EMAIL is not configured",
    };
  }

  if (!user.password) {
    user.log("skip: conference user password is empty");
    return {
      success: false,
      skipped: true,
      reason: "Conference user password is empty",
    };
  }

  const body = `
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #1f2937;">
  <div style="margin-bottom: 24px; text-align: center;">
    <img
      src="https://resize.yandex.net/mailservice?url=https%3A%2F%2Fimg.hiteml.com%2Fen%2Fv5%2Fuser-files%3FuserId%3D7429954%26resource%3Dhimg%26disposition%3Dinline%26name%3D6opqn9tojn3ryu4edont8wqw9sjwpg7no4fr64aymu1ado91cjxhsz8sre6ttfbgip4ckuephpsnzr&proxy=yes&key=5db28771fe76f5ed167e3d4df5704bd8"
      alt="Dr. Sarha conference"
      style="max-width: 100%; height: auto; border: 0; display: inline-block;"
    />
  </div>

  <p>Всё готово — завтра, 4 апреля, мы встречаемся на онлайн-конференции «Равновесие силы: взгляд с двух сторон на терапию кожных заболеваний».</p>

  <p><strong>Ваша ссылка на трансляцию:</strong><br />
  👉 <a href="https://drsarha.ru/conference/live">https://drsarha.ru/conference/live</a></p>

  <p><strong>Ваш логин:</strong><br />
  👉 ${user.email}</p>

  <p><strong>Ваш пароль:</strong><br />
  👉 ${user.password}</p>

  <p><strong>⏰ Начало в 10:00 (МСК)</strong></p>

  <p><strong>📋 Инструкция для подключения</strong></p>

  <ol>
    <li>Сохраните это письмо, чтобы не искать ссылку в последний момент.</li>
    <li>Рекомендуем подключиться за 5–10 минут до начала — в 9:50 по МСК, чтобы проверить звук и соединение.</li>
    <li>Перейдите по ссылке выше — трансляция откроется в браузере. Лучше всего работает Google Chrome, но подойдёт и любой другой современный браузер.</li>
    <li>Если смотрите с телефона — убедитесь, что вы подключены к стабильному Wi-Fi или мобильному интернету.</li>
    <li>Включите звук на устройстве и проверьте громкость — трансляция идёт со звуком.</li>
    <li>Задавайте вопросы спикерам в чате трансляции, чтобы забрать и выиграть призы.</li>
  </ol>

  <p><strong>⚠️ Если что-то пошло не так</strong></p>

  <p>
    — Ссылка не открывается? Попробуйте другой браузер или перезагрузите страницу.<br />
    — Нет звука? Проверьте, не отключён ли звук в браузере (значок динамика на вкладке).<br />
    — Остались вопросы? Напишите нам: @Alena_Savelova
  </p>

  <p>Ждём вас завтра в 10:00!</p>

  <p>С теплом,<br />Команда Dr. Sarha</p>
</div>`;

  const urlParams = new URLSearchParams({
    format: "json",
    api_key: uniSenderApiKey,
    email: user.email,
    sender_name: "Dr. Sarha",
    sender_email: senderEmail,
    subject: CONFERENCE_ACCESS_EMAIL_SUBJECT,
    body,
    list_id: listId,
  });

  user.log("unisender request", {
    email: user.email,
    senderEmail,
    listId,
    subject: CONFERENCE_ACCESS_EMAIL_SUBJECT,
    hasPassword: Boolean(user.password),
    bodyLength: body.length,
  });

  const response = await fetch(
    `https://api.unisender.com/ru/api/sendEmail?${urlParams.toString()}`
  );

  const responseText = await response.text();

  user.log("unisender response", {
    email: user.email,
    status: response.status,
    ok: response.ok,
    body: responseText,
  });

  if (!response.ok) {
    return {
      success: false,
      skipped: false,
      reason: `UniSender sendEmail failed: ${responseText}`,
      responseBody: responseText,
    };
  }

  try {
    const parsed = JSON.parse(responseText);

    user.log("unisender parsed response", {
      email: user.email,
      parsed,
    });

    if (parsed?.error) {
      return {
        success: false,
        skipped: false,
        reason: `UniSender sendEmail returned error: ${JSON.stringify(parsed)}`,
        responseBody: responseText,
      };
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      user.log("unisender response is not JSON");
    } else {
      throw error;
    }
  }

  user.log("unisender accepted message");

  return { success: true, skipped: false, responseBody: responseText };
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

    const approvedUserByPhone =
      approvedUserByEmail?.isApproved === true
        ? null
        : await (db as any)
            .query("users")
            .withIndex("by_phone_isApproved", (q: any) =>
              q.eq("phone", normalizedPhone).eq("isApproved", true)
            )
            .first();

    const isFullUser =
      approvedUserByEmail?.isApproved === true || approvedUserByPhone !== null;

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

export const loginConferenceUser = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  returns: v.union(conferenceUserDoc, v.null()),
  handler: async ({ db }, { email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      return null;
    }

    const conferenceUser = await (db as any)
      .query("conference_users")
      .withIndex("by_email", (q: any) => q.eq("email", normalizedEmail))
      .first();

    if (!conferenceUser) {
      return null;
    }

    if (conferenceUser.isApproved !== true || conferenceUser.isPaid !== true) {
      return null;
    }

    if (conferenceUser.password !== normalizedPassword) {
      return null;
    }

    return conferenceUser as any;
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

export const listConferenceUsers = query({
  args: {
    search: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: conferenceUsersListResponse,
  handler: async ({ db }, { search, page = 1, limit = 20 }) => {
    const normalizedSearch = normalizeString(search).toLowerCase();
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.max(1, Math.floor(limit));
    const from = (safePage - 1) * safeLimit;

    let items = await (db as any).query("conference_users").collect();

    if (normalizedSearch) {
      items = items.filter((user: any) =>
        normalizeString(user.email).toLowerCase().includes(normalizedSearch)
      );
    }

    items = items.sort(
      (left: any, right: any) => right._creationTime - left._creationTime
    );

    const total = items.length;

    return {
      items: items.slice(from, from + safeLimit),
      total,
      page: safePage,
      totalPages: Math.ceil(total / safeLimit) || 1,
      hasMore: safePage * safeLimit < total,
    };
  },
});

export const approveConferenceUserAdmin = mutation({
  args: {
    id: v.id("conference_users"),
  },
  returns: conferenceUserDoc,
  handler: async ({ db }, { id }) => {
    const conferenceUser = await db.get(id);

    if (!conferenceUser) {
      throw new Error("Conference user not found");
    }

    const password = generatePassword();

    await db.patch(id, {
      isApproved: true,
      isPaid: true,
      password,
    } as any);

    return (await db.get(id))! as any;
  },
});

export const getPaidConferenceUsers = query({
  args: {
    registerAfter: v.optional(v.number()),
  },
  returns: v.array(v.string()),
  handler: async ({ db }, { registerAfter }) => {
    const paidUsers = await (db as any)
      .query("conference_users")
      .withIndex("by_isPaid", (q: any) => q.eq("isPaid", true))
      .collect();

    return paidUsers
      .filter((user: any) =>
        typeof registerAfter === "number"
          ? user._creationTime > registerAfter
          : true
      )
      .map((user: any) => normalizeString(user.email).toLowerCase())
      .filter((email: string) => email.length > 0);
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

export const getConferenceUserByEmail = query({
  args: {
    email: v.string(),
  },
  returns: v.union(conferenceUserDoc, v.null()),
  handler: async ({ db }, { email }) => {
    const normalizedEmail = email.trim().toLowerCase();

    return ((await (db as any)
      .query("conference_users")
      .withIndex("by_email", (q: any) => q.eq("email", normalizedEmail))
      .first()) ?? null) as any;
  },
});

export const createConferenceEmailLog = mutation({
  args: {
    email: v.string(),
    subject: v.string(),
    provider: v.string(),
    status: v.union(
      v.literal("delivered"),
      v.literal("skipped"),
      v.literal("error")
    ),
    logs: v.array(v.string()),
    responseBody: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  returns: conferenceEmailLogDoc,
  handler: async ({ db }, args) => {
    const id = await db.insert("conference_email_logs", {
      ...args,
      createdAt: Date.now(),
    } as any);

    return (await db.get(id))! as any;
  },
});

export const sendConferenceAccessEmails = action({
  args: {
    emails: v.array(v.string()),
  },
  returns: v.object({
    total: v.number(),
    sent: v.number(),
    skipped: v.number(),
    failed: v.number(),
    results: v.array(
      v.object({
        email: v.string(),
        status: v.union(
          v.literal("sent"),
          v.literal("skipped"),
          v.literal("failed")
        ),
        reason: v.optional(v.string()),
      })
    ),
  }),
  handler: async (ctx, { emails }) => {
    const normalizedEmails = Array.from(
      new Set(
        emails
          .map((email) => normalizeString(email).toLowerCase())
          .filter((email) => email.includes("@"))
      )
    );

    console.log("[conference_users.sendConferenceAccessEmails] start", {
      requestedCount: emails.length,
      normalizedCount: normalizedEmails.length,
      normalizedEmails,
    });

    const results: {
      email: string;
      status: "sent" | "skipped" | "failed";
      reason?: string;
    }[] = [];

    for (const email of normalizedEmails) {
      const emailLogs: string[] = [];
      const pushEmailLog = (message: string, details?: unknown) => {
        const line =
          details === undefined
            ? message
            : `${message} ${JSON.stringify(details)}`;
        emailLogs.push(line);
        console.log("[conference_users.sendConferenceAccessEmails]", {
          email,
          message,
          details,
        });
      };

      let emailStatus: "delivered" | "skipped" | "error" = "skipped";
      let responseBody: string | undefined;
      let errorMessage: string | undefined;

      pushEmailLog("processing started");

      const conferenceUser = await ctx.runQuery(
        (api as any).functions.conference_users.getConferenceUserByEmail,
        { email }
      );

      if (!conferenceUser) {
        pushEmailLog("skipped: conference user not found");
        results.push({
          email,
          status: "skipped",
          reason: "Conference user not found",
        });
      } else {
        pushEmailLog("conference user found", {
          isPaid: conferenceUser.isPaid,
          isApproved: conferenceUser.isApproved,
          hasPassword: Boolean(conferenceUser.password),
        });

        if (conferenceUser.isPaid !== true) {
          pushEmailLog("skipped: conference user is not paid");
          results.push({
            email,
            status: "skipped",
            reason: "Conference user is not paid",
          });
        } else {
          try {
            pushEmailLog("sending email");
            const sendResult = await sendConferenceAccessEmailToUser({
              email: conferenceUser.email,
              password: conferenceUser.password,
              log: pushEmailLog,
            });

            responseBody = sendResult.responseBody;

            if (sendResult.success) {
              emailStatus = "delivered";
              pushEmailLog("email delivered to provider");
              results.push({ email, status: "sent" });
            } else {
              errorMessage = sendResult.reason;

              if (sendResult.skipped) {
                emailStatus = "skipped";
                pushEmailLog("email skipped", { reason: sendResult.reason });
                results.push({
                  email,
                  status: "skipped",
                  reason: sendResult.reason,
                });
              } else {
                emailStatus = "error";
                pushEmailLog("email failed", { reason: sendResult.reason });
                results.push({
                  email,
                  status: "failed",
                  reason: sendResult.reason,
                });
              }
            }
          } catch (error) {
            errorMessage =
              error instanceof Error ? error.message : "Unknown send email error";
            emailStatus = "error";
            pushEmailLog("unexpected send error", { reason: errorMessage });
            results.push({
              email,
              status: "failed",
              reason: errorMessage,
            });
          }
        }
      }

      try {
        await ctx.runMutation(
          (api as any).functions.conference_users.createConferenceEmailLog,
          {
            email,
            subject: CONFERENCE_ACCESS_EMAIL_SUBJECT,
            provider: "unisender",
            status: emailStatus,
            logs: emailLogs,
            responseBody,
            errorMessage,
          }
        );
      } catch (logError) {
        console.error(
          "[conference_users.sendConferenceAccessEmails] failed to save log",
          {
            email,
            reason:
              logError instanceof Error
                ? logError.message
                : "Unknown log save error",
          }
        );
      }
    }

    const summary = {
      total: normalizedEmails.length,
      sent: results.filter((item) => item.status === "sent").length,
      skipped: results.filter((item) => item.status === "skipped").length,
      failed: results.filter((item) => item.status === "failed").length,
    };

    console.log("[conference_users.sendConferenceAccessEmails] done", summary);

    return {
      ...summary,
      results,
    };
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
    const promocode = extractConferencePromocode(payment, body);
    const promocodeMarked = promocode
      ? await ctx.runMutation(
          (api as any).functions.conference_promocodes.markConferencePromocodePayed,
          {
            code: promocode,
          }
        )
      : false;

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
        promocode: promocode ? { code: promocode, marked: promocodeMarked } : null,
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

export const getUnpaidConferenceUserEmails = query({
  args: {},
  returns: v.string(),
  handler: async ({ db }) => {
    const unpaidUsers = await (db as any)
      .query("conference_users")
      .withIndex("by_isPaid", (q: any) => q.eq("isPaid", false))
      .collect();

    return unpaidUsers
      .map((user: any) => normalizeString(user.email).toLowerCase())
      .filter((email: string) => email.length > 0)
      .join("\n");
  },
});