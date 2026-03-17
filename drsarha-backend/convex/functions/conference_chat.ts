import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import {
  conferenceChatMessageDoc,
  conferenceChatReactionType,
} from "../models/conferenceChat";

async function getConferenceUserOrThrow(db: any, conferenceUserId: any) {
  const conferenceUser = await db.get(conferenceUserId);
  if (!conferenceUser) {
    throw new Error("Conference user not found");
  }

  return conferenceUser;
}

async function getMessageOrThrow(db: any, messageId: any) {
  const message = await db.get(messageId);
  if (!message) {
    throw new Error("Chat message not found");
  }

  return message;
}

async function patchMessageCounters(
  db: any,
  messageId: any,
  patch: {
    likesCount?: number;
    dislikesCount?: number;
    repliesCount?: number;
  }
) {
  await db.patch(messageId, patch);
  return (await db.get(messageId))!;
}

export const listMessages = query({
  args: {
    parentMessageId: v.optional(v.union(v.id("conference_chat_messages"), v.null())),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  returns: v.object({
    items: v.array(conferenceChatMessageDoc),
    cursor: v.union(v.string(), v.null()),
    isDone: v.boolean(),
  }),
  handler: async ({ db }, { parentMessageId, limit = 30, cursor }) => {
    const page = await (db as any)
      .query("conference_chat_messages")
      .withIndex("by_parent_createdAt", (q: any) =>
        q.eq("replyToMessageId", parentMessageId ?? null)
      )
      .order("desc")
      .paginate({ numItems: limit, cursor: cursor ?? null });

    return {
      items: page.page,
      cursor: page.continueCursor ?? null,
      isDone: page.isDone,
    };
  },
});

export const createMessage = mutation({
  args: {
    conferenceUserId: v.id("conference_users"),
    messageText: v.string(),
    replyToMessageId: v.optional(v.id("conference_chat_messages")),
  },
  returns: conferenceChatMessageDoc,
  handler: async ({ db }, { conferenceUserId, messageText, replyToMessageId }) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage) {
      throw new Error("Message text is required");
    }

    const conferenceUser = await getConferenceUserOrThrow(db, conferenceUserId);
    const parentMessageId = replyToMessageId ?? null;

    if (parentMessageId) {
      await getMessageOrThrow(db, parentMessageId);
    }

    const now = Date.now();
    const id = await db.insert("conference_chat_messages", {
      authorType: "conference_user",
      conferenceUserId,
      authorName: conferenceUser.name,
      authorSide: conferenceUser.side,
      messageText: trimmedMessage,
      replyToMessageId: parentMessageId,
      likesCount: 0,
      dislikesCount: 0,
      repliesCount: 0,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    } as any);

    if (parentMessageId) {
      const parentMessage = await getMessageOrThrow(db, parentMessageId);
      await patchMessageCounters(db, parentMessageId, {
        repliesCount: (parentMessage.repliesCount ?? 0) + 1,
        updatedAt: now as any,
      } as any);
    }

    return (await db.get(id))! as any;
  },
});

export const createAiMessage = mutation({
  args: {
    messageText: v.string(),
    replyToMessageId: v.optional(v.id("conference_chat_messages")),
    authorName: v.optional(v.string()),
  },
  returns: conferenceChatMessageDoc,
  handler: async ({ db }, { messageText, replyToMessageId, authorName }) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage) {
      throw new Error("Message text is required");
    }

    const parentMessageId = replyToMessageId ?? null;
    if (parentMessageId) {
      await getMessageOrThrow(db, parentMessageId);
    }

    const now = Date.now();
    const id = await db.insert("conference_chat_messages", {
      authorType: "ai",
      conferenceUserId: null,
      authorName: authorName?.trim() || "AI",
      authorSide: "ai",
      messageText: trimmedMessage,
      replyToMessageId: parentMessageId,
      likesCount: 0,
      dislikesCount: 0,
      repliesCount: 0,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    } as any);

    if (parentMessageId) {
      const parentMessage = await getMessageOrThrow(db, parentMessageId);
      await patchMessageCounters(db, parentMessageId, {
        repliesCount: (parentMessage.repliesCount ?? 0) + 1,
        updatedAt: now as any,
      } as any);
    }

    return (await db.get(id))! as any;
  },
});

