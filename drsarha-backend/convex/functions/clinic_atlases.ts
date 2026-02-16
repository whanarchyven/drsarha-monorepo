import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { clinicAtlasDoc, clinicAtlasFields } from "../models/clinicAtlas";

export const getAll = query({
  args: {
    search: v.optional(v.string()),
    id: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    byRate: v.optional(v.boolean()),
  },
  returns: v.object({
    items: v.array(clinicAtlasDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { search, id, page = 1, limit = 10, byRate }) => {
    const from = (page - 1) * limit;
    let all = await (db as any).query("clinic_atlases_test").collect();

    // Filter by search
    if (search) {
      all = all.filter((a: any) =>
        a.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by id
    if (id) {
      all = all.filter((a: any) => a._id === id);
    }

    // Sort by rate if needed
    if (byRate) {
      all = all.map((a: any) => ({
        ...a,
        likesCount: (a.likes || []).length,
      }));
      all.sort((a: any, b: any) => {
        if (b.likesCount !== a.likesCount) {
          return b.likesCount - a.likesCount;
        }
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      all = all.map(({ likesCount, ...rest }: any) => rest);
    }

    const total = all.length;
    const items = all.slice(from, from + limit);
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
  args: { id: v.id("clinic_atlases_test") },
  returns: v.union(clinicAtlasDoc, v.null()),
  handler: async ({ db }, { id }) => {
    return db.get(id);
  },
});

export const create = mutation({
  args: v.object({
    name: v.string(),
    coverImage: v.string(),
    images: v.array(
      v.object({
        title: v.string(),
        image: v.string(),
        description: v.string(),
      })
    ),
    description: v.string(),
    tags: v.array(v.string()),
    mongoId: v.optional(v.string()),
  }),
  returns: clinicAtlasDoc,
  handler: async ({ db }, data) => {
    const now = new Date().toISOString();
    const id = await db.insert("clinic_atlases_test", {
      ...data,
      likes: [],
      comments: [],
      createdAt: now,
    } as any);
    return (await db.get(id))!;
  },
});

export const update = mutation({
  args: {
    id: v.id("clinic_atlases_test"),
    data: v.object({
      name: v.optional(v.string()),
      coverImage: v.optional(v.string()),
      images: v.optional(
        v.array(
          v.object({
            title: v.string(),
            image: v.string(),
            description: v.string(),
          })
        )
      ),
      description: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  returns: clinicAtlasDoc,
  handler: async ({ db }, { id, data }) => {
    await db.patch(id, data as any);
    return (await db.get(id))!;
  },
});

export const remove = mutation({
  args: { id: v.id("clinic_atlases_test") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return true;
  },
});

export const addLike = mutation({
  args: { id: v.id("clinic_atlases_test"), userId: v.string() },
  returns: clinicAtlasDoc,
  handler: async ({ db }, { id, userId }) => {
    const atlas = await db.get(id);
    if (!atlas) throw new Error("Atlas not found");
    const likes = (atlas as any).likes || [];
    if (!likes.includes(userId)) {
      await db.patch(id, { likes: [...likes, userId] } as any);
    }
    return (await db.get(id))!;
  },
});

export const removeLike = mutation({
  args: { id: v.id("clinic_atlases_test"), userId: v.string() },
  returns: clinicAtlasDoc,
  handler: async ({ db }, { id, userId }) => {
    const atlas = await db.get(id);
    if (!atlas) throw new Error("Atlas not found");
    const likes = ((atlas as any).likes || []).filter(
      (u: string) => u !== userId
    );
    await db.patch(id, { likes } as any);
    return (await db.get(id))!;
  },
});

export const addComment = mutation({
  args: { id: v.id("clinic_atlases_test"), commentId: v.string() },
  returns: clinicAtlasDoc,
  handler: async ({ db }, { id, commentId }) => {
    const atlas = await db.get(id);
    if (!atlas) throw new Error("Atlas not found");
    const comments = (atlas as any).comments || [];
    if (!comments.includes(commentId)) {
      await db.patch(id, { comments: [...comments, commentId] } as any);
    }
    return (await db.get(id))!;
  },
});

export const removeComment = mutation({
  args: { id: v.id("clinic_atlases_test"), commentId: v.string() },
  returns: clinicAtlasDoc,
  handler: async ({ db }, { id, commentId }) => {
    const atlas = await db.get(id);
    if (!atlas) throw new Error("Atlas not found");
    const comments = ((atlas as any).comments || []).filter(
      (c: string) => c !== commentId
    );
    await db.patch(id, { comments } as any);
    return (await db.get(id))!;
  },
});

export const searchByName = query({
  args: { name: v.string() },
  returns: v.array(clinicAtlasDoc),
  handler: async ({ db }, { name }) => {
    const all = await (db as any).query("clinic_atlases_test").collect();
    const regex = new RegExp(name, "i");
    return all.filter((a: any) => regex.test(a.name));
  },
});

export const findSimilar = query({
  args: { id: v.id("clinic_atlases_test") },
  returns: v.array(clinicAtlasDoc),
  handler: async ({ db }, { id }) => {
    const atlas = await db.get(id);
    if (!atlas || !(atlas as any).tags || (atlas as any).tags.length === 0) {
      return [];
    }

    const atlasTags = (atlas as any).tags;
    const all = await (db as any).query("clinic_atlases_test").collect();

    const similar = all
      .filter((a: any) => a._id !== id)
      .map((a: any) => {
        const matchingTags = (a.tags || []).filter((tag: string) =>
          atlasTags.includes(tag)
        );
        return {
          ...a,
          matchingTagsCount: matchingTags.length,
        };
      })
      .filter((a: any) => a.matchingTagsCount > 0)
      .sort((a: any, b: any) => b.matchingTagsCount - a.matchingTagsCount)
      .slice(0, 10)
      .map(({ matchingTagsCount, ...rest }: any) => rest);

    return similar;
  },
});


