import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { helpConversationDoc, helpConversationFields } from "../models/helpConversation";

export const list = query({
  args: {
    user_id: v.optional(v.string()),
    task_id: v.optional(v.string()),
    question_id: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(helpConversationDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { user_id, task_id, question_id, page = 1, limit = 20 }) => {
    const from = (page - 1) * limit;
    let candidates = await db.query("drsarha_help_conversations").collect();
    if (user_id) candidates = candidates.filter(c => c.user_id === user_id);
    if (task_id) candidates = candidates.filter(c => c.task_id === task_id);
    if (question_id) candidates = candidates.filter(c => c.question_id === question_id);
    const total = candidates.length;
    const items = candidates.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const getById = query({
  args: { id: v.id("drsarha_help_conversations") },
  returns: v.union(helpConversationDoc, v.null()),
  handler: async ({ db }, { id }) => db.get(id),
});

export const insert = mutation({
  args: v.object(helpConversationFields),
  returns: helpConversationDoc,
  handler: async ({ db }, data) => {
    const id = await db.insert("drsarha_help_conversations", data);
    const doc = await db.get(id);
    return doc!;
  },
});

export const update = mutation({
  args: {
    id: v.id("drsarha_help_conversations"),
    data: v.object({
      user_id: v.optional(v.string()),
      task_id: v.optional(v.string()),
      question_id: v.optional(v.string()),
      comment: v.optional(v.string()),
      correct_answer: v.optional(v.string()),
      invalid_user_answer: v.optional(v.string()),
      messages: v.optional(
        v.array(
          v.object({
            message: v.string(),
            role: v.string(),
            created_at: v.optional(v.string()),
          })
        )
      ),
      created_at: v.optional(v.string()),
    }),
  },
  returns: helpConversationDoc,
  handler: async ({ db }, { id, data }) => {
    await db.patch(id, data);
    const doc = await db.get(id);
    return doc!;
  },
});

export const remove = mutation({
  args: { id: v.id("drsarha_help_conversations") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return true;
  },
});

// Initialize help conversation (create or update) - for Python backend compatibility
export const initHelpConversation = mutation({
  args: {
    user_id: v.string(),
    task_id: v.string(),
    question_id: v.string(),
    comment: v.string(),
    correct_answer: v.string(),
    invalid_user_answer: v.string(),
    messages: v.array(
      v.object({
        message: v.string(),
        role: v.string(),
        created_at: v.optional(v.string()),
      })
    ),
    created_at: v.optional(v.string()),
  },
  returns: helpConversationDoc,
  handler: async ({ db }, data) => {
    // Try to find existing conversation
    const all = await db.query("drsarha_help_conversations").collect();
    const existing = all.find(
      (c: any) =>
        c.user_id === data.user_id &&
        c.task_id === data.task_id &&
        c.question_id === data.question_id
    );

    const now = new Date().toISOString();
    const conversationData = {
      user_id: data.user_id,
      task_id: data.task_id,
      question_id: data.question_id,
      comment: data.comment,
      correct_answer: data.correct_answer,
      invalid_user_answer: data.invalid_user_answer,
      messages: data.messages,
      created_at: data.created_at || now,
    };

    if (existing) {
      // Update existing
      await db.patch(existing._id, conversationData);
      const doc = await db.get(existing._id);
      return doc!;
    } else {
      // Create new
      const id = await db.insert("drsarha_help_conversations", conversationData);
      const doc = await db.get(id);
      return doc!;
    }
  },
});

// Push message to help conversation - for Python backend compatibility
export const pushMessageToHelpConversation = mutation({
  args: {
    user_id: v.string(),
    task_id: v.string(),
    question_id: v.string(),
    message: v.string(),
    role: v.string(),
    created_at: v.optional(v.string()),
  },
  returns: helpConversationDoc,
  handler: async ({ db }, { user_id, task_id, question_id, message, role, created_at }) => {
    // Find existing conversation
    const all = await db.query("drsarha_help_conversations").collect();
    const existing = all.find(
      (c: any) =>
        c.user_id === user_id &&
        c.task_id === task_id &&
        c.question_id === question_id
    );

    if (!existing) {
      throw new Error("Help conversation not found");
    }

    const now = new Date().toISOString();
    const currentMessages = (existing as any).messages || [];
    const newMessage = {
      message,
      role,
      created_at: created_at || now,
    };
    const updatedMessages = [...currentMessages, newMessage];

    await db.patch(existing._id, { messages: updatedMessages });
    const doc = await db.get(existing._id);
    return doc!;
  },
});

// Get help conversation messages - for Python backend compatibility
export const getHelpConversationMessages = query({
  args: {
    user_id: v.string(),
    task_id: v.string(),
    question_id: v.string(),
  },
  returns: v.array(
    v.object({
      message: v.string(),
      role: v.string(),
      created_at: v.string(),
    })
  ),
  handler: async ({ db }, { user_id, task_id, question_id }) => {
    const all = await db.query("drsarha_help_conversations").collect();
    const existing = all.find(
      (c: any) =>
        c.user_id === user_id &&
        c.task_id === task_id &&
        c.question_id === question_id
    );

    if (!existing) {
      return [];
    }

    return (existing as any).messages || [];
  },
});

// Get help conversation - for Python backend compatibility
export const getHelpConversation = query({
  args: {
    user_id: v.string(),
    task_id: v.string(),
    question_id: v.string(),
  },
  returns: v.union(
    v.object({
      user_id: v.string(),
      task_id: v.string(),
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
    }),
    v.null()
  ),
  handler: async ({ db }, { user_id, task_id, question_id }) => {
    const all = await db.query("drsarha_help_conversations").collect();
    const existing = all.find(
      (c: any) =>
        c.user_id === user_id &&
        c.task_id === task_id &&
        c.question_id === question_id
    );

    if (!existing) {
      return null;
    }

    const conv = existing as any;
    // Remove _id and _creationTime for MongoDB compatibility
    return {
      user_id: conv.user_id,
      task_id: conv.task_id,
      question_id: conv.question_id,
      comment: conv.comment,
      correct_answer: conv.correct_answer,
      invalid_user_answer: conv.invalid_user_answer,
      messages: conv.messages || [],
      created_at: conv.created_at,
    };
  },
});


