import { defineTable } from "convex/server";
import { v } from "convex/values";

export const adminUserFields = {
  name: v.string(),
  email: v.string(),
  password: v.string(),
  role: v.union(v.literal("admin"), v.literal("moderator")),
  createdAt: v.optional(v.string()),
  updatedAt: v.string(),
  mongoId: v.optional(v.string()),
};

export const adminUserDoc = v.object({
  ...adminUserFields,
  _id: v.id("admin_users"),
  _creationTime: v.number(),
});

export const adminUsersTable = defineTable(adminUserFields)
  .index("by_email", ["email"]);


