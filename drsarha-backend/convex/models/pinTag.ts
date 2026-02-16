import { defineTable } from "convex/server";
import { v } from "convex/values";

export const pinTagFields = {
  name: v.string(),
  createdAt: v.optional(v.string()),
  updatedAt: v.string(),
  mongoId: v.optional(v.string()),
};

export const pinTagsTable = defineTable(pinTagFields)
  .index("by_mongo_id", ["mongoId"])
  .index("by_name", ["name"]);

export const pinTagDoc = v.object({
  ...pinTagFields,
  _id: v.id("pin_tags"),
  _creationTime: v.number(),
});


