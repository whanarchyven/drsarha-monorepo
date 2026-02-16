import { defineTable } from "convex/server";
import { v } from "convex/values";

export const collaborationRequestFields = {
  folderId: v.union(v.id("folders"), v.string()),
  inviterId: v.union(v.id("users"), v.string()),
  inviteeId: v.union(v.id("users"), v.string()),
  status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined"), v.literal("expired")),
  message: v.optional(v.string()),
  createdAt: v.optional(v.string()),
  updatedAt: v.string(),
  expiresAt: v.string(),
  mongoId: v.optional(v.string()),
};

export const collaborationRequestDoc = v.object({
  ...collaborationRequestFields,
  _id: v.id("collaboration_requests"),
  _creationTime: v.number(),
});

export const collaborationRequestsTable = defineTable(collaborationRequestFields)
  .index("by_folder_invitee", ["folderId", "inviteeId"])
  .index("by_invitee_status", ["inviteeId", "status"])
  .index("by_inviter", ["inviterId"])
  .index("by_folder", ["folderId"]);

