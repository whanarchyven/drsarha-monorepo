import { defineTable } from "convex/server";
import { v } from "convex/values";

export const pinReportTypeFields = {
  name: v.string(),
  createdAt: v.optional(v.string()),
  updatedAt: v.string(),
  mongoId: v.optional(v.string()),
};

export const pinReportTypesTable = defineTable(pinReportTypeFields)
  .index("by_name", ["name"]);

export const pinReportTypeDoc = v.object({
  _id: v.id("pin_report_type"),
  _creationTime: v.number(),
  ...pinReportTypeFields,
});


