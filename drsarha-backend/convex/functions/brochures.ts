import { query, mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { brochureValidator, brochureDoc } from "../models/brochure";
import type { BrochureCreateInput, BrochureUpdateInput } from "../models/brochure";
import { api, internal } from "../_generated/api";

const sortByIdx = <T extends { idx?: number; _creationTime?: number }>(items: T[]) =>
  items.slice().sort((a, b) => {
    const aIdx = a.idx;
    const bIdx = b.idx;
    if (aIdx === undefined && bIdx === undefined) {
      return (a._creationTime ?? 0) - (b._creationTime ?? 0);
    }
    if (aIdx === undefined) return 1;
    if (bIdx === undefined) return -1;
    if (aIdx !== bIdx) return bIdx - aIdx;
    return (a._creationTime ?? 0) - (b._creationTime ?? 0);
  });

export const list = query({
  args: {
    nozology: v.optional(v.string()),
    search: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    forcePublish: v.optional(v.boolean()),
    app_visible: v.optional(v.boolean()),
    admin_id: v.optional(v.string()),
  },
  returns: v.object({
    items: v.array(brochureDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { nozology, search, page = 1, limit = 10, forcePublish, app_visible, admin_id }) => {
    const from = (page - 1) * limit;
    const now = Date.now();
    const isAdmin = admin_id && admin_id === process.env.ADMIN_ID;
    const allowUnpublished = isAdmin && forcePublish !== false;

    const candidates = nozology
      ? await (db as any)
          .query("brochures")
          .withIndex("by_nozology", (q: any) => q.eq("nozology", nozology))
          .collect()
      : await db.query("brochures").collect();

    // Фильтрация по publishAfter, если forcePublish не установлен
    let filtered = allowUnpublished
      ? candidates 
      : candidates.filter((b: any) => {
          if (!b.publishAfter) return true; // Если publishAfter не установлен, показываем
          return b.publishAfter <= now; // Показываем только если дата публикации наступила
        });

    // Фильтрация по app_visible
    if (app_visible === true) {
      filtered = filtered.filter((b: any) => b.app_visible === true);
    }

    // Фильтрация по поиску
    if (search) {
      filtered = filtered.filter((b: any) => b.name.toLowerCase().includes(search.toLowerCase()));
    }

    const sorted = sortByIdx(filtered);
    const total = sorted.length;
    const items = sorted.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  },
});

export const getById = query({
  args: { id: v.id("brochures") },
  returns: v.union(brochureDoc, v.null()),
  handler: async ({ db }, { id }) => {
    return await db.get(id);
  },
});

export const getByMongoId = query({
  args: { mongoId: v.string() },
  returns: v.union(brochureDoc, v.null()),
  handler: async ({ db }, { mongoId }) => {
    const docs = await (db as any)
      .query("brochures")
      .withIndex("by_mongo_id", (q: any) => q.eq("mongoId", mongoId))
      .collect();
    return docs[0] ?? null;
  },
});

export const insert = mutation({
  args: brochureValidator,
  returns: brochureDoc,
  handler: async ({ db }, input: BrochureCreateInput) => {
    const id = await db.insert("brochures", input);
    const doc = await db.get(id);
    if (!doc) throw new Error("Failed to read brochure after insert");
    return doc;
  },
});

export const update = mutation({
  args: {
    id: v.id("brochures"),
    data: v.object({
      name: v.optional(v.string()),
      cover_image: v.optional(v.string()),
      pdf_file: v.optional(v.string()),
      nozology: v.optional(v.string()),
      mongoId: v.optional(v.string()),
      idx: v.optional(v.number()),
      publishAfter: v.optional(v.number()),
      app_visible: v.optional(v.boolean()),
      references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
    }),
  },
  returns: brochureDoc,
  handler: async ({ db }, { id, data }) => {
    await db.patch(id, data as BrochureUpdateInput);
    const doc = await db.get(id);
    if (!doc) throw new Error("Brochure not found after update");
    return doc;
  },
});

export const remove = mutation({
  args: { id: v.id("brochures") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return true;
  },
});

// Public action: upload to S3 via Bun and create brochure
export const create = action({
  args: {
    name: v.string(),
    nozology: v.string(),
    cover: v.object({ base64: v.string(), contentType: v.string() }),
    pdf: v.object({ base64: v.string(), contentType: v.string() }),
    bunUrl: v.optional(v.string()),
    token: v.optional(v.string()),
    publishAfter: v.optional(v.number()),
    app_visible: v.optional(v.boolean()),
    idx: v.optional(v.number()),
    references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
  },
  returns: brochureDoc,
  handler: async (ctx, args) => {
    const coverPath = await ctx.runAction(internal.helpers.upload.uploadToS3, {
      file: args.cover,
      fileType: "images",
    });
    const pdfPath = await ctx.runAction(internal.helpers.upload.uploadToS3, {
      file: args.pdf,
      fileType: "pdf",
    });

    const created = await ctx.runMutation(api.functions.brochures.insert, {
      name: args.name,
      nozology: args.nozology,
      cover_image: coverPath,
      pdf_file: pdfPath,
      ...(args.idx !== undefined ? { idx: args.idx } : {}),
      ...(args.publishAfter ? { publishAfter: args.publishAfter } : {}),
      ...(args.app_visible !== undefined ? { app_visible: args.app_visible } : {}),
      ...(args.references ? { references: args.references } : {}),
    });
    return created;
  },
});

// Public action: optionally upload files to S3 and update brochure
export const updateAction = action({
  args: {
    id: v.id("brochures"),
    name: v.optional(v.string()),
    nozology: v.optional(v.string()),
    cover: v.optional(v.object({ base64: v.string(), contentType: v.string() })),
    pdf: v.optional(v.object({ base64: v.string(), contentType: v.string() })),
    publishAfter: v.optional(v.number()),
    app_visible: v.optional(v.boolean()),
    idx: v.optional(v.number()),
    references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
  },
  returns: brochureDoc,
  handler: async (ctx, args) => {
    const data: {
      name?: string;
      nozology?: string;
      cover_image?: string;
      pdf_file?: string;
      publishAfter?: number;
      app_visible?: boolean;
      idx?: number;
      references?: Array<{ name: string | null; url: string }>;
    } = {};

    if (args.name) data.name = args.name;
    if (args.nozology) data.nozology = args.nozology;
    if (args.publishAfter !== undefined) data.publishAfter = args.publishAfter;
    if (args.app_visible !== undefined) data.app_visible = args.app_visible;
    if (args.idx !== undefined) data.idx = args.idx;
    if (args.references !== undefined) data.references = args.references;

    if (args.cover) {
      const coverPath = await ctx.runAction(internal.helpers.upload.uploadToS3, {
        file: args.cover,
        fileType: "images",
      });
      data.cover_image = coverPath;
    }
    if (args.pdf) {
      const pdfPath = await ctx.runAction(internal.helpers.upload.uploadToS3, {
        file: args.pdf,
        fileType: "pdf",
      });
      data.pdf_file = pdfPath;
    }

    console.log("PDF :",args.pdf)

    const updated = await ctx.runMutation(api.functions.brochures.update, {
      id: args.id,
      data,
    });
    return updated;
  },
});
