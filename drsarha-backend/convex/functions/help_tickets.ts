import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { helpTicketDoc, helpTicketFields } from "../models/helpTicket";

export const createHelpTicket = mutation({
  args: {
    name: v.string(),
    subject: v.string(),
    phone: v.string(),
    email: v.string(),
  },
  returns: helpTicketDoc,
  handler: async ({ db }, args) => {
    const id = await db.insert("help_tickets", {
      ...args,
      createdAt: new Date().toISOString(),
    });
    const doc = await db.get(id);
    if (!doc) throw new Error("Failed to read help ticket after insert");
    return doc;
  },
});

