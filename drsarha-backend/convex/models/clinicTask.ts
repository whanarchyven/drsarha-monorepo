import { defineTable } from "convex/server";
import { v } from "convex/values";

/** Общая форма вопроса для clinic_tasks и markup_tasks. */
export const clinicTaskQuestionValidator = v.object({
  id: v.optional(v.string()), // Сделано optional для миграции
  type: v.string(),
  question: v.string(),
  additional_info: v.string(),
  answer: v.string(),
  answers: v.array(
    v.object({
      answer: v.string(),
      isCorrect: v.boolean(),
    })
  ),
  correct_answer_comment: v.string(),
});

export const clinicTaskFields = {
  name: v.string(),
  difficulty: v.number(),
  cover_image: v.string(),
  images: v.array(v.object({ image: v.string(), is_open: v.boolean() })),
  description: v.string(),
  questions: v.array(clinicTaskQuestionValidator),
  additional_info: v.string(),
  ai_scenario: v.string(),
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
  interviewMode: v.optional(v.boolean()),
  interviewQuestions: v.optional(v.array(v.string())),
  interviewAnalyticQuestions: v.optional(v.array(v.string())),
  mongoId: v.optional(v.string()),
  idx: v.optional(v.number()),
  publishAfter: v.optional(v.number()),
  endoscopy_model: v.optional(v.union(v.string(), v.null())),
  endoscopy_video: v.optional(v.union(v.string(), v.null())),
  timecodes: v.optional(
    v.array(
      v.object({
        time: v.number(),
        title: v.string(),
        description: v.optional(v.string()),
      })
    )
  ),
  app_visible: v.optional(v.boolean()),
  references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
};

export const clinicTasksTable = defineTable(clinicTaskFields)
  .index("by_nozology", ["nozology"]) 
  .index("by_mongo_id", ["mongoId"]);

export const clinicTaskDoc = v.object({
  ...clinicTaskFields,
  _id: v.id("clinic_tasks"),
  _creationTime: v.number(),
});


