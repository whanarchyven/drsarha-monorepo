import { defineTable } from "convex/server";
import { v } from "convex/values";

export const promoUsersCodeMaterialFields = {
  code: v.string(),
  material_url: v.string(),
};

export const promoUsersCodeMaterialsTable = defineTable(promoUsersCodeMaterialFields).index(
  "by_code",
  ["code"]
);

export const promoUsersCodeMaterialDoc = v.object({
  _id: v.id("promo_users_code_materials"),
  _creationTime: v.number(),
  ...promoUsersCodeMaterialFields,
});
