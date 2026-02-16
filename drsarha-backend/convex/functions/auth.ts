"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal, api } from "../_generated/api";
import crypto from "crypto";

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function signJwtHS256(payload: Record<string, any>, secret: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const p = { ...payload };
  const encodedHeader = b64url(JSON.stringify(header));
  const encodedPayload = b64url(JSON.stringify(p));
  const data = `${encodedHeader}.${encodedPayload}`;
  const sig = crypto.createHmac("sha256", secret).update(data).digest();
  const signature = b64url(sig);
  return `${data}.${signature}`;
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 150000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");
  return `${salt}:${iterations}:${hash}`;
}

async function verifyPassword(password: string, stored?: string): Promise<boolean> {
  try {
    if (!stored || typeof stored !== "string") return false;
    if (stored.startsWith("$2")) {
      const bcrypt: any = await import("bcryptjs").catch(() => null);
      if (!bcrypt) return false;
      return await bcrypt.compare(password, stored);
    }
    const parts = stored.split(":");
    if (parts.length === 3) {
      const [salt, iterStr, hash] = parts;
      const iterations = parseInt(iterStr, 10) || 150000;
      const test = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");
      return hash === test;
    }
    return false;
  } catch {
    return false;
  }
}

export const register = action({
  args: {
    email: v.string(),
    password: v.string(),
    phone: v.string(),
    fullName: v.optional(v.string()),
    city: v.optional(v.string()),
    workplace: v.optional(v.string()),
    position: v.optional(v.string()),
    diploma: v.optional(v.string()),
    specialization: v.optional(v.string()),
    telegram: v.optional(v.string()),
    privateClinic: v.optional(v.boolean()),
    isPediatric: v.optional(v.boolean()),
    isScientific: v.optional(v.boolean()),
    refererId: v.optional(v.string()),
    plan: v.string(),
  },
  returns: v.object({
    message: v.string(),
    userId: v.optional(v.string()),
    token: v.optional(v.string()),
    status: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    const exist = await ctx.runQuery(api.functions.users.getByEmail, { email: args.email });
    if (exist) {
      return { message: "Пользователь с таким email уже существует", status: 400 };
    }
    const password = hashPassword(args.password);
    const subscribeTill = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    const doc = await ctx.runMutation(api.functions.users.create, {
      email: args.email,
      phone: args.phone,
      password,
      subscribeTill,
      fullName: args.fullName,
      city: args.city,
      workplace: args.workplace,
      position: args.position,
      diploma: args.diploma,
      specialization: args.specialization,
      telegram: args.telegram,
      privateClinic: args.privateClinic,
      isPediatric: args.isPediatric,
      isScientific: args.isScientific,
      refererId: args.refererId,
      plan: args.plan,
      tariff: "pro",
      isApproved: false,
    } as any);
    const secret = process.env.JWT_SECRET_KEY || "";
    const exp = Math.floor(Date.now() / 1000) + 86400;
    const token = signJwtHS256({ userId: doc._id, tariff: doc.tariff, subscribeTill: doc.subscribeTill, exp }, secret);
    return { message: "Благодарим вас за регистрацию! К сожалению, ваша анкета еще не прошла проверку. Ваша анкета будет проверена в течение 24 часов. Мы уведомим вас по указанному email", userId: doc._id, token, status: 401 };
  },
});

export const login = action({
  args: { email: v.string(), password: v.string(), userAgent: v.optional(v.string()) },
  returns: v.object({
    message: v.string(),
    status: v.optional(v.number()),
    token: v.optional(v.string()),
    user: v.optional(v.object({
      userId: v.string(),
      email: v.string(),
      tariff: v.string(),
      subscribeTill: v.string(),
      educationPassed: v.optional(v.boolean()),
      exp: v.number(),
    })),
  }),
  handler: async (ctx, { email, password }) => {
    console.log("ATTEMPT TO LOGIN", email, password);
    const user = await ctx.runQuery(api.functions.users.getByEmail, { email });
    if (!user) { console.log("USER NOT FOUND", email); return { message: "Invalid email or password" }; }
    const stored: string | undefined = (user as any).password;
    console.log("STORED PASSWORD", stored);
    const isBcrypt = typeof stored === "string" && stored.startsWith("$2");
    const ok = await verifyPassword(password, stored);
    if (!ok) { console.log("PASSWORD NOT VERIFIED", email); return { message: "Invalid email or password" }; }
    // Soft upgrade: migrate bcrypt hashes to PBKDF2 on successful login
    if (isBcrypt) {
      try {
        const newHash = hashPassword(password);
        await ctx.runMutation(api.functions.users.patchById, { id: (user as any)._id, patch: { password: newHash } as any });
      } catch (e) {
        // ignore upgrade errors; do not block login
      }
    }
    if ((user as any).isApproved === false) {
      return { message: "Ваша анкета еще не прошла проверку" };
    }
    const secret = process.env.JWT_SECRET_KEY || "";
    const exp = Math.floor(Date.now() / 1000) + 86400;
    const token = signJwtHS256({ userId: (user as any)._id, tariff: (user as any).tariff, subscribeTill: (user as any).subscribeTill, exp }, secret);
    return {
      message: "Login successful",
      status: 200,
      token,
      user: {
        userId: (user as any)._id,
        email: (user as any).email,
        tariff: (user as any).tariff,
        subscribeTill: (user as any).subscribeTill,
        educationPassed: (user as any).educationPassed || false,
        exp,
      },
    };
  },
});

export const forgotPassword = action({
  args: { email: v.string() },
  returns: v.object({ message: v.string(), error: v.optional(v.string()) }),
  handler: async (ctx, { email }) => {
    const user = await ctx.runQuery(api.functions.users.getByEmail, { email });
    if (!user) return { message: "Пользователь не найден" };
    const resetCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    const ok = await ctx.runMutation(api.functions.users.setResetCode, { email, resetCode, resetCodeExpires: new Date(Date.now() + 3600 * 1000).toISOString() });
    if (!ok) return { message: "Пользователь не найден" };
    
    // Отправка email через UniSender
    const uniSenderApiKey = process.env.UNISENDER_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL;
    
    if (!uniSenderApiKey || !senderEmail) {
      console.error("UNISENDER_API_KEY or SENDER_EMAIL not configured");
      return { message: "Ошибка конфигурации email сервиса", error: "Email service not configured" };
    }
    
    try {
      console.log("SENDING EMAIL TO", email);
      // Тело письма без кода (код хранится в БД и валидируется на reset)
      const urlParams = new URLSearchParams({
        format: 'json',
        api_key: uniSenderApiKey,
        email: email,
        sender_name: 'Доктор Сара',
        sender_email: senderEmail,
        subject: 'Сброс пароля',
        body: `Ваш код для сброса пароля: ${resetCode}`,
        list_id: '1'
      });
      
      const response = await fetch(`https://api.unisender.com/ru/api/sendEmail?${urlParams.toString()}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("UniSender API error:", errorText);
        return { message: "Ошибка при отправке email", error: `HTTP ${response.status}: ${errorText}` };
      }
      
      const result = await response.json();
      console.log("UniSender response:", result);
    } catch (e: any) {
      console.error("Error sending email:", e);
      return { message: "Ошибка при отправке email", error: e.message || "Unknown error" };
    }
    
    return { message: "Код сброса пароля отправлен на e-mail" };
  },
});

export const resetPassword = action({
  args: { email: v.string(), code: v.string(), newPassword: v.string() },
  returns: v.object({ message: v.string() }),
  handler: async (ctx, { email, code, newPassword }) => {
    const newPasswordHash = hashPassword(newPassword);
    const ok = await ctx.runMutation(api.functions.users.resetPassword, { email, code, newPasswordHash });
    if (!ok) return { message: "Неверный код или истекло время действия" };
    return { message: "Пароль успешно сброшен" };
  },
});


