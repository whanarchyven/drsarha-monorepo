import { query, mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { userDoc, userFields, userPaymentEntry } from "../models/user";

export const getById = query({
  args: { id: v.id("users") },
  returns: v.union(userDoc, v.null()),
  handler: async ({ db }, { id }) => db.get(id),
});

export const getByMongoId = query({
  args: { mongoId: v.string() },
  returns: v.union(userDoc, v.null()),
  handler: async ({ db }, { mongoId }) => {
    const hit = await (db as any)
      .query("users")
      .withIndex("by_mongo_id", (q: any) => q.eq("mongoId", mongoId))
      .first();
    return hit ?? null;
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  returns: v.union(userDoc, v.null()),
  handler: async ({ db }, { email }) => {
    const hit = await (db as any)
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", email))
      .first();
    return hit ?? null;
  },
});

export const create = mutation({
  args: v.object(userFields),
  returns: userDoc,
  handler: async ({ db }, args) => {
    const id = await db.insert("users", args as any);
    return (await db.get(id))!;
  },
});

export const setResetCode = mutation({
  args: { email: v.string(), resetCode: v.string(), resetCodeExpires: v.string() },
  returns: v.boolean(),
  handler: async ({ db }, { email, resetCode, resetCodeExpires }) => {
    const user = await (db as any).query("users").withIndex("by_email", (q: any) => q.eq("email", email)).first();
    console.log("SET RESET CODE", resetCode,"FOR EMAIL", email);
    if (!user) return false;
    console.log("USER", user);
    await db.patch(user._id, { resetCode, resetCodeExpires } as any);
    return true;
  },
});

export const resetPassword = mutation({
  args: { email: v.string(), code: v.string(), newPasswordHash: v.string() },
  returns: v.boolean(),
  handler: async ({ db }, { email, code, newPasswordHash }) => {
    const user = await (db as any).query("users").withIndex("by_email", (q: any) => q.eq("email", email)).first();
    if (!user) return false;
    const now = Date.now();
    if (!(user as any).resetCode || (user as any).resetCode !== code) return false;
    if ((user as any).resetCodeExpires && new Date((user as any).resetCodeExpires).getTime() < now) return false;
    await db.patch(user._id, { password: newPasswordHash, resetCode: undefined as any, resetCodeExpires: undefined as any } as any);
    return true;
  },
});

export const update = mutation({
  args: { id: v.id("users"), patch: v.object(Object.fromEntries(Object.entries(userFields).map(([k, val]) => [k, (val as any).optional ? (val as any) : v.optional(val as any)]))) },
  returns: userDoc,
  handler: async ({ db }, { id, patch }) => {
    await db.patch(id, patch as any);
    return (await db.get(id))!;
  },
});

export const inc = mutation({
  args: { id: v.id("users"), stars: v.optional(v.number()), exp: v.optional(v.number()) },
  returns: v.union(userDoc, v.null()),
  handler: async ({ db }, { id, stars, exp }) => {
    const user = await db.get(id);
    if (!user) return null;
    const patch: any = {};
    if (typeof stars === 'number') patch.stars = ((user as any).stars || 0) + stars;
    if (typeof exp === 'number') patch.exp = ((user as any).exp || 0) + exp;
    await db.patch(id, patch);
    return (await db.get(id))!;
  },
});

// Internal version for use in internal mutations
export const incInternal = internalMutation({
  args: { id: v.id("users"), stars: v.optional(v.number()), exp: v.optional(v.number()) },
  returns: v.union(userDoc, v.null()),
  handler: async ({ db }, { id, stars, exp }) => {
    const user = await db.get(id);
    if (!user) return null;
    const patch: any = {};
    if (typeof stars === 'number') patch.stars = ((user as any).stars || 0) + stars;
    if (typeof exp === 'number') patch.exp = ((user as any).exp || 0) + exp;
    await db.patch(id, patch);
    return (await db.get(id))!;
  },
});

export const pushPrize = mutation({
  args: { id: v.id("users"), prizeId: v.string(), obtainedAt: v.string() },
  returns: v.union(userDoc, v.null()),
  handler: async ({ db }, { id, prizeId, obtainedAt }) => {
    const user = await db.get(id);
    if (!user) return null;
    const current = (user as any);
    const nextPrizes = ([current.prizes] as any[]).flat().filter(Boolean);
    nextPrizes.push({ prizeId, obtainedAt });
    await db.patch(id, { prizes: nextPrizes } as any);
    return (await db.get(id))!;
  },
});

export const pushPayment = mutation({
  args: { id: v.id("users"), payment: userPaymentEntry },
  returns: userDoc,
  handler: async ({ db }, { id, payment }) => {
    const user = await db.get(id);
    const current = (user as any);
    const next = ([current.payments] as any[]).flat().filter(Boolean);
    next.push(payment);
    await db.patch(id, { payments: next } as any);
    return (await db.get(id))!;
  },
});

export const listUsers = query({
  args: { page: v.optional(v.number()), limit: v.optional(v.number()), search: v.optional(v.string()), tariff: v.optional(v.string()), isApprovedOnly: v.optional(v.boolean()) },
  returns: v.object({ items: v.array(userDoc), total: v.number(), page: v.number(), totalPages: v.number(), hasMore: v.boolean() }),
  handler: async ({ db }, { page = 1, limit = 10, search, tariff, isApprovedOnly = true }) => {
    let all = await (db as any).query("users").collect();
    if (isApprovedOnly) all = all.filter((u: any) => u.isApproved === true);
    if (tariff) all = all.filter((u: any) => (u.tariff || "").toLowerCase() === tariff.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      all = all.filter((u: any) => (u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)));
    }
    const total = all.length;
    const from = (page - 1) * limit;
    const items = all.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    return { items, total, page, totalPages, hasMore: page < totalPages } as any;
  },
});

export const approveUser = mutation({
  args: { id: v.id("users") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    console.log("APPROVING USER", id);
    await db.patch(id, { isApproved: true } as any);
    return true;
  },
});

export const approveAll = mutation({
  args: {},
  returns: v.number(),
  handler: async ({ db }) => {
    const candidates = await (db as any).query("users").withIndex("by_isApproved", (q: any) => q.eq("isApproved", false)).collect();
    let n = 0;
    for (const u of candidates) { await db.patch(u._id, { isApproved: true } as any); n++; }
    return n;
  },
});

export const patchById = mutation({
  args: { id: v.id("users"), patch: v.object(Object.fromEntries(Object.entries(userFields).map(([k, val]) => [k, (val as any).optional ? (val as any) : v.optional(val as any)]))) },
  returns: userDoc,
  handler: async ({ db }, { id, patch }) => { await db.patch(id, patch as any); return (await db.get(id))!; },
});

export const listByIsApproved = query({
  args: { isApproved: v.boolean() },
  returns: v.array(userDoc),
  handler: async ({ db }, { isApproved }) => {
    const rows = await (db as any)
      .query("users")
      .withIndex("by_isApproved", (q: any) => q.eq("isApproved", isApproved))
      .collect();
    return rows as any;
  },
});

export const remove = mutation({
  args: { id: v.id("users") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return true;
  },
});

export const appendViewed = mutation({
  args: { id: v.id("users"), item: v.object({ articleUrl: v.string(), title_translation_human: v.string(), publishedDate: v.string(), category: v.optional(v.string()) }) },
  returns: userDoc,
  handler: async ({ db }, { id, item }) => {
    const u = await db.get(id);
    const current = (u as any)?.viewed ?? [];
    await db.patch(id, { viewed: [...current, item] } as any);
    return (await db.get(id))!;
  },
});

export const appendSaved = mutation({
  args: { id: v.id("users"), item: v.object({ articleUrl: v.string(), title_translation_human: v.string(), publishedDate: v.string(), category: v.optional(v.string()) }) },
  returns: userDoc,
  handler: async ({ db }, { id, item }) => {
    const u = await db.get(id);
    const current = (u as any)?.saved ?? [];
    await db.patch(id, { saved: [...current, item] } as any);
    return (await db.get(id))!;
  },
});

export const removeSavedByArticleUrl = mutation({
  args: { id: v.id("users"), articleUrl: v.string() },
  returns: userDoc,
  handler: async ({ db }, { id, articleUrl }) => {
    const u = await db.get(id);
    const next = ((u as any)?.saved ?? []).filter((it: any) => it.articleUrl !== articleUrl);
    await db.patch(id, { saved: next } as any);
    return (await db.get(id))!;
  },
});

export const setTrackingPermission=mutation({
  args: { id: v.id("users"), trackingPermission: v.boolean() },
  returns: userDoc,
  handler: async ({ db }, { id, trackingPermission }) => {
    await db.patch(id, { trackingPermission } as any);
    return (await db.get(id))!;
  },
});


