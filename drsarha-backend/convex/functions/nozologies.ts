import { query, mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { nozologyDoc } from "../models/nozology";
import { api, internal } from "../_generated/api";

const sortByIdx = (items: any[]) =>
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

// Base list of nozologies
export const list = query({
  args: {},
  returns: v.array(nozologyDoc),
  handler: async ({ db }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = await (db as any).query("nozologies").collect();
    return sortByIdx(items as any);
  },
});

export const getById = query({
  args: { id: v.id("nozologies") },
  returns: v.union(nozologyDoc, v.null()),
  handler: async ({ db }, { id }) => {
    return (await db.get(id)) as any;
  },
});

// Count materials per nozology
export const materialsCount = query({
  args: {
    nozologyId: v.optional(v.string()),
    nozology: v.optional(v.string()),
    mongoId: v.optional(v.string()),
  },
  returns: v.object({
    brochures: v.number(),
    clinic_atlas: v.number(),
    interactive_task: v.number(),
    lections: v.number(),
    clinic_task: v.number(),
    interactive_quiz: v.number(),
    total: v.number(),
  }),
  handler: async ({ db }, { nozologyId, nozology, mongoId }) => {
    const ids = [nozologyId, nozology, mongoId].filter(
      (value): value is string => Boolean(value)
    );
    if (!ids.length) {
      return {
        brochures: 0,
        clinic_atlas: 0,
        interactive_task: 0,
        lections: 0,
        clinic_task: 0,
        interactive_quiz: 0,
        total: 0,
      };
    }
    // Helper to count: try index by_nozology if exists, else full scan with filter
    const countByNoz = async (table: string): Promise<number> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const q = (db as any).query(table);
      const indexedRows: any[] = [];
      if (q.withIndex) {
        for (const id of ids) {
          try {
            const rows = await q
              .withIndex("by_nozology", (qq: any) => qq.eq("nozology", id))
              .collect();
            if (rows) indexedRows.push(...rows);
          } catch {}
        }
        if (indexedRows.length) {
          const unique = new Map<string, any>();
          for (const row of indexedRows) {
            unique.set(row._id, row);
          }
          return unique.size;
        }
      }
      const rows = await q.collect();
      return rows.filter((r: any) => ids.includes(r.nozology)).length;
    };

    const [brochures, clinicAtlas, interactiveTasks, lections, clinicTasks, interactiveQuizzes] = await Promise.all([
      countByNoz("brochures"),
      countByNoz("clinic_atlases"),
      countByNoz("interactive_tasks"),
      countByNoz("lections"),
      countByNoz("clinic_tasks"),
      countByNoz("interactive_quizzes"),
    ]);

    return {
      brochures,
      clinic_atlas: clinicAtlas,
      interactive_task: interactiveTasks,
      lections,
      clinic_task: clinicTasks,
      interactive_quiz: interactiveQuizzes,
      total: brochures + clinicAtlas + interactiveTasks + lections + clinicTasks + interactiveQuizzes,
    };
  },
});

export const insert = mutation({
  args: v.object({
    name: v.string(),
    cover_image: v.optional(v.string()),
    description: v.optional(v.string()),
    category_id: v.optional(v.string()),
    idx: v.optional(v.number()),
  }),
  returns: nozologyDoc,
  handler: async ({ db }, args) => {
    const id = await db.insert("nozologies", args as any);
    const doc = await db.get(id);
    return doc as any;
  },
});

export const update = mutation({
  args: {
    id: v.id("nozologies"),
    data: v.object({
      name: v.optional(v.string()),
      cover_image: v.optional(v.string()),
      description: v.optional(v.string()),
      category_id: v.optional(v.string()),
      idx: v.optional(v.number()),
    }),
  },
  returns: nozologyDoc,
  handler: async ({ db }, { id, data }) => {
    await db.patch(id, data as any);
    const doc = await db.get(id);
    return doc as any;
  },
});

export const remove = mutation({
  args: { id: v.id("nozologies") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return true;
  },
});

// Public action: upload to S3 via Bun and create nozology
export const create = action({
  args: {
    name: v.string(),
    cover: v.optional(v.object({ base64: v.string(), contentType: v.string() })),
    description: v.optional(v.string()),
    category_id: v.optional(v.string()),
    idx: v.optional(v.number()),
  },
  returns: nozologyDoc,
  handler: async (ctx, args) => {
    let coverPath: string | undefined;
    if (args.cover) {
      coverPath = await ctx.runAction((internal as any).helpers.upload.uploadToS3, {
        file: args.cover,
        fileType: "images",
      });
    }

    const created = await ctx.runMutation(api.functions.nozologies.insert, {
      name: args.name,
      cover_image: coverPath,
      description: args.description,
      category_id: args.category_id,
      ...(args.idx !== undefined ? { idx: args.idx } : {}),
    });
    return created;
  },
});

// Public action: optionally upload file and update nozology
export const updateAction = action({
  args: {
    id: v.id("nozologies"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category_id: v.optional(v.string()),
    idx: v.optional(v.number()),
    cover: v.optional(v.object({ base64: v.string(), contentType: v.string() })),
  },
  returns: nozologyDoc,
  handler: async (ctx, args) => {
    const data: {
      name?: string;
      description?: string;
      category_id?: string;
      idx?: number;
      cover_image?: string;
    } = {};

    if (args.name) data.name = args.name;
    if (args.description) data.description = args.description;
    if (args.category_id) data.category_id = args.category_id;
    if (args.idx !== undefined) data.idx = args.idx;
    if (args.cover) {
      const coverPath = await ctx.runAction((internal as any).helpers.upload.uploadToS3, {
        file: args.cover,
        fileType: "images",
      });
      data.cover_image = coverPath;
    }

    const updated = await ctx.runMutation(api.functions.nozologies.update, {
      id: args.id,
      data,
    });
    return updated;
  },
});


