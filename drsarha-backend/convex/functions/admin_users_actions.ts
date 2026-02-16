"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { adminUserDoc } from "../models/adminUser";
import { api } from "../_generated/api";
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

export const login = action({
  args: { email: v.string(), password: v.string() },
  returns: v.object({
    message: v.string(),
    status: v.optional(v.number()),
    token: v.optional(v.string()),
    adminUser: v.optional(v.object({
      adminId: v.string(),
      email: v.string(),
      name: v.string(),
      role: v.string(),
      exp: v.number(),
    })),
  }),
  handler: async (ctx, { email, password }) => {
    const user = await ctx.runQuery(api.functions.admin_users.getByEmail, { email });
    console.log("USER", user);
    if (!user) {
      console.log("USER NOT FOUND", email);
      return { message: "Неправильный email или пароль", status: 401 };
    }
    
    const stored: string | undefined = (user as any).password;
    const ok = await verifyPassword(password, stored);
    if (!ok) {
      console.log("PASSWORD NOT VERIFIED", email,password,stored);
      return { message: "Неправильный email или пароль", status: 401 };
    }
    
    const secret = process.env.JWT_SECRET_KEY || "";
    const exp = Math.floor(Date.now() / 1000) + 86400; // 1 день
    const token = signJwtHS256({ 
      adminId: (user as any)._id, 
      role: (user as any).role, 
      exp 
    }, secret);
    
    return {
      message: "Успешная авторизация",
      status: 200,
      token,
      adminUser: {
        adminId: (user as any)._id,
        email: (user as any).email,
        name: (user as any).name,
        role: (user as any).role,
        exp,
      },
    };
  },
});

export const authenticate = action({
  args: { email: v.string(), password: v.string() },
  returns: v.union(adminUserDoc, v.null()),
  handler: async (ctx, { email, password }) => {
    const user = await ctx.runQuery(api.functions.admin_users.getByEmail, { email });
    if (!user) return null;
    
    // Verify password using the same logic as auth.ts
    const isValid = await verifyPassword(password, (user as any).password);
    return isValid ? user : null;
  },
});

export const hashPasswordAction = action({
  args: { password: v.string() },
  returns: v.string(),
  handler: async (ctx, { password }) => {
    return hashPassword(password);
  },
});

