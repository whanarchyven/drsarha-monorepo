import { defineTable } from "convex/server";
import { v } from "convex/values";

export const conferenceAiTextFields = {
  key: v.string(),
  markdown: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
};

export const conferenceAiTextTable = defineTable(conferenceAiTextFields).index("by_key", [
  "key",
]);

export const conferenceAiTextDoc = v.object({
  _id: v.id("conference_ai_text"),
  _creationTime: v.number(),
  ...conferenceAiTextFields,
});
