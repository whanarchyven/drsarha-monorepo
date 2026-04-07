import { defineTable } from "convex/server";
import { v } from "convex/values";

export const companyGroupFields = {
  name: v.string(),
  slug: v.string(),
  logo: v.string(),
  password: v.string(),
  created_at: v.string(),
  updated_at: v.string(),
};

export const companyGroupsTable = defineTable(companyGroupFields).index(
  "by_slug",
  ["slug"],
);

export const companyGroupDoc = v.object({
  ...companyGroupFields,
  _id: v.id("company_groups"),
  _creationTime: v.number(),
});
