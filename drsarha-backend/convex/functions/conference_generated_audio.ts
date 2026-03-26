import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { conferenceGeneratedAudioDoc } from "../models/conferenceGeneratedAudio";

const DEFAULT_AUDIO_KEY = "latest";

async function getAudioByKey(db: any, key: string) {
  return await (db as any)
    .query("conference_generated_audio")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .unique();
}

export const getLatestConferenceGeneratedAudio = query({
  args: {
    key: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      _id: v.id("conference_generated_audio"),
      _creationTime: v.number(),
      key: v.string(),
      text: v.string(),
      fileName: v.string(),
      mimeType: v.string(),
      audioUrl: v.string(),
      provider: v.string(),
      modelId: v.optional(v.string()),
      voiceId: v.optional(v.string()),
      byteLength: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, { key }) => {
    const normalizedKey = key?.trim() || DEFAULT_AUDIO_KEY;
    const existing = await getAudioByKey(ctx.db, normalizedKey);

    if (!existing) {
      return null;
    }

    return existing as any;
  },
});

export const saveLatestConferenceGeneratedAudio = mutation({
  args: {
    key: v.optional(v.string()),
    text: v.string(),
    fileName: v.string(),
    mimeType: v.string(),
    audioUrl: v.string(),
    provider: v.string(),
    modelId: v.optional(v.string()),
    voiceId: v.optional(v.string()),
    byteLength: v.number(),
  },
  returns: conferenceGeneratedAudioDoc,
  handler: async (ctx, args) => {
    const normalizedKey = args.key?.trim() || DEFAULT_AUDIO_KEY;
    const now = Date.now();
    const existing = await getAudioByKey(ctx.db, normalizedKey);

    if (existing) {
      await ctx.db.patch(existing._id, {
        key: normalizedKey,
        text: args.text,
        fileName: args.fileName,
        mimeType: args.mimeType,
        audioUrl: args.audioUrl,
        provider: args.provider,
        modelId: args.modelId,
        voiceId: args.voiceId,
        byteLength: args.byteLength,
        updatedAt: now,
      } as any);

      return (await ctx.db.get(existing._id))! as any;
    }

    const id = await ctx.db.insert("conference_generated_audio", {
      key: normalizedKey,
      text: args.text,
      fileName: args.fileName,
      mimeType: args.mimeType,
      audioUrl: args.audioUrl,
      provider: args.provider,
      modelId: args.modelId,
      voiceId: args.voiceId,
      byteLength: args.byteLength,
      createdAt: now,
      updatedAt: now,
    } as any);

    return (await ctx.db.get(id))! as any;
  },
});
