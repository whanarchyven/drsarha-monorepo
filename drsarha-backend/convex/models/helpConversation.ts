import { defineTable } from "convex/server";
import { v } from "convex/values";

export const helpConversationFields = {
  // Временно допускаем строковые значения для совместимости с остатками данных
  user_id: v.union(v.id("users"), v.string()),
  task_id: v.union(v.id("clinic_tasks"), v.string()),
  question_id: v.string(),
  comment: v.string(),
  correct_answer: v.string(),
  invalid_user_answer: v.string(),
  messages: v.array(
    v.object({
      message: v.string(),
      role: v.string(),
      created_at: v.string(),
    })
  ),
  created_at: v.string(),
  mongoId: v.optional(v.string()),
};

export const helpConversationsTable = defineTable(helpConversationFields)
  .index("by_task_id", ["task_id"]) 
  .index("by_user_id", ["user_id"]) 
  .index("by_question_id", ["question_id"]) 
  .index("by_mongo_id", ["mongoId"]);

export const helpConversationDoc = v.object({
  ...helpConversationFields,
  _id: v.id("drsarha_help_conversations"),
  _creationTime: v.number(),
});


