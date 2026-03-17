import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import {
  conferenceBroadcastDoc,
  conferenceBroadcastFields,
} from "../models/conferenceBroadcast";

const DEFAULT_BROADCAST_KEY = "default";

export const getBroadcastConfig = query({
  args: {},
  returns: v.union(conferenceBroadcastDoc, v.null()),
  handler: async ({ db }) => {
    const config = await (db as any)
      .query("conference_broadcast")
      .withIndex("by_key", (q: any) => q.eq("key", DEFAULT_BROADCAST_KEY))
      .unique();

    return config ?? null;
  },
});

export const upsertBroadcastConfig = mutation({
  args: {
    iframeUrl: conferenceBroadcastFields.iframeUrl,
    isDisplayed: conferenceBroadcastFields.isDisplayed,
    title: conferenceBroadcastFields.title,
  },
  returns: conferenceBroadcastDoc,
  handler: async ({ db }, { iframeUrl, isDisplayed, title }) => {
    const now = Date.now();
    const existing = await (db as any)
      .query("conference_broadcast")
      .withIndex("by_key", (q: any) => q.eq("key", DEFAULT_BROADCAST_KEY))
      .unique();

    if (existing) {
      await db.patch(existing._id, {
        iframeUrl,
        isDisplayed,
        title,
        updatedAt: now,
      } as any);

      return (await db.get(existing._id))! as any;
    }

    const id = await db.insert("conference_broadcast", {
      key: DEFAULT_BROADCAST_KEY,
      iframeUrl,
      isDisplayed,
      title,
      createdAt: now,
      updatedAt: now,
    } as any);

    return (await db.get(id))! as any;
  },
});

export const setBroadcastVisibility = mutation({
  args: {
    isDisplayed: v.boolean(),
  },
  returns: v.union(conferenceBroadcastDoc, v.null()),
  handler: async ({ db }, { isDisplayed }) => {
    const existing = await (db as any)
      .query("conference_broadcast")
      .withIndex("by_key", (q: any) => q.eq("key", DEFAULT_BROADCAST_KEY))
      .unique();

    if (!existing) {
      return null;
    }

    await db.patch(existing._id, {
      isDisplayed,
      updatedAt: Date.now(),
    } as any);

    return (await db.get(existing._id))! as any;
  },
});
