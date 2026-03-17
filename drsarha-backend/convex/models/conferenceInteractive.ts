import { defineTable } from "convex/server";
import { v } from "convex/values";

export const conferenceInteractiveKind = v.union(
  v.literal("quiz"),
  v.literal("poll")
);

export const conferenceInteractiveVariant = v.object({
  id: v.string(),
  text: v.string(),
  isCorrect: v.optional(v.boolean()),
});

export const conferenceInteractiveQuestion = v.object({
  id: v.string(),
  image: v.optional(v.string()),
  questionText: v.string(),
  variants: v.array(conferenceInteractiveVariant),
});

export const conferenceInteractiveFields = {
  title: v.string(),
  kind: conferenceInteractiveKind,
  showResults: v.boolean(),
  isDisplayed: v.boolean(),
  questions: v.array(conferenceInteractiveQuestion),
  createdAt: v.number(),
  updatedAt: v.number(),
};

export const conferenceInteractivesTable = defineTable(conferenceInteractiveFields)
  .index("by_kind", ["kind"])
  .index("by_isDisplayed", ["isDisplayed"])
  .index("by_createdAt", ["createdAt"]);

export const conferenceInteractiveDoc = v.object({
  _id: v.id("conference_interactives"),
  _creationTime: v.number(),
  ...conferenceInteractiveFields,
});

export const conferenceInteractiveResponseFields = {
  interactiveId: v.id("conference_interactives"),
  questionId: v.string(),
  conferenceUserId: v.id("conference_users"),
  selectedVariantIds: v.array(v.string()),
  isCorrect: v.optional(v.boolean()),
  answeredAt: v.number(),
  updatedAt: v.optional(v.number()),
};

export const conferenceInteractiveResponsesTable = defineTable(
  conferenceInteractiveResponseFields
)
  .index("by_interactive_question_user", [
    "interactiveId",
    "questionId",
    "conferenceUserId",
  ])
  .index("by_interactive_user", ["interactiveId", "conferenceUserId"])
  .index("by_interactive_question", ["interactiveId", "questionId"]);

export const conferenceInteractiveResponseDoc = v.object({
  _id: v.id("conference_interactive_responses"),
  _creationTime: v.number(),
  ...conferenceInteractiveResponseFields,
});
