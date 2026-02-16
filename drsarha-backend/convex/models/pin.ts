import { defineTable } from "convex/server";
import { v } from "convex/values";

export const pinFields = {
  title: v.string(),
  description: v.string(),
  image: v.string(),
  author: v.union(v.id("users"), v.string()),
  tags: v.optional(v.array(v.union(v.id("pin_tags"), v.string()))),
  likes: v.number(),
  comments: v.number(),
  createdAt: v.optional(v.string()),
  updatedAt: v.string(),
  mongoId: v.optional(v.string()),
};

export const pinsTable = defineTable(pinFields)
  .index("by_author_created", ["author", "createdAt"])

export const pinDoc = v.object({
  _id: v.id("pins"),
  _creationTime: v.number(),
  ...pinFields,
});

export const pinLikeFields = {
  pinId: v.union(v.id("pins"), v.string()),
  userId: v.union(v.id("users"), v.string()),
  createdAt: v.optional(v.string()),
  mongoId: v.optional(v.string()),
};

export const pinLikesTable = defineTable(pinLikeFields)
  .index("by_pin_user", ["pinId", "userId"]) 
  .index("by_user_pin", ["userId", "pinId"]);

export const pinLikeDoc = v.object({
  _id: v.id("pin_likes"),
  _creationTime: v.number(),
  ...pinLikeFields,
});

export const pinCommentFields = {
  pinId: v.optional(v.union(v.id("pins"), v.string())), // Сделано optional для миграции
  userId: v.union(v.id("users"), v.string()),
  content: v.string(),
  likes: v.array(v.any()), // Изменено на any для совместимости с миграцией
  parentId: v.optional(v.union(v.id("pin_comments"), v.string())),
  createdAt: v.optional(v.string()),
  updatedAt: v.string(),
  mongoId: v.optional(v.string()),
  clinicAtlasId: v.optional(v.union(v.null(), v.string())), // Изменено для совместимости
  responseToUser: v.optional(v.object({
    id: v.union(v.id("users"), v.string()),
    fullName: v.optional(v.string()), // Сделано optional для совместимости с миграцией
  })),
  userFullName: v.optional(v.string()),
};

export const pinCommentsTable = defineTable(pinCommentFields)
  .index("by_pin_created", ["pinId", "createdAt"])
  .index("by_clinic_atlas", ["clinicAtlasId"])
  .index("by_user", ["userId"])
  .index("by_parent", ["parentId"]);

export const pinCommentDoc = v.object({
  _id: v.id("pin_comments"),
  _creationTime: v.number(),
  ...pinCommentFields,
});

export const userSavedPinFields = {
  userId: v.union(v.id("users"), v.string()),
  pinId: v.union(v.id("pins"), v.string()),
  savedAt: v.string(),
  mongoId: v.optional(v.string()),
};

export const userSavedPinsTable = defineTable(userSavedPinFields)
  .index("by_user_saved", ["userId", "savedAt"]) 
  .index("by_user_pin", ["userId", "pinId"]);

export const userSavedPinDoc = v.object({
  _id: v.id("user_saved_pins"),
  _creationTime: v.number(),
  ...userSavedPinFields,
});


