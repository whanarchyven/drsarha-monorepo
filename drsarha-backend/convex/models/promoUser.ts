import { defineTable } from "convex/server";
import { v } from "convex/values";

export const promoUserFields = {
  email: v.string(),
  phone: v.string(),
  username: v.optional(v.string()),
  name: v.string(),
  code: v.string(),
  utm: v.optional(v.array(v.string())),
};

export const promoUsersTable = defineTable(promoUserFields)
  .index("by_email", ["email"])
  .index("by_phone", ["phone"])
  .index("by_username", ["username"])
  .index("by_code", ["code"]);

export const promoUserDoc = v.object({
  _id: v.id("promo_users"),
  _creationTime: v.number(),
  ...promoUserFields,
});
