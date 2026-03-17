import { defineTable } from "convex/server";
import { v } from "convex/values";

export const conferenceBroadcastFields = {
  key: v.string(),
  iframeUrl: v.string(),
  isDisplayed: v.boolean(),
  title: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
};

export const conferenceBroadcastTable = defineTable(conferenceBroadcastFields).index(
  "by_key",
  ["key"]
);

export const conferenceBroadcastDoc = v.object({
  _id: v.id("conference_broadcast"),
  _creationTime: v.number(),
  ...conferenceBroadcastFields,
});
