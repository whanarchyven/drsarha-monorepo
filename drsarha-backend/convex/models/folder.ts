import { defineTable } from "convex/server";
import { v } from "convex/values";

export const folderFields = {
  name: v.string(),
  description: v.string(),
  ownerId: v.union(v.id("users"), v.string()),
  postsCount: v.float64(),
  collaboratorsCount: v.float64(),
  isPrivate: v.union(v.boolean(), v.string()),
  createdAt: v.optional(v.string()),
  updatedAt: v.string(),
  mongoId: v.optional(v.string()),
};

export const folderDoc = v.object({
  ...folderFields,
  _id: v.id("folders"),
  _creationTime: v.number(),
});

export const foldersTable = defineTable(folderFields)
  .index("by_owner", ["ownerId"]);

export const folderCollaboratorFields = {
  folderId: v.union(v.id("folders"), v.string()),
  userId: v.union(v.id("users"), v.string()),
  role: v.union(v.literal("owner"), v.literal("collaborator"), v.string()), // Добавлен string для миграции
  invitedBy: v.optional(v.union(v.id("users"), v.string())),
  joinedAt: v.string(),
  status: v.union(v.literal("active"), v.literal("invited"), v.string()), // Добавлен string для миграции
  mongoId: v.optional(v.string()),
};

export const folderCollaboratorDoc = v.object({
  ...folderCollaboratorFields,
  _id: v.id("folder_collaborators"),
  _creationTime: v.number(),
});

export const folderCollaboratorsTable = defineTable(folderCollaboratorFields)
  .index("by_folder_user", ["folderId", "userId"])
  .index("by_user_status", ["userId", "status"]);

export const savedPinFields = {
  userId: v.union(v.id("users"), v.string()),
  pinId: v.union(v.id("pins"), v.string()),
  folderId: v.union(v.id("folders"), v.string()),
  savedAt: v.string(),
  mongoId: v.optional(v.string()),
};

export const savedPinDoc = v.object({
  ...savedPinFields,
  _id: v.id("saved_pins"),
  _creationTime: v.number(),
});

export const savedPinsTable = defineTable(savedPinFields)
  .index("by_folder_saved", ["folderId", "savedAt"])
  .index("by_user_pin_folder", ["userId", "pinId", "folderId"])
  .index("by_folder_pin", ["pinId"]);

