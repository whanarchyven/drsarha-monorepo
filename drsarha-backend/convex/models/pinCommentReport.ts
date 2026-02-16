import { defineTable } from "convex/server";
import { v } from "convex/values";

export const pinCommentReportFields = {
  commentId: v.union(v.id("pin_comments"), v.string()),
  pinId: v.union(v.id("pins"), v.string()),
  commentAuthor: v.union(v.id("users"), v.string()),
  type: v.union(v.id("pin_report_type"), v.string()),
  reporter: v.union(v.id("users"), v.string()),
  comment: v.string(),
  status: v.union(v.literal("new"), v.literal("approved"), v.literal("rejected")),
  admin_comment: v.optional(v.string()),
  fine: v.number(),
  reward: v.number(),
  createdAt: v.optional(v.string()),
  updatedAt: v.string(),
  mongoId: v.optional(v.string()),
};

export const pinCommentReportsTable = defineTable(pinCommentReportFields)
  .index("by_status", ["status", "createdAt"])
  .index("by_type", ["type", "createdAt"])
  .index("by_comment", ["commentId", "createdAt"])
  .index("by_pin", ["pinId", "createdAt"])
  .index("by_reporter", ["reporter", "createdAt"])
  .index("by_author", ["commentAuthor", "createdAt"]);

export const pinCommentReportDoc = v.object({
  _id: v.id("pin_comment_reports"),
  _creationTime: v.number(),
  ...pinCommentReportFields,
});

