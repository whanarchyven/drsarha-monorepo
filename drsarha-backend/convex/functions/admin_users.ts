import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { adminUserDoc, adminUserFields } from "../models/adminUser";

export const getById = query({
  args: { id: v.id("admin_users") },
  returns: v.union(adminUserDoc, v.null()),
  handler: async ({ db }, { id }) => {
    return db.get(id);
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  returns: v.union(adminUserDoc, v.null()),
  handler: async ({ db }, { email }) => {
    return await (db as any)
      .query("admin_users")
      .withIndex("by_email", (q: any) => q.eq("email", email))
      .first();
  },
});

export const create = mutation({
  args: v.object({
    name: v.string(),
    email: v.string(),
    password: v.string(), // Ожидается уже захешированный пароль
    role: v.union(v.literal("admin"), v.literal("moderator")),
    mongoId: v.optional(v.string()),
  }),
  returns: adminUserDoc,
  handler: async ({ db }, data) => {
    // Check if email already exists
    const existing = await (db as any)
      .query("admin_users")
      .withIndex("by_email", (q: any) => q.eq("email", data.email))
      .first();
    
    if (existing) {
      throw new Error("Admin user with this email already exists");
    }

    const now = new Date().toISOString();
    const id = await db.insert("admin_users", {
      ...data,
      createdAt: now,
      updatedAt: now,
    } as any);
    return (await db.get(id))!;
  },
});

export const update = mutation({
  args: {
    id: v.id("admin_users"),
    patch: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      password: v.optional(v.string()),
      role: v.optional(v.union(v.literal("admin"), v.literal("moderator"))),
    }),
  },
  returns: adminUserDoc,
  handler: async ({ db }, { id, patch }) => {
    const updateData: any = { ...patch, updatedAt: new Date().toISOString() };
    
    // If email is being updated, check uniqueness
    if (patch.email) {
      const existing = await (db as any)
        .query("admin_users")
        .withIndex("by_email", (q: any) => q.eq("email", patch.email))
        .first();
      
      if (existing && existing._id !== id) {
        throw new Error("Admin user with this email already exists");
      }
    }

    await db.patch(id, updateData as any);
    return (await db.get(id))!;
  },
});

export const remove = mutation({
  args: { id: v.id("admin_users") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return true;
  },
});

export const getAll = query({
  args: {},
  returns: v.array(adminUserDoc),
  handler: async ({ db }) => {
    return await (db as any).query("admin_users").collect();
  },
});

export const countAdmins = query({
  args: {},
  returns: v.number(),
  handler: async ({ db }) => {
    const all = await (db as any).query("admin_users").collect();
    return all.filter((u: any) => u.role === "admin").length;
  },
});


