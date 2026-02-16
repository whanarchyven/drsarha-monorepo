import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { pinReportDoc, pinReportFields } from "../models/pinReport";
import { pinReportTypeDoc, pinReportTypeFields } from "../models/pinReportType";

// Types CRUD
export const createType = mutation({ args: { name: v.string() }, returns: pinReportTypeDoc, handler: async ({ db }, { name }) => { const now = new Date().toISOString(); const id = await db.insert("pin_report_type", { name, createdAt: now, updatedAt: now } as any); return (await db.get(id))!; } });

export const getTypes = query({ args: { page: v.optional(v.number()), limit: v.optional(v.number()) }, returns: v.object({ items: v.array(pinReportTypeDoc), total: v.number(), page: v.number(), totalPages: v.number(), hasMore: v.boolean() }), handler: async ({ db }, { page = 1, limit = 50 }) => { const all = await (db as any).query("pin_report_type").collect(); const total = all.length; const from = (page - 1) * limit; const items = all.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)).slice(from, from + limit); const totalPages = Math.ceil(total / limit) || 1; return { items, total, page, totalPages, hasMore: page < totalPages }; } });

export const updateType = mutation({ args: { id: v.id("pin_report_type"), name: v.string() }, returns: pinReportTypeDoc, handler: async ({ db }, { id, name }) => { await db.patch(id, { name, updatedAt: new Date().toISOString() } as any); return (await db.get(id))!; } });

export const removeType = mutation({ args: { id: v.id("pin_report_type") }, returns: v.boolean(), handler: async ({ db }, { id }) => { await db.delete(id); return true; } });

// Reports
export const createReport = mutation({
  args: { pinId: v.string(), typeId: v.string(), reporterId: v.string(), comment: v.string(), pinAuthorId: v.string() },
  returns: pinReportDoc,
  handler: async ({ db }, { pinId, typeId, reporterId, comment, pinAuthorId }) => {
    const now = new Date().toISOString();
    const id = await db.insert("pin_reports", { pinId, type: typeId, reporter: reporterId, pinAuthor: pinAuthorId, comment, status: "new", fine: 0, reward: 0, createdAt: now, updatedAt: now } as any);
    return (await db.get(id))!;
  },
});

export const listReports = query({
  args: { page: v.optional(v.number()), limit: v.optional(v.number()), status: v.optional(v.union(v.literal("new"), v.literal("approved"), v.literal("rejected"))), typeId: v.optional(v.string()), pinId: v.optional(v.string()), reporterId: v.optional(v.string()), pinAuthorId: v.optional(v.string()) },
  returns: v.object({ items: v.array(pinReportDoc), total: v.number(), page: v.number(), totalPages: v.number(), hasMore: v.boolean() }),
  handler: async ({ db }, args) => {
    let all = await (db as any).query("pin_reports").collect();
    if (args.status) all = all.filter((r: any) => r.status === args.status);
    if (args.typeId) all = all.filter((r: any) => r.type === args.typeId);
    if (args.pinId) all = all.filter((r: any) => r.pinId === args.pinId);
    if (args.reporterId) all = all.filter((r: any) => r.reporter === args.reporterId);
    if (args.pinAuthorId) all = all.filter((r: any) => r.pinAuthor === args.pinAuthorId);
    all.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
    const page = args.page ?? 1; const limit = args.limit ?? 20; const total = all.length; const from = (page - 1) * limit; const items = all.slice(from, from + limit); const totalPages = Math.ceil(total / limit) || 1; return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const getById = query({ args: { id: v.id("pin_reports") }, returns: v.union(pinReportDoc, v.null()), handler: async ({ db }, { id }) => db.get(id) });

export const setStatus = mutation({ args: { id: v.id("pin_reports"), status: v.union(v.literal("approved"), v.literal("rejected")), admin_comment: v.string(), fine: v.number(), reward: v.number() }, returns: pinReportDoc, handler: async ({ db }, { id, status, admin_comment, fine, reward }) => { await db.patch(id, { status, admin_comment, fine, reward, updatedAt: new Date().toISOString() } as any); return (await db.get(id))!; } });


