import { defineTable } from "convex/server";
import { v } from "convex/values";

export const lootboxItemFields = v.object({
  type: v.union(v.literal("stars"), v.literal("exp"), v.literal("prize"), v.literal("lootbox")),
  amount: v.number(),
  chance: v.number(),
  objectId: v.union(v.null(), v.string()),
});

export const lootboxFields = {
  title: v.string(),
  description: v.string(),
  image: v.string(),
  // Итоговый формат: массив элементов
  items: v.array(lootboxItemFields),
  mongoId: v.optional(v.string()),
};

export const lootboxesTable = defineTable(lootboxFields)
  .index("by_mongo_id", ["mongoId"]);

export const lootboxDoc = v.object({
  ...lootboxFields,
  _id: v.id("lootboxes"),
  _creationTime: v.number(),
});


