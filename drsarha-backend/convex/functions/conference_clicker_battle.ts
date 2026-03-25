import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import {
  conferenceClickerBattleDoc,
  conferenceClickerBattleSide,
} from "../models/conferenceClickerBattle";

async function getBattleSide(db: any, side: "jedi" | "sith") {
  return await (db as any)
    .query("conference_clicker_battle")
    .withIndex("by_side", (q: any) => q.eq("side", side))
    .unique();
}

export const listConferenceClickerBattle = query({
  args: {},
  returns: v.array(conferenceClickerBattleDoc),
  handler: async ({ db }) => {
    return (await (db as any).query("conference_clicker_battle").collect()) as any;
  },
});

export const getConferenceClickerBattleSide = query({
  args: {
    side: conferenceClickerBattleSide,
  },
  returns: v.union(conferenceClickerBattleDoc, v.null()),
  handler: async ({ db }, { side }) => {
    return ((await getBattleSide(db, side)) ?? null) as any;
  },
});

export const createConferenceClickerBattleSide = mutation({
  args: {
    side: conferenceClickerBattleSide,
    count: v.optional(v.number()),
  },
  returns: conferenceClickerBattleDoc,
  handler: async ({ db }, { side, count }) => {
    const existing = await getBattleSide(db, side);
    if (existing) {
      throw new Error("Conference clicker battle side already exists");
    }

    const now = Date.now();
    const id = await db.insert("conference_clicker_battle", {
      side,
      count: Math.max(0, count ?? 0),
      createdAt: now,
      updatedAt: now,
    } as any);

    return (await db.get(id))! as any;
  },
});

export const upsertConferenceClickerBattleSide = mutation({
  args: {
    side: conferenceClickerBattleSide,
    count: v.number(),
  },
  returns: conferenceClickerBattleDoc,
  handler: async ({ db }, { side, count }) => {
    const existing = await getBattleSide(db, side);
    const now = Date.now();
    const nextCount = Math.max(0, count);

    if (existing) {
      await db.patch(existing._id, {
        count: nextCount,
        updatedAt: now,
      } as any);
      return (await db.get(existing._id))! as any;
    }

    const id = await db.insert("conference_clicker_battle", {
      side,
      count: nextCount,
      createdAt: now,
      updatedAt: now,
    } as any);

    return (await db.get(id))! as any;
  },
});

export const incrementConferenceClickerBattleSide = mutation({
  args: {
    side: conferenceClickerBattleSide,
    delta: v.optional(v.number()),
  },
  returns: conferenceClickerBattleDoc,
  handler: async ({ db }, { side, delta }) => {
    const existing = await getBattleSide(db, side);
    const now = Date.now();
    const nextDelta = delta ?? 1;

    if (existing) {
      await db.patch(existing._id, {
        count: Math.max(0, (existing.count ?? 0) + nextDelta),
        updatedAt: now,
      } as any);
      return (await db.get(existing._id))! as any;
    }

    const id = await db.insert("conference_clicker_battle", {
      side,
      count: Math.max(0, nextDelta),
      createdAt: now,
      updatedAt: now,
    } as any);

    return (await db.get(id))! as any;
  },
});

export const deleteConferenceClickerBattleSide = mutation({
  args: {
    side: conferenceClickerBattleSide,
  },
  returns: v.boolean(),
  handler: async ({ db }, { side }) => {
    const existing = await getBattleSide(db, side);
    if (!existing) {
      return false;
    }

    await db.delete(existing._id);
    return true;
  },
});