export const updateMessage = mutation({
  args: {
    id: v.id("conference_chat_messages"),
    conferenceUserId: v.id("conference_users"),
    messageText: v.string(),
  },
  returns: conferenceChatMessageDoc,
  handler: async ({ db }, { id, conferenceUserId, messageText }) => {
    const message = await getMessageOrThrow(db, id);
    if (message.authorType !== "conference_user") {
      throw new Error("Only conference user messages can be updated");
    }
    if (String(message.conferenceUserId) !== String(conferenceUserId)) {
      throw new Error("Not allowed to update this message");
    }

    const trimmedMessage = messageText.trim();
    if (!trimmedMessage) {
      throw new Error("Message text is required");
    }

    await db.patch(id, {
      messageText: trimmedMessage,
      updatedAt: Date.now(),
    } as any);

    return (await db.get(id))! as any;
  },
});

export const deleteMessage = mutation({
  args: {
    id: v.id("conference_chat_messages"),
    conferenceUserId: v.optional(v.id("conference_users")),
  },
  returns: conferenceChatMessageDoc,
  handler: async ({ db }, { id, conferenceUserId }) => {
    const message = await getMessageOrThrow(db, id);

    if (
      message.authorType === "conference_user" &&
      String(message.conferenceUserId) !== String(conferenceUserId)
    ) {
      throw new Error("Not allowed to delete this message");
    }

    await db.patch(id, {
      isDeleted: true,
      messageText: "",
      updatedAt: Date.now(),
    } as any);

    return (await db.get(id))! as any;
  },
});

export const toggleReaction = mutation({
  args: {
    messageId: v.id("conference_chat_messages"),
    conferenceUserId: v.id("conference_users"),
    reaction: conferenceChatReactionType,
  },
  returns: v.object({
    messageId: v.id("conference_chat_messages"),
    reaction: v.union(conferenceChatReactionType, v.null()),
    likesCount: v.number(),
    dislikesCount: v.number(),
  }),
  handler: async ({ db }, { messageId, conferenceUserId, reaction }) => {
    await getConferenceUserOrThrow(db, conferenceUserId);
    const message = await getMessageOrThrow(db, messageId);
    const existing = await (db as any)
      .query("conference_chat_reactions")
      .withIndex("by_message_user", (q: any) =>
        q.eq("messageId", messageId).eq("conferenceUserId", conferenceUserId)
      )
      .unique();

    let nextReaction: "like" | "dislike" | null = reaction;
    let likesCount = message.likesCount ?? 0;
    let dislikesCount = message.dislikesCount ?? 0;

    if (!existing) {
      await db.insert("conference_chat_reactions", {
        messageId,
        conferenceUserId,
        reaction,
        createdAt: Date.now(),
      } as any);

      if (reaction === "like") likesCount += 1;
      if (reaction === "dislike") dislikesCount += 1;
    } else if (existing.reaction === reaction) {
      await db.delete(existing._id);
      nextReaction = null;
      if (reaction === "like") likesCount = Math.max(0, likesCount - 1);
      if (reaction === "dislike") dislikesCount = Math.max(0, dislikesCount - 1);
    } else {
      await db.patch(existing._id, {
        reaction,
      } as any);

      if (reaction === "like") {
        likesCount += 1;
        dislikesCount = Math.max(0, dislikesCount - 1);
      } else {
        dislikesCount += 1;
        likesCount = Math.max(0, likesCount - 1);
      }
    }

    await db.patch(messageId, {
      likesCount,
      dislikesCount,
      updatedAt: Date.now(),
    } as any);

    return {
      messageId,
      reaction: nextReaction,
      likesCount,
      dislikesCount,
    };
  },
});

export const getMyReactions = query({
  args: {
    conferenceUserId: v.id("conference_users"),
    messageIds: v.array(v.id("conference_chat_messages")),
  },
  returns: v.array(
    v.object({
      messageId: v.id("conference_chat_messages"),
      reaction: conferenceChatReactionType,
    })
  ),
  handler: async ({ db }, { conferenceUserId, messageIds }) => {
    const reactions = await (db as any)
      .query("conference_chat_reactions")
      .withIndex("by_user_createdAt", (q: any) =>
        q.eq("conferenceUserId", conferenceUserId)
      )
      .collect();

    const allowedMessageIds = new Set(messageIds.map(String));

    return reactions
      .filter((reaction: any) => allowedMessageIds.has(String(reaction.messageId)))
      .map((reaction: any) => ({
        messageId: reaction.messageId,
        reaction: reaction.reaction,
      }));
  },
});
