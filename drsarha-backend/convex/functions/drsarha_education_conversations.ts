import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { educationConversationDoc, educationConversationFields } from "../models/educationConversation";

export const list = query({
  args: {
    user_id: v.optional(v.string()),
    task_id: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(educationConversationDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { user_id, task_id, page = 1, limit = 20 }) => {
    const from = (page - 1) * limit;
    let candidates = await db.query("drsarha_education_conversations").collect();
    if (user_id) candidates = candidates.filter(c => c.user_id === user_id);
    if (task_id) candidates = candidates.filter(c => c.task_id === task_id);
    const total = candidates.length;
    const items = candidates.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const getById = query({
  args: { id: v.id("drsarha_education_conversations") },
  returns: v.union(educationConversationDoc, v.null()),
  handler: async ({ db }, { id }) => db.get(id),
});

export const insert = mutation({
  args: v.object(educationConversationFields),
  returns: educationConversationDoc,
  handler: async ({ db }, data) => {
    const id = await db.insert("drsarha_education_conversations", data);
    const doc = await db.get(id);
    return doc!;
  },
});

export const update = mutation({
  args: {
    id: v.id("drsarha_education_conversations"),
    data: v.object({
      user_id: v.optional(v.string()),
      task_id: v.optional(v.string()),
      role: v.optional(v.string()),
      message: v.optional(v.string()),
      created_at: v.optional(v.string()),
    }),
  },
  returns: educationConversationDoc,
  handler: async ({ db }, { id, data }) => {
    await db.patch(id, data);
    const doc = await db.get(id);
    return doc!;
  },
});

export const remove = mutation({
  args: { id: v.id("drsarha_education_conversations") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return true;
  },
});

// Push a message to education conversation (for Python backend compatibility)
export const pushMessage = mutation({
  args: {
    user_id: v.string(),
    task_id: v.string(),
    role: v.string(),
    message: v.string(),
    created_at: v.optional(v.string()),
  },
  returns: educationConversationDoc,
  handler: async ({ db }, data) => {
    const now = new Date().toISOString();
    const id = await db.insert("drsarha_education_conversations", {
      user_id: data.user_id,
      task_id: data.task_id,
      role: data.role,
      message: data.message,
      created_at: data.created_at || now,
    });
    const doc = await db.get(id);
    return doc!;
  },
});

// Get conversation by user_id and task_id (for Python backend compatibility)
export const getConversation = query({
  args: {
    user_id: v.string(),
    task_id: v.string(),
  },
  returns: v.array(
    v.object({
      user_id: v.string(),
      task_id: v.string(),
      role: v.string(),
      message: v.string(),
      created_at: v.string(),
    })
  ),
  handler: async ({ db }, { user_id, task_id }) => {
    const all = await db.query("drsarha_education_conversations").collect();
    const filtered = all.filter(
      (c: any) => c.user_id === user_id && c.task_id === task_id
    );
    // Sort by created_at and remove _id and _creationTime for MongoDB compatibility
    const sorted = filtered.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateA - dateB;
    });
    return sorted.map((c: any) => ({
      user_id: c.user_id,
      task_id: c.task_id,
      role: c.role,
      message: c.message,
      created_at: c.created_at,
    }));
  },
});


