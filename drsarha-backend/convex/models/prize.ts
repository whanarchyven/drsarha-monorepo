import { defineTable } from "convex/server";
import { v } from "convex/values";

export const prizeFields = {
  name: v.string(),
  image: v.string(),
  description: v.string(),
  level: v.number(),
  price: v.number(),
  mongoId: v.optional(v.string()),
};

export const prizesTable = defineTable(prizeFields)
  .index("by_level", ["level"]) 
  .index("by_mongo_id", ["mongoId"]);

export const prizeDoc = v.object({
  ...prizeFields,
  _id: v.id("prizes"),
  _creationTime: v.number(),
});


