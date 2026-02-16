import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { pinTagDoc, pinTagFields } from "../models/pinTag";
import { api } from "../_generated/api";

export const getAll = query({
  args: { search: v.optional(v.string()), page: v.optional(v.number()), limit: v.optional(v.number()) },
  returns: v.object({
    items: v.array(pinTagDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { search, page = 1, limit = 20 }) => {
    let all = await (db as any).query("pin_tags").collect();
    
    if (search) {
      const searchLower = search.toLowerCase();
      all = all.filter((tag: any) => tag.name.toLowerCase().includes(searchLower));
    }
    
    // Sort by name
    all.sort((a: any, b: any) => a.name.localeCompare(b.name));
    
    const total = all.length;
    const from = (page - 1) * limit;
    const items = all.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    
    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const list =query({
  args: { search: v.optional(v.string()), page: v.optional(v.number()), limit: v.optional(v.number()) },
  returns: v.object({
    items: v.array(pinTagDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { search, page = 1, limit = 20 }) => {
    let all = await (db as any).query("pin_tags").collect();
    
    if (search) {
      const searchLower = search.toLowerCase();
      all = all.filter((tag: any) => tag.name.toLowerCase().includes(searchLower));
    }
    
    // Sort by name
    all.sort((a: any, b: any) => a.name.localeCompare(b.name));
    
    const total = all.length;
    const from = (page - 1) * limit;
    const items = all.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    
    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
})

export const getById = query({
  args: { id: v.id("pin_tags") },
  returns: v.union(pinTagDoc, v.null()),
  handler: async ({ db }, { id }) => {
    return db.get(id);
  },
});

export const create = mutation({
  args: { name: v.string() },
  returns: pinTagDoc,
  handler: async ({ db }, { name }) => {
    const trimmedName = name.trim();
    
    // Check if tag with this name already exists (case-insensitive)
    const all = await (db as any).query("pin_tags").collect();
    const existing = all.find((tag: any) => tag.name.toLowerCase() === trimmedName.toLowerCase());
    
    if (existing) {
      throw new Error("Тег с таким названием уже существует");
    }
    
    const now = new Date().toISOString();
    const id = await db.insert("pin_tags", {
      name: trimmedName,
      createdAt: now,
      updatedAt: now,
    } as any);
    return (await db.get(id))!;
  },
});

export const update = mutation({
  args: { id: v.id("pin_tags"), name: v.optional(v.string()) },
  returns: pinTagDoc,
  handler: async ({ db }, { id, name }) => {
    const updateData: any = { updatedAt: new Date().toISOString() };
    
    if (name) {
      const trimmedName = name.trim();
      
      // Check uniqueness
      const all = await (db as any).query("pin_tags").collect();
      const existing = all.find(
        (tag: any) => tag.name.toLowerCase() === trimmedName.toLowerCase() && tag._id !== id
      );
      
      if (existing) {
        throw new Error("Тег с таким названием уже существует");
      }
      
      updateData.name = trimmedName;
    }
    
    await db.patch(id, updateData as any);
    return (await db.get(id))!;
  },
});

export const remove = mutation({
  args: { id: v.id("pin_tags") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return true;
  },
});

export const setUserFavoriteTags = mutation({
  args: { userId: v.id("users"), tagIds: v.array(v.id("pin_tags")) },
  returns: v.boolean(),
  handler: async ({ db }, { userId, tagIds }) => {
    const user = await db.get(userId);
    if (!user) throw new Error("User not found");
    
    await db.patch(userId, { favoriteTags: tagIds } as any);
    return true;
  },
});

export const getUserFavoriteTags = query({
  args: { userId: v.id("users") },
  returns: v.union(v.array(pinTagDoc), v.null()),
  handler: async ({ db }, { userId }) => {
    const user = await db.get(userId);
    if (!user || !(user as any).favoriteTags || (user as any).favoriteTags.length === 0) {
      return null;
    }
    
    const tagIds = (user as any).favoriteTags;
    const tags = await Promise.all(
      tagIds.map((tagId: any) => db.get(tagId))
    );
    
    return tags.filter(Boolean) as any[];
  },
});

export const addUserFavoriteTags = mutation({
  args: { userId: v.id("users"), tagIds: v.array(v.id("pin_tags")) },
  returns: v.boolean(),
  handler: async ({ db }, { userId, tagIds }) => {
    const user = await db.get(userId);
    if (!user) throw new Error("User not found");
    
    const currentTags = (user as any).favoriteTags || [];
    const newTags = [...new Set([...currentTags, ...tagIds])];
    
    await db.patch(userId, { favoriteTags: newTags } as any);
    return true;
  },
});

export const removeUserFavoriteTags = mutation({
  args: { userId: v.id("users"), tagIds: v.array(v.id("pin_tags")) },
  returns: v.boolean(),
  handler: async ({ db }, { userId, tagIds }) => {
    const user = await db.get(userId);
    if (!user) throw new Error("User not found");
    
    const currentTags = (user as any).favoriteTags || [];
    const tagIdSet = new Set(tagIds.map((id: any) => id));
    const newTags = currentTags.filter((tagId: any) => !tagIdSet.has(tagId));
    
    await db.patch(userId, { favoriteTags: newTags } as any);
    return true;
  },
});

export const getPopularTags = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(v.object({
    _id: v.id("pin_tags"),
    _creationTime: v.number(),
    name: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    mongoId: v.optional(v.string()),
    usageCount: v.number(),
  })),
  handler: async ({ db }, { limit = 20 }) => {
    const allTags = await (db as any).query("pin_tags").collect();
    const allPins = await (db as any).query("pins").collect();
    
    // Count usage for each tag
    const tagUsageMap = new Map<string, number>();
    
    allTags.forEach((tag: any) => {
      tagUsageMap.set(tag._id, 0);
    });
    
    allPins.forEach((pin: any) => {
      const pinTags = pin.tags || [];
      pinTags.forEach((tagId: any) => {
        const current = tagUsageMap.get(tagId) || 0;
        tagUsageMap.set(tagId, current + 1);
      });
    });
    
    // Create result array with usage count
    const result = allTags.map((tag: any) => ({
      ...tag,
      usageCount: tagUsageMap.get(tag._id) || 0,
    }));
    
    // Sort by usage count descending, then by name
    result.sort((a: any, b: any) => {
      if (b.usageCount !== a.usageCount) {
        return b.usageCount - a.usageCount;
      }
      return a.name.localeCompare(b.name);
    });
    
    return result.slice(0, limit);
  },
});
