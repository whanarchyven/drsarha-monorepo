import { defineTable } from "convex/server";
import { v } from "convex/values";

export const conferenceGeneratedAudioFields = {
  key: v.string(),
  text: v.string(),
  fileName: v.string(),
  mimeType: v.string(),
  audioUrl: v.string(),
  provider: v.string(),
  modelId: v.optional(v.string()),
  voiceId: v.optional(v.string()),
  byteLength: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
};

export const conferenceGeneratedAudioTable = defineTable(
  conferenceGeneratedAudioFields
).index("by_key", ["key"]);

export const conferenceGeneratedAudioDoc = v.object({
  _id: v.id("conference_generated_audio"),
  _creationTime: v.number(),
  ...conferenceGeneratedAudioFields,
});
