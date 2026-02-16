import { defineTable } from "convex/server";
import { v } from "convex/values";

export const nozologyFields = {
  name: v.string(),
  cover_image: v.optional(v.union(v.string(), v.null())),
  description: v.optional(v.union(v.string(), v.null())),
  category_id: v.union(v.id("categories"), v.string()),
  mongoId: v.optional(v.string()),
};

export const nozologiesTable = defineTable(nozologyFields)
  .index("by_mongo_id", ["mongoId"])
  .index("by_category", ["category_id"]);

export const nozologyDoc = v.object({
  ...nozologyFields,
  _id: v.id("nozologies"),
  _creationTime: v.number(),
});


