import { query, mutation, action, internalQuery, internalAction } from "../_generated/server";
import { v } from "convex/values";
import { pinDoc, pinFields } from "../models/pin";
import { api, internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";

export const getById = query({
  args: { id: v.id("pins") },
  returns: v.union(pinDoc, v.null()),
  handler: async ({ db }, { id }) => db.get(id),
});

/** Список pin id и image для записей, у которых image заканчивается на .heic (для миграции). */
export const listHeicImageIds = internalQuery({
  args: {},
  returns: v.array(v.object({ _id: v.id("pins"), image: v.string() })),
  handler: async ({ db }) => {
    const all = await (db as any).query("pins").collect();
    return all
      .filter((p: any) => typeof p.image === "string" && /\.heic$/i.test(p.image))
      .map((p: any) => ({ _id: p._id, image: p.image }));
  },
});

export const list = query({
  args: { page: v.optional(v.number()), limit: v.optional(v.number()), author: v.optional(v.string()), userId: v.optional(v.string()), search: v.optional(v.string()), tags: v.optional(v.array(v.union(v.id("pin_tags"), v.string()))) },
  returns: v.object({ items: v.array(pinDoc), total: v.number(), page: v.number(), totalPages: v.number(), hasMore: v.boolean() }),
  handler: async ({ db }, { page = 1, limit = 20, author, userId, search, tags }) => {
    const bannedUserIds = new Set<string>();
    const reportedPinIds = new Set<string>();
    if (userId) {
      const bans = await (db as any)
        .query("user_bans")
        .withIndex("by_user_and_created", (q: any) => q.eq("userId", userId))
        .collect();
      for (const ban of bans) {
        bannedUserIds.add(String(ban.bannedUserId));
      }
      const reports = await (db as any)
        .query("pin_reports")
        .withIndex("by_reporter", (q: any) => q.eq("reporter", userId))
        .collect();
      for (const report of reports) {
        reportedPinIds.add(String(report.pinId));
      }
    }
    let all = await (db as any).query("pins").collect();
    if (author) all = all.filter((p: any) => String(p.author) === author);
    if (search) {
      const searchLower = search.toLowerCase();
      all = all.filter((p: any) => String(p.title || "").toLowerCase().includes(searchLower));
    }
    if (tags && tags.length > 0) {
      const tagsSet = new Set(tags.map((tag) => String(tag)));
      all = all.filter((p: any) =>
        Array.isArray(p.tags) && p.tags.some((tag: any) => tagsSet.has(String(tag))),
      );
    }
    if (userId) {
      all = all.filter((p: any) =>
        !bannedUserIds.has(String(p.author)) && !reportedPinIds.has(String(p._id)),
      );
    }
    all.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
    const total = all.length; const from = (page - 1) * limit; const items = all.slice(from, from + limit); const totalPages = Math.ceil(total / limit) || 1; return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const insert = mutation({
  args: v.object({ ...pinFields, createdAt: v.string(), updatedAt: v.string() }),
  returns: pinDoc,
  handler: async (ctx, data) => { 
    const id = await ctx.db.insert("pins", data as any);
    const created = (await ctx.db.get(id))!;
    
    // Update task progress for create_pin
    try {
      await ctx.runMutation(internal.functions.progress.updateActionProgress, {
        userId: (data.author as any),
        actionType: "create_pin" as const,
        amount: 1,
      });
    } catch (error) {
      console.error("Error updating task progress for create_pin:", error);
    }
    
    return created;
  },
});

// Public action: upload image to S3 and create pin
export const create = action({
  args: {
    title: v.string(),
    description: v.string(),
    image: v.object({ base64: v.string(), contentType: v.string() }),
    author: v.union(v.id("users"), v.string()),
    tags: v.optional(v.array(v.union(v.id("pin_tags"), v.string()))),
    likes: v.optional(v.number()),
    comments: v.optional(v.number()),
  },
  returns: pinDoc,
  handler: async (ctx, args) => {
    // Загружаем изображение в S3
    const imagePath = await ctx.runAction(internal.helpers.upload.uploadToS3, {
      file: args.image,
      fileType: "images",
    });

    // Создаем кейс с путем к изображению
    const now = new Date().toISOString();
    const created: Doc<"pins"> = await ctx.runMutation(api.functions.pins.insert, {
      title: args.title,
      description: args.description,
      image: imagePath,
      author: args.author,
      tags: args.tags,
      likes: args.likes ?? 0,
      comments: args.comments ?? 0,
      createdAt: now,
      updatedAt: now,
    });
    return created;
  },
});

export const update = mutation({
  args: {
    id: v.id("pins"),
    data: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      image: v.optional(v.string()),
      tags: v.optional(v.array(v.union(v.id("pin_tags"), v.string()))),
    }),
  },
  returns: pinDoc,
  handler: async ({ db }, { id, data }) => { await db.patch(id, { ...data, updatedAt: new Date().toISOString() } as any); return (await db.get(id))!; },
});

export const remove = mutation({
  args: { id: v.id("pins") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    // каскад: удалить лайки, комментарии, сохранения
    const pinIdStr = id as string;
    for await (const like of (db as any).query("pin_likes").withIndex("by_pin_user", (q: any) => q.eq("pinId", pinIdStr))) {
      await db.delete(like._id);
    }
    for await (const c of (db as any).query("pin_comments").withIndex("by_pin_created", (q: any) => q.eq("pinId", pinIdStr))) {
      await db.delete(c._id);
    }
    // Для user_saved_pins используем обычный запрос, так как индекс требует userId первым
    const savedPins = await (db as any).query("user_saved_pins").collect();
    for (const sp of savedPins) {
      if (sp.pinId === pinIdStr) {
        await db.delete(sp._id);
      }
    }
    await db.delete(id);
    return true;
  },
});

export const getSimilarPins = query({
  args: { pinId: v.id("pins"), limit: v.optional(v.number()), page: v.optional(v.number()), userId: v.optional(v.string()) },
  returns: v.array(pinDoc),
  handler: async ({ db }, { pinId, limit = 10, page = 1, userId }) => {
    const originalPin = await db.get(pinId);
    if (!originalPin) {
      throw new Error("Кейс не найден");
    }

    const originalTags = (originalPin as any).tags || [];
    const originalTitle = (originalPin as any).title || "";

    const bannedUserIds = new Set<string>();
    const reportedPinIds = new Set<string>();
    if (userId) {
      const bans = await (db as any)
        .query("user_bans")
        .withIndex("by_user_and_created", (q: any) => q.eq("userId", userId))
        .collect();
      for (const ban of bans) {
        bannedUserIds.add(String(ban.bannedUserId));
      }
      const reports = await (db as any)
        .query("pin_reports")
        .withIndex("by_reporter", (q: any) => q.eq("reporter", userId))
        .collect();
      for (const report of reports) {
        reportedPinIds.add(String(report.pinId));
      }
    }

    const allPins = await (db as any).query("pins").collect();
    const baseFilter = (p: any) =>
      p._id !== pinId &&
      (!userId || (!bannedUserIds.has(String(p.author)) && !reportedPinIds.has(String(p._id))));

    let similarPins: any[];

    if (originalTags.length === 0) {
      // Fallback: похожие по заголовку (ключевые слова из title)
      const keywords = originalTitle
        .split(/\s+/)
        .map((w: string) => w.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase())
        .filter((w: string) => w.length >= 2)
        .filter((w: string, i: number, arr: string[]) => arr.indexOf(w) === i)
        .slice(0, 15);
      if (keywords.length === 0) {
        similarPins = allPins
          .filter(baseFilter)
          .sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
      } else {
        similarPins = allPins
          .filter(baseFilter)
          .map((p: any) => {
            const title = (p.title || "").toLowerCase();
            const keywordMatches = keywords.filter((k: string) => title.includes(k)).length;
            return { ...p, tagMatches: keywordMatches };
          })
          .filter((p: any) => p.tagMatches > 0)
          .sort((a: any, b: any) => {
            if (b.tagMatches !== a.tagMatches) return b.tagMatches - a.tagMatches;
            if (b.likes !== a.likes) return b.likes - a.likes;
            return b.createdAt.localeCompare(a.createdAt);
          });
      }
    } else {
      similarPins = allPins
        .filter(baseFilter)
        .map((p: any) => {
          const pinTags = p.tags || [];
          const tagMatches = originalTags.filter((tag: any) =>
            pinTags.some((pt: any) => String(pt) === String(tag))
          ).length;
          return { ...p, tagMatches };
        })
        .filter((p: any) => p.tagMatches > 0)
        .sort((a: any, b: any) => {
          if (b.tagMatches !== a.tagMatches) return b.tagMatches - a.tagMatches;
          if (b.likes !== a.likes) return b.likes - a.likes;
          return b.createdAt.localeCompare(a.createdAt);
        });
    }

    const from = (page - 1) * limit;
    const paginatedPins = similarPins
      .slice(from, from + limit)
      .map(({ tagMatches, ...rest }: any) => rest);

    return paginatedPins as any[];
  },
});

export const getSimilarPinsByTitle = query({
  args: { pinId: v.id("pins"), limit: v.optional(v.number()), page: v.optional(v.number()), keywords: v.array(v.string()), userId: v.optional(v.string()) },
  returns: v.array(pinDoc),
  handler: async ({ db }, { pinId, limit = 10, page = 1, keywords, userId }) => {
    const originalPin = await db.get(pinId);
    if (!originalPin) {
      return [];
    }

    const bannedUserIds = new Set<string>();
    const reportedPinIds = new Set<string>();
    if (userId) {
      const bans = await (db as any)
        .query("user_bans")
        .withIndex("by_user_and_created", (q: any) => q.eq("userId", userId))
        .collect();
      for (const ban of bans) {
        bannedUserIds.add(String(ban.bannedUserId));
      }
      const reports = await (db as any)
        .query("pin_reports")
        .withIndex("by_reporter", (q: any) => q.eq("reporter", userId))
        .collect();
      for (const report of reports) {
        reportedPinIds.add(String(report.pinId));
      }
    }

    if (keywords.length === 0) {
      // If no keywords, return recent pins
      const allPins = await (db as any).query("pins").collect();
      const sortedPins = allPins
        .filter((p: any) => p._id !== pinId)
        .filter((p: any) =>
          !userId ||
          (!bannedUserIds.has(String(p.author)) && !reportedPinIds.has(String(p._id))),
        )
        .sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
      const from = (page - 1) * limit;
      return sortedPins.slice(from, from + limit) as any[];
    }

    const allPins = await (db as any).query("pins").collect();
    
    // Calculate keyword matches
    const similarPins = allPins
      .filter((p: any) => p._id !== pinId)
      .filter((p: any) =>
        !userId ||
        (!bannedUserIds.has(String(p.author)) && !reportedPinIds.has(String(p._id))),
      )
      .map((p: any) => {
        const title = (p.title || '').toLowerCase();
        const keywordMatches = keywords.filter((keyword: string) => 
          title.includes(keyword.toLowerCase())
        ).length;
        
        return {
          ...p,
          keywordMatches,
        };
      })
      .filter((p: any) => p.keywordMatches > 0)
      .sort((a: any, b: any) => {
        if (b.keywordMatches !== a.keywordMatches) {
          return b.keywordMatches - a.keywordMatches;
        }
        if (b.likes !== a.likes) {
          return b.likes - a.likes;
        }
        return b.createdAt.localeCompare(a.createdAt);
      });

    // Apply pagination
    const from = (page - 1) * limit;
    const paginatedPins = similarPins
      .slice(from, from + limit)
      .map(({ keywordMatches, ...rest }: any) => rest);

    return paginatedPins as any[];
  },
});

export const rating = query({
  args: {},
  returns: v.array(
    v.object({
      authorId: v.union(v.id("users"), v.string()),
      pinsCount: v.number(),
      user: v.union(
        v.object({
          _id: v.id("users"),
          fullName: v.optional(v.string()),
          email: v.optional(v.string()),
          avatar: v.optional(v.string()),
        }),
        v.null(),
      ),
    }),
  ),
  handler: async ({ db }) => {
    const allPins = await (db as any).query("pins").collect();
    const users = await (db as any).query("users").collect();
    const usersById = new Map<string, any>(users.map((u: any) => [String(u._id), u]));

    const counts = new Map<string, { authorId: any; pinsCount: number }>();
    for (const pin of allPins) {
      const key = String(pin.author);
      const current = counts.get(key);
      if (current) {
        current.pinsCount += 1;
      } else {
        counts.set(key, { authorId: pin.author, pinsCount: 1 });
      }
    }

    return Array.from(counts.values())
      .sort((a, b) => b.pinsCount - a.pinsCount)
      .slice(0, 20)
      .map((row) => {
        const user = usersById.get(String(row.authorId));
        const optionalString = (value: unknown) =>
          typeof value === "string" ? value : undefined;
        return {
          authorId: row.authorId,
          pinsCount: row.pinsCount,
          user: user
            ? {
                _id: user._id,
                fullName: optionalString(user.fullName),
                email: optionalString(user.email),
                avatar: optionalString(user.avatar),
              }
            : null,
        };
      });
  },
});

/**
 * Временная миграция: переводит все pins с изображениями .heic в JPEG.
 * Скачивает HEIC из S3 по ключу (поле image), конвертирует в JPEG, загружает в S3 и обновляет поле image.
 *
 * Требует в Convex env:
 * - S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET_NAME, S3_ENDPOINT_URL — доступ к S3 (для чтения).
 * - S3_IMAGE_DIRECTORY — префикс ключа в бакете (например drsarha-ru), если в БД хранится путь без него (images/xxx.heic).
 * Загрузка нового JPEG — через Convex (helpers/s3 putObjectBase64), без внешнего эндпоинта.
 *
 * batchSize — сколько пинов обработать за один запуск (по умолчанию 20; 0 = все сразу).
 * После выполнения миграции функцию можно удалить.
 */
export const migratePinsHeicToJpeg = internalAction({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, { batchSize = 20 }) => {
    const bucket = process.env.S3_BUCKET_NAME;
    if (!bucket) {
      throw new Error(
        "S3_BUCKET_NAME is required for migration. Set it in Convex dashboard (Settings → Environment Variables)."
      );
    }
    const path = (key: string) => (key.startsWith("/") ? key.slice(1) : key);
    const prefix = process.env.S3_IMAGE_DIRECTORY?.replace(/\/$/, "");
    const fullKey = (relativePath: string) =>
      prefix ? `${prefix}/${path(relativePath)}` : path(relativePath);

    const list = await ctx.runQuery(internal.functions.pins.listHeicImageIds, {});
    const toProcess = batchSize > 0 ? list.slice(0, batchSize) : list;
    const results: { id: string; ok: boolean; error?: string }[] = [];

    for (const pin of toProcess) {
      try {
        const key = fullKey(pin.image);
        const { base64, contentType } = await ctx.runAction(internal.helpers.s3.getObjectAsBase64, {
          bucket,
          key,
        });

        const jpegFile = await ctx.runAction(internal.helpers.upload.convertHeicToJpeg, {
          file: { base64, contentType },
        });
        const newPath = await ctx.runAction(internal.helpers.upload.uploadToS3, {
          file: jpegFile,
          fileType: "images",
        });
        await ctx.runMutation(api.functions.pins.update, {
          id: pin._id,
          data: { image: newPath },
        });
        results.push({ id: String(pin._id), ok: true });
      } catch (e: any) {
        results.push({ id: String(pin._id), ok: false, error: e?.message ?? String(e) });
      }
    }

    return {
      processed: results.length,
      totalHeic: list.length,
      results,
    };
  },
});
