import { defineTable } from "convex/server";
import { v } from "convex/values";

export const conferencePromocodeFields = {
  code: v.string(),
  amount: v.optional(v.number()),
  isActive: v.boolean(),
  max_usage_count: v.optional(v.union(v.number(), v.null())),
  usage_count: v.number(),
  payed_count: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
};

export const conferencePromocodesTable = defineTable(conferencePromocodeFields).index(
  "by_code",
  ["code"]
);

export const conferencePromocodeDoc = v.object({
  _id: v.id("conference_promocodes"),
  _creationTime: v.number(),
  ...conferencePromocodeFields,
});
