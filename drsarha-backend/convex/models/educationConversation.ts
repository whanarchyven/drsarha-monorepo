import { defineTable } from "convex/server";
import { v } from "convex/values";

export const educationConversationFields = {
  // Временно допускаем строку, чтобы пройти валидацию старых документов.
  // После повторного рерайта ссылок сузим обратно до v.id("users")/v.id("clinic_tasks").
  user_id: v.union(v.id("users"), v.string()),
  task_id: v.union(v.id("clinic_tasks"), v.string()),
  role: v.string(),
  message: v.string(),
  created_at: v.string(),
  mongoId: v.optional(v.string()),
};

export const educationConversationsTable = defineTable(educationConversationFields)
  .index("by_task_id", ["task_id"]) 
  .index("by_user_id", ["user_id"]) 
  .index("by_mongo_id", ["mongoId"]);

export const educationConversationDoc = v.object({
  ...educationConversationFields,
  _id: v.id("drsarha_education_conversations"),
  _creationTime: v.number(),
});


