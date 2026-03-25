import { defineTable } from "convex/server";
import { v } from "convex/values";

export const conferenceClickerBattleSide = v.union(
  v.literal("jedi"),
  v.literal("sith")
);

export const conferenceClickerBattleFields = {
  side: conferenceClickerBattleSide,
  count: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
};

export const conferenceClickerBattleTable = defineTable(
  conferenceClickerBattleFields
).index("by_side", ["side"]);

export const conferenceClickerBattleDoc = v.object({
  _id: v.id("conference_clicker_battle"),
  _creationTime: v.number(),
  ...conferenceClickerBattleFields,
});
