import { defineTable } from "convex/server";
import { v } from "convex/values";

export const lectionFields = {
  name: v.string(),
  cover_image: v.string(),
  description: v.string(),
  duration: v.string(),
  video: v.string(),
  stars: v.number(),
  feedback: v.array(
    v.object({
      analytic_questions: v.array(v.string()),
      answers: v.array(
        v.object({
          answer: v.string(),
          is_correct: v.boolean(),
        })
      ),
      has_correct: v.boolean(),
      question: v.string(),
    })
  ),
  nozology: v.union(v.id("nozologies"), v.string()),
  mongoId: v.optional(v.string()),
  idx: v.optional(v.number()),
  publishAfter: v.optional(v.number()),
  app_visible: v.optional(v.boolean()),
  references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
};

export const lectionsTable = defineTable(lectionFields)
  .index("by_nozology", ["nozology"]) 
  .index("by_mongo_id", ["mongoId"]);

export const lectionDoc = v.object({
  ...lectionFields,
  _id: v.id("lections"),
  _creationTime: v.number(),
});


