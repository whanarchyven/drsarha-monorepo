import { defineTable } from "convex/server";
import { v } from "convex/values";

export const conferenceChatAuthorSide = v.union(
  v.literal("jedi"),
  v.literal("sith"),
  v.literal("ai")
);

export const conferenceChatAuthorType = v.union(
  v.literal("conference_user"),
  v.literal("ai")
);

export const conferenceChatReactionType = v.union(
  v.literal("like"),
  v.literal("dislike")
);

export const conferenceChatMessageFields = {
  authorType: conferenceChatAuthorType,
  conferenceUserId: v.union(v.id("conference_users"), v.null()),
  authorName: v.string(),
  authorSide: conferenceChatAuthorSide,
  messageText: v.string(),
  replyToMessageId: v.union(v.id("conference_chat_messages"), v.null()),
  likesCount: v.number(),
  dislikesCount: v.number(),
  repliesCount: v.number(),
  isDeleted: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
};

export const conferenceChatMessagesTable = defineTable(
  conferenceChatMessageFields
)
  .index("by_parent_createdAt", ["replyToMessageId", "createdAt"])
  .index("by_createdAt", ["createdAt"])
  .index("by_author_createdAt", ["conferenceUserId", "createdAt"]);

export const conferenceChatMessageDoc = v.object({
  _id: v.id("conference_chat_messages"),
  _creationTime: v.number(),
  ...conferenceChatMessageFields,
});

export const conferenceChatReactionFields = {
  messageId: v.id("conference_chat_messages"),
  conferenceUserId: v.id("conference_users"),
  reaction: conferenceChatReactionType,
  createdAt: v.number(),
};

export const conferenceChatReactionsTable = defineTable(
  conferenceChatReactionFields
)
  .index("by_message_user", ["messageId", "conferenceUserId"])
  .index("by_message_reaction", ["messageId", "reaction"])
  .index("by_user_createdAt", ["conferenceUserId", "createdAt"]);

export const conferenceChatReactionDoc = v.object({
  _id: v.id("conference_chat_reactions"),
  _creationTime: v.number(),
  ...conferenceChatReactionFields,
});
