import { defineTable } from "convex/server";
import { v } from "convex/values";

export const categoryFields = {
  name: v.string(),
  cover_image: v.string(),
  description: v.string(),
  mongoId: v.optional(v.string()),
};

export const categoriesTable = defineTable(categoryFields)
  .index("by_mongo_id", ["mongoId"]);

export const categoryDoc = v.object({
  ...categoryFields,
  _id: v.id("categories"),
  _creationTime: v.number(),
});


