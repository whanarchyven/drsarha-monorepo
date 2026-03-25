import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { conferenceAiTextDoc } from "../models/conferenceAiText";

const DEFAULT_AI_TEXT_KEY = "default";

const conferenceAiTextPatch = {
  key: v.optional(v.string()),
  markdown: v.optional(v.string()),
};

async function getConferenceAiTextByKey(db: any, key: string) {
  return await (db as any)
    .query("conference_ai_text")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .unique();
}

export const listConferenceAiTexts = query({
  args: {},
  returns: v.array(conferenceAiTextDoc),
  handler: async ({ db }) => {
    return (await (db as any).query("conference_ai_text").collect()) as any;
  },
});

export const getConferenceAiText = query({
  args: {
    key: v.optional(v.string()),
  },
  returns: v.union(conferenceAiTextDoc, v.null()),
  handler: async ({ db }, { key }) => {
    const normalizedKey = key?.trim() || DEFAULT_AI_TEXT_KEY;
    return ((await getConferenceAiTextByKey(db, normalizedKey)) ?? null) as any;
  },
});

export const createConferenceAiText = mutation({
  args: {
    key: v.string(),
    markdown: v.string(),
  },
  returns: conferenceAiTextDoc,
  handler: async ({ db }, { key, markdown }) => {
    const normalizedKey = key.trim() || DEFAULT_AI_TEXT_KEY;
    const existing = await getConferenceAiTextByKey(db, normalizedKey);
    if (existing) {
      throw new Error("Conference AI text already exists");
    }

    const now = Date.now();
    const id = await db.insert("conference_ai_text", {
      key: normalizedKey,
      markdown,
      createdAt: now,
      updatedAt: now,
    } as any);

    return (await db.get(id))! as any;
  },
});

export const updateConferenceAiText = mutation({
  args: {
    id: v.id("conference_ai_text"),
    patch: v.object(conferenceAiTextPatch),
  },
  returns: v.union(conferenceAiTextDoc, v.null()),
  handler: async ({ db }, { id, patch }) => {
    const existing = await db.get(id);
    if (!existing) {
      return null;
    }

    const nextKey =
      patch.key !== undefined ? patch.key.trim() || DEFAULT_AI_TEXT_KEY : existing.key;

    if (nextKey !== existing.key) {
      const hit = await getConferenceAiTextByKey(db, nextKey);
      if (hit) {
        throw new Error("Conference AI text key already exists");
      }
    }

    await db.patch(id, {
      ...patch,
      key: nextKey,
      updatedAt: Date.now(),
    } as any);

    return (await db.get(id))! as any;
  },
});

export const upsertConferenceAiText = mutation({
  args: {
    key: v.optional(v.string()),
    markdown: v.string(),
  },
  returns: conferenceAiTextDoc,
  handler: async ({ db }, { key, markdown }) => {
    const normalizedKey = key?.trim() || DEFAULT_AI_TEXT_KEY;
    const existing = await getConferenceAiTextByKey(db, normalizedKey);
    const now = Date.now();

    if (existing) {
      await db.patch(existing._id, {
        markdown,
        updatedAt: now,
      } as any);
      return (await db.get(existing._id))! as any;
    }

    const id = await db.insert("conference_ai_text", {
      key: normalizedKey,
      markdown,
      createdAt: now,
      updatedAt: now,
    } as any);

    return (await db.get(id))! as any;
  },
});

export const deleteConferenceAiText = mutation({
  args: {
    id: v.id("conference_ai_text"),
  },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    const existing = await db.get(id);
    if (!existing) {
      return false;
    }

    await db.delete(id);
    return true;
  },
});
