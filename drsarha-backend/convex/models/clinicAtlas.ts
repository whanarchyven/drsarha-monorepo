import { defineTable } from "convex/server";
import { v } from "convex/values";

export const clinicAtlasFields = {
  name: v.string(),
  coverImage: v.optional(v.string()),
  images: v.array(
    v.union(
      v.string(),
      v.object({
        description: v.string(),
        image: v.string(),
        title: v.string(),
      })
    )
  ),
  description: v.string(),
  tags: v.array(v.string()),
  likes: v.array(v.string()),
  comments: v.array(v.string()),
  createdAt: v.optional(v.string()),
  mongoId: v.optional(v.string()),
};

export const clinicAtlasDoc = v.object({
  ...clinicAtlasFields,
  _id: v.id("clinic_atlases_test"),
  _creationTime: v.number(),
});

export const clinicAtlasesTestTable = defineTable(clinicAtlasFields)
  .index("by_name", ["name"]);


