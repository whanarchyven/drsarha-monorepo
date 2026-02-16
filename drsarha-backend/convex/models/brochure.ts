import { defineTable } from "convex/server";
import { v } from "convex/values";

// Convex model (validators) for the `brochures` table
export const brochureFields = {
  name: v.string(),
  cover_image: v.string(),
  pdf_file: v.string(),
  nozology: v.union(v.id("nozologies"), v.string()),
  // External stable id from MongoDB
  mongoId: v.optional(v.string()),
  publishAfter: v.optional(v.number()),
  app_visible: v.optional(v.boolean()),
  references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
};

export const brochureValidator = v.object(brochureFields);

export type BrochureCreateInput = {
  name: string;
  cover_image: string;
  pdf_file: string;
  nozology: string;
  mongoId?: string;
};

export type BrochureUpdateInput = Partial<BrochureCreateInput>;

// Table definition with indexes lives in models and is plugged into schema
export const brochuresTable = defineTable(brochureFields)
  .index("by_nozology", ["nozology"]) // фильтры по нозологии
  .index("by_mongo_id", ["mongoId"]);   // быстрый поиск по внешнему ID

// Validator for a full brochure document (including system fields)
export const brochureDoc = v.object({
  ...brochureFields,
  _id: v.id("brochures"),
  _creationTime: v.number(),
});


