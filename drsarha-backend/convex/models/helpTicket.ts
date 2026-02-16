import { defineTable } from "convex/server";
import { v } from "convex/values";

export const helpTicketFields = {
  name: v.string(),
  subject: v.string(),
  phone: v.string(),
  email: v.string(),
  createdAt: v.optional(v.string()),
  mongoId: v.optional(v.string()),
};

export const helpTicketsTable = defineTable(helpTicketFields);

export const helpTicketDoc = v.object({
  ...helpTicketFields,
  _id: v.id("help_tickets"),
  _creationTime: v.number(),
});

