import { defineTable } from "convex/server";
import { v } from "convex/values";
import { markupTaskGeometryValidator } from "./markupTaskElement";

const feedbackItem = v.object({
  analytic_questions: v.optional(v.array(v.string())),
  answers: v.array(v.object({ answer: v.string(), is_correct: v.boolean() })),
  has_correct: v.boolean(),
  question: v.string(),
  user_answers: v.optional(
    v.union(
      v.string(),
      v.array(v.union(v.string(), v.array(v.string())))
    )
  ),
});

const feedbackEntry = v.object({
  created_at: v.string(),
  feedback: v.array(feedbackItem),
});

const metadataLection = v.object({
  active_time: v.float64(),
  notes: v.array(v.object({ note: v.string(), time: v.float64() })),
});

const metadataAttempt = v.object({
  attempt: v.object({
    answers: v.array(
      v.object({
        answer: v.string(),
        image: v.optional(v.string()),
        is_correct: v.boolean(),
        question: v.optional(v.string()),
      })
    ),
    is_correct: v.optional(v.boolean()),
  }),
  created_at: v.string(),
});

const markupTaskElementIdValidator = v.union(
  v.id("markup_task_elements"),
  v.string()
);

const markupTaskSlideIdValidator = v.union(
  v.id("markup_task_slides"),
  v.string()
);

export const markupTaskUserContourValidator = v.object({
  markup_task_slide_id: markupTaskSlideIdValidator,
  geometry: markupTaskGeometryValidator,
  use_basis: v.optional(v.boolean()),
});

const markupTaskCheatEntry = v.object({
  element_id: markupTaskElementIdValidator,
  markup_task_slide_id: markupTaskSlideIdValidator,
  geometry: markupTaskGeometryValidator,
  used_at: v.string(),
});

const markupTaskMatchEntry = v.object({
  contour_index: v.number(),
  element_id: markupTaskElementIdValidator,
  markup_task_slide_id: markupTaskSlideIdValidator,
  use_basis: v.boolean(),
  awarded_score: v.number(),
  overlap_ratio: v.float64(),
  area_ratio: v.float64(),
});

const markupTaskAttempt = v.object({
  created_at: v.string(),
  completed: v.boolean(),
  score: v.number(),
  score_percent: v.float64(),
  max_score: v.number(),
  guessed_element_ids: v.array(markupTaskElementIdValidator),
  missed_element_ids: v.array(markupTaskElementIdValidator),
  ignored_cheat_element_ids: v.array(markupTaskElementIdValidator),
  conturs: v.array(markupTaskUserContourValidator),
  matches: v.array(markupTaskMatchEntry),
});

const markupTaskClinicAttempt = v.object({
  created_at: v.string(),
  completed: v.boolean(),
  score: v.optional(v.float64()),
  score_percent: v.optional(v.float64()),
});

const markupTaskStageMetadata = v.object({
  completed: v.boolean(),
  completed_at: v.union(v.null(), v.string()),
  last_score: v.number(),
  last_score_percent: v.float64(),
  last_max_score: v.number(),
  guessed_element_ids: v.array(markupTaskElementIdValidator),
  cheats: v.array(markupTaskCheatEntry),
  attempts: v.array(markupTaskAttempt),
});

const markupTaskClinicStageMetadata = v.object({
  completed: v.boolean(),
  completed_at: v.union(v.null(), v.string()),
  attempts: v.array(markupTaskClinicAttempt),
});

export const markupTaskCompletionMetadata = v.object({
  kind: v.literal("markup_task"),
  markupStage: markupTaskStageMetadata,
  clinicStage: markupTaskClinicStageMetadata,
});

export const userCompletionFields = {
  completed_at: v.union(v.null(), v.string()),
  created_at: v.string(),
  feedback: v.array(feedbackEntry),
  is_completed: v.boolean(),
  knowledge_id: v.string(),
  metadata: v.union(
    v.null(),
    metadataLection,
    v.array(metadataAttempt),
    markupTaskCompletionMetadata
  ),
  mongoId: v.optional(v.string()),
  type: v.string(),
  updated_at: v.string(),
  user_id: v.string(),
};

export const userCompletionsTable = defineTable(userCompletionFields)
  .index("by_user_knowledge", ["user_id", "knowledge_id"])
  .index("by_user", ["user_id"]);

export const userCompletionDoc = v.object({
  _id: v.id("user_completions"),
  _creationTime: v.number(),
  ...userCompletionFields,
});


