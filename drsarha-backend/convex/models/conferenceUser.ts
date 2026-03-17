import { defineTable } from "convex/server";
import { v } from "convex/values";

export const conferenceUserFields = {
  name: v.string(),
  phone: v.string(),
  email: v.string(),
  isFullUser: v.boolean(),
  isPaid: v.boolean(),
  isApproved: v.boolean(),
  side: v.union(v.literal("jedi"), v.literal("sith"), v.literal("ai")),
  password: v.union(v.string(), v.null()),
};

export const conferenceUsersTable = defineTable(conferenceUserFields)
  .index("by_email", ["email"])
  .index("by_phone", ["phone"])
  .index("by_isPaid", ["isPaid"]);

export const conferenceUserDoc = v.object({
  _id: v.id("conference_users"),
  _creationTime: v.number(),
  ...conferenceUserFields,
});
