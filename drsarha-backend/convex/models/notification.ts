import { defineTable } from "convex/server";
import { v } from "convex/values";

export const notificationFields = {
  createdAt: v.optional(v.string()),
  data: v.object({
    amount: v.optional(v.union(v.null(), v.float64())),
    commentId: v.optional(v.id("pin_comments")),
    commentText: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
    folderName: v.optional(v.string()),
    fromUserId: v.optional(v.id("users")),
    fromUserName: v.optional(v.string()),
    groupId: v.optional(v.string()),
    groupName: v.optional(v.string()),
    knowledgeId: v.optional(
      v.union(
        v.string(),
        v.id("clinic_tasks"),
        v.id("interactive_tasks"),
        v.id("interactive_matches"),
        v.id("interactive_quizzes"),
        v.id("lections"),
      ),
    ),
    isFinished: v.optional(v.boolean()),
    knowledgeName: v.optional(v.string()),
    knowledgeType: v.optional(v.string()),
    message: v.optional(v.string()),
    newLevel: v.optional(v.number()),
    oldLevel: v.optional(v.number()),
    operationType: v.optional(v.string()),
    transactionType: v.optional(v.string()),
    pinId: v.optional(v.string()),
    pinTitle: v.optional(v.string()),
    reason: v.optional(v.string()),
    requestId: v.optional(v.id("collaboration_requests")),
    rewardExp: v.optional(v.float64()),
    rewardStars: v.optional(v.float64()),
    taskId: v.optional(v.string()),
    taskTitle: v.optional(v.string()),
    type: v.optional(v.string()),
  }),
  isViewed: v.boolean(),
  mongoId: v.optional(v.string()),
  type: v.string(),
  updatedAt: v.string(),
  userId: v.string(),
};

export const notificationsTable = defineTable(notificationFields)
  .index("by_user_created", ["userId", "createdAt"]) // для пагинации
  .index("by_user_viewed", ["userId", "isViewed"]);

export const notificationDoc = v.object({
  _id: v.id("notifications"),
  _creationTime: v.number(),
  ...notificationFields,
});


