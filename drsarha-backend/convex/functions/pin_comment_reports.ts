import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { pinCommentReportDoc } from "../models/pinCommentReport";

export const createReport = mutation({
  args: {
    commentId: v.string(),
    pinId: v.string(),
    typeId: v.string(),
    reporterId: v.string(),
    comment: v.string(),
    commentAuthorId: v.string(),
  },
  returns: pinCommentReportDoc,
  handler: async ({ db }, { commentId, pinId, typeId, reporterId, comment, commentAuthorId }) => {
    const now = new Date().toISOString();
    const id = await db.insert(
      "pin_comment_reports",
      {
        commentId,
        pinId,
        type: typeId,
        reporter: reporterId,
        commentAuthor: commentAuthorId,
        comment,
        status: "new",
        fine: 0,
        reward: 0,
        createdAt: now,
        updatedAt: now,
      } as any,
    );
    return (await db.get(id))!;
  },
});

export const listReports = query({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    status: v.optional(v.union(v.literal("new"), v.literal("approved"), v.literal("rejected"))),
    typeId: v.optional(v.string()),
    pinId: v.optional(v.string()),
    commentId: v.optional(v.string()),
    reporterId: v.optional(v.string()),
    commentAuthorId: v.optional(v.string()),
  },
  returns: v.object({
    items: v.array(pinCommentReportDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, args) => {
    let all = await (db as any).query("pin_comment_reports").collect();
    if (args.status) all = all.filter((r: any) => r.status === args.status);
    if (args.typeId) all = all.filter((r: any) => r.type === args.typeId);
    if (args.pinId) all = all.filter((r: any) => r.pinId === args.pinId);
    if (args.commentId) all = all.filter((r: any) => r.commentId === args.commentId);
    if (args.reporterId) all = all.filter((r: any) => r.reporter === args.reporterId);
    if (args.commentAuthorId) all = all.filter((r: any) => r.commentAuthor === args.commentAuthorId);
    all.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
    const page = args.page ?? 1;
    const limit = args.limit ?? 20;
    const total = all.length;
    const from = (page - 1) * limit;
    const items = all.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const getById = query({
  args: { id: v.id("pin_comment_reports") },
  returns: v.union(pinCommentReportDoc, v.null()),
  handler: async ({ db }, { id }) => db.get(id),
});

export const setStatus = mutation({
  args: {
    id: v.id("pin_comment_reports"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    admin_comment: v.string(),
    fine: v.number(),
    reward: v.number(),
  },
  returns: pinCommentReportDoc,
  handler: async ({ db }, { id, status, admin_comment, fine, reward }) => {
    await db.patch(
      id,
      { status, admin_comment, fine, reward, updatedAt: new Date().toISOString() } as any,
    );
    return (await db.get(id))!;
  },
});

