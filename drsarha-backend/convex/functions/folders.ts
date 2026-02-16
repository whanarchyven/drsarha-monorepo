import { query, mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { folderDoc, folderFields, folderCollaboratorDoc, folderCollaboratorFields, savedPinDoc, savedPinFields } from "../models/folder";
import { api, internal } from "../_generated/api";

export const getById = query({
  args: { id: v.id("folders") },
  returns: v.union(folderDoc, v.null()),
  handler: async ({ db }, { id }) => {
    return db.get(id);
  },
});

export const getUserFolders = query({
  args: { userId: v.id("users"), page: v.optional(v.number()), limit: v.optional(v.number()) },
  returns: v.object({
    items: v.array(v.object({
      ...folderFields,
      _id: v.id("folders"),
      _creationTime: v.number(),
      userRole: v.string(),
    })),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { userId, page = 1, limit = 10 }) => {
    // Get folders where user is owner
    const ownFolders = await (db as any)
      .query("folders")
      .withIndex("by_owner", (q: any) => q.eq("ownerId", userId))
      .collect();
    
    // Sort by createdAt descending
    ownFolders.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
    
    // Get folders where user is collaborator
    const collaboratorEntries = await (db as any)
      .query("folder_collaborators")
      .withIndex("by_user_status", (q: any) => q.eq("userId", userId).eq("status", "active"))
      .collect();
    
    const collaboratorFolders = await Promise.all(
      collaboratorEntries
        .filter((entry: any) => entry.role === "collaborator")
        .map(async (entry: any) => {
          const folder = await db.get(entry.folderId as any);
          return folder ? { ...folder, userRole: "collaborator" } : null;
        })
    );
    
    // Filter out nulls and sort
    const validCollaboratorFolders = collaboratorFolders
      .filter((f): f is any => f !== null)
      .sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
    
    // Combine and add userRole to own folders
    const allFolders = [
      ...ownFolders.map((f: any) => ({ ...f, userRole: "owner" })),
      ...validCollaboratorFolders,
    ];
    
    const total = allFolders.length;
    const from = (page - 1) * limit;
    const items = allFolders.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    
    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const create = mutation({
  args: v.object({
    name: v.string(),
    description: v.string(),
    ownerId: v.id("users"),
    isPrivate: v.optional(v.union(v.boolean(), v.string())),
  }),
  returns: folderDoc,
  handler: async (ctx, data) => {
    const now = new Date().toISOString();
    // Normalize isPrivate to boolean
    let isPrivateValue: boolean | string = false;
    if (data.isPrivate !== undefined) {
      if (typeof data.isPrivate === 'string') {
        isPrivateValue = data.isPrivate === 'true';
      } else {
        isPrivateValue = data.isPrivate;
      }
    }
    
    const folderId = await ctx.db.insert("folders", {
      name: data.name,
      description: data.description,
      ownerId: data.ownerId,
      postsCount: 0,
      collaboratorsCount: 1,
      isPrivate: isPrivateValue,
      createdAt: now,
      updatedAt: now,
    } as any);
    
    // Add creator as owner
    await ctx.db.insert("folder_collaborators", {
      folderId: folderId as any,
      userId: data.ownerId,
      role: "owner",
      joinedAt: now,
      status: "active",
    } as any);
    
    // Update task progress for create_folder
    try {
      await ctx.runMutation(internal.functions.progress.updateActionProgress, {
        userId: data.ownerId,
        actionType: "create_folder" as const,
        amount: 1,
      });
    } catch (error) {
      console.error("Error updating task progress for create_folder:", error);
    }
    
    return (await ctx.db.get(folderId))!;
  },
});

export const update = mutation({
  args: {
    id: v.id("folders"),
    patch: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      isPrivate: v.optional(v.union(v.boolean(), v.string())),
    }),
  },
  returns: folderDoc,
  handler: async ({ db }, { id, patch }) => {
    const updateData: any = { ...patch };
    // Normalize isPrivate if present
    if (patch.isPrivate !== undefined) {
      if (typeof patch.isPrivate === 'string') {
        updateData.isPrivate = patch.isPrivate === 'true';
      } else {
        updateData.isPrivate = patch.isPrivate;
      }
    }
    updateData.updatedAt = new Date().toISOString();
    await db.patch(id, updateData);
    return (await db.get(id))!;
  },
});

export const remove = mutation({
  args: { id: v.id("folders") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    // Delete related data
    const collaborators = await (db as any)
      .query("folder_collaborators")
      .withIndex("by_folder_user", (q: any) => q.eq("folderId", id))
      .collect();
    
    for (const collab of collaborators) {
      await db.delete(collab._id);
    }
    
    const savedPins = await (db as any)
      .query("saved_pins")
      .withIndex("by_folder_saved", (q: any) => q.eq("folderId", id))
      .collect();
    
    for (const pin of savedPins) {
      await db.delete(pin._id);
    }
    
    await db.delete(id);
    return true;
  },
});

export const checkAccess = query({
  args: { userId: v.id("users"), folderId: v.id("folders") },
  returns: v.union(
    v.object({
      role: v.string(),
      permissions: v.object({
        canAddPins: v.boolean(),
        canRemovePins: v.boolean(),
        canRemoveAnyPin: v.boolean(),
        canInviteUsers: v.boolean(),
        canEditFolder: v.boolean(),
        canDeleteFolder: v.boolean(),
        canRemoveUsers: v.boolean(),
      }),
    }),
    v.null()
  ),
  handler: async ({ db }, { userId, folderId }) => {
    const folder = await db.get(folderId);
    if (!folder) return null;
    
    // Check if owner
    if ((folder as any).ownerId === userId) {
      return {
        role: "owner",
        permissions: {
          canAddPins: true,
          canRemovePins: true,
          canRemoveAnyPin: true,
          canInviteUsers: true,
          canEditFolder: true,
          canDeleteFolder: true,
          canRemoveUsers: true,
        },
      };
    }
    
    // Check if collaborator
    const collaborator = await (db as any)
      .query("folder_collaborators")
      .withIndex("by_folder_user", (q: any) => q.eq("folderId", folderId).eq("userId", userId))
      .first();
    
    if (!collaborator || (collaborator as any).status !== "active") {
      return null;
    }
    
    return {
      role: "collaborator",
      permissions: {
        canAddPins: true,
        canRemovePins: true,
        canRemoveAnyPin: false,
        canInviteUsers: false,
        canEditFolder: false,
        canDeleteFolder: false,
        canRemoveUsers: false,
      },
    };
  },
});

export const acceptInvitation = mutation({
  args: { folderId: v.id("folders"), userId: v.id("users") },
  returns: v.boolean(),
  handler: async ({ db }, { folderId, userId }) => {
    const collaborator = await (db as any)
      .query("folder_collaborators")
      .withIndex("by_folder_user", (q: any) => q.eq("folderId", folderId).eq("userId", userId))
      .first();
    
    if (!collaborator || (collaborator as any).status !== "invited") {
      return false;
    }
    
    await db.patch(collaborator._id, {
      status: "active",
    } as any);
    
    // Increment collaboratorsCount
    const folder = await db.get(folderId);
    if (folder) {
      await db.patch(folderId, {
        collaboratorsCount: ((folder as any).collaboratorsCount || 0) + 1,
      } as any);
    }
    
    return true;
  },
});

export const savePin = mutation({
  args: {
    userId: v.id("users"),
    pinId: v.id("pins"),
    folderId: v.id("folders"),
  },
  returns: savedPinDoc,
  handler: async ({ db }, { userId, pinId, folderId }) => {
    // Check if already saved
    const existing = await (db as any)
      .query("saved_pins")
      .withIndex("by_user_pin_folder", (q: any) => q.eq("userId", userId).eq("pinId", pinId).eq("folderId", folderId))
      .first();
    
    if (existing) {
      throw new Error("Кейс уже сохранен в эту папку");
    }
    
    const now = new Date().toISOString();
    const id = await db.insert("saved_pins", {
      userId,
      pinId,
      folderId,
      savedAt: now,
    } as any);
    
    // Increment postsCount
    const folder = await db.get(folderId);
    if (folder) {
      await db.patch(folderId, {
        postsCount: ((folder as any).postsCount || 0) + 1,
      } as any);
    }
    
    return (await db.get(id))!;
  },
});

export const removePin = mutation({
  args: {
    userId: v.id("users"),
    pinId: v.id("pins"),
    folderId: v.id("folders"),
  },
  returns: v.boolean(),
  handler: async ({ db }, { userId, pinId, folderId }) => {
    const savedPin = await (db as any)
      .query("saved_pins")
      .withIndex("by_user_pin_folder", (q: any) => q.eq("userId", userId).eq("pinId", pinId).eq("folderId", folderId))
      .first();
    
    if (!savedPin) {
      throw new Error("Кейс не найден в папке");
    }
    
    // Check access (can remove own pin or any if owner)
    const folder = await db.get(folderId);
    if (!folder) throw new Error("Папка не найдена");
    
    const isOwner = (folder as any).ownerId === userId;
    const isOwnPin = (savedPin as any).userId === userId;
    
    if (!isOwnPin && !isOwner) {
      throw new Error("Нет прав для удаления этого кейса");
    }
    
    await db.delete(savedPin._id);
    
    // Decrement postsCount
    if (folder) {
      await db.patch(folderId, {
        postsCount: Math.max(0, ((folder as any).postsCount || 0) - 1),
      } as any);
    }
    
    return true;
  },
});

export const getFolderPins = query({
  args: {
    folderId: v.id("folders"),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(v.object({
      ...savedPinFields,
      _id: v.id("saved_pins"),
      _creationTime: v.number(),
      pin: v.optional(v.any()),
      commentsCount: v.optional(v.number()),
    })),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { folderId, page = 1, limit = 20 }) => {
    const allSavedPins = await (db as any)
      .query("saved_pins")
      .withIndex("by_folder_saved", (q: any) => q.eq("folderId", folderId))
      .collect();
    
    // Sort by savedAt descending
    allSavedPins.sort((a: any, b: any) => b.savedAt.localeCompare(a.savedAt));
    
    // Get pin details and comments count
    const itemsWithDetails = await Promise.all(
      allSavedPins.map(async (savedPin: any) => {
        let pin = null;
        let commentsCount = 0;
        
        try {
          pin = await db.get(savedPin.pinId as any);
          
          // Count comments for this pin
          const comments = await (db as any)
            .query("pin_comments")
            .withIndex("by_pin_created", (q: any) => q.eq("pinId", savedPin.pinId))
            .collect();
          
          commentsCount = comments.length;
        } catch {}
        
        return {
          ...savedPin,
          pin,
          commentsCount,
        };
      })
    );
    
    const total = itemsWithDetails.length;
    const from = (page - 1) * limit;
    const items = itemsWithDetails.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    
    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const getCollaborators = query({
  args: { folderId: v.id("folders") },
  returns: v.array(folderCollaboratorDoc),
  handler: async ({ db }, { folderId }) => {
    return await (db as any)
      .query("folder_collaborators")
      .withIndex("by_folder_user", (q: any) => q.eq("folderId", folderId))
      .collect()
      .then((collabs: any[]) => collabs.filter((c: any) => c.status === "active"));
  },
});

export const checkPinSaved = query({
  args: {
    pinId: v.id("pins"),
    folderId: v.id("folders"),
  },
  returns: v.boolean(),
  handler: async ({ db }, { pinId, folderId }) => {
    const existing = await (db as any)
      .query("saved_pins")
      .withIndex("by_folder_pin", (q: any) => q.eq("folderId", folderId).eq("pinId", pinId))
      .first();
    return !!existing;
  },
});

export const getSavedPinsByPinId = query({
  args: { pinId: v.id("pins") },
  returns: v.array(savedPinDoc),
  handler: async ({ db }, { pinId }) => {
    const all = await (db as any)
      .query("saved_pins")
      .withIndex("by_folder_pin", (q: any) => q.eq("pinId", pinId))
      .collect();
    return all;
  },
});

export const removePinFromAllFolders = mutation({
  args: { pinId: v.id("pins") },
  returns: v.number(),
  handler: async ({ db }, { pinId }) => {
    // Get all saved pins for this pin
    const savedPins = await (db as any)
      .query("saved_pins")
      .withIndex("by_folder_pin", (q: any) => q.eq("pinId", pinId))
      .collect();
    
    if (savedPins.length === 0) {
      return 0;
    }
    
    // Group by folders
    const folderIds = [...new Set(savedPins.map((sp: any) => sp.folderId))];
    
    // Delete all saved pins
    for (const savedPin of savedPins) {
      await db.delete(savedPin._id);
    }
    
    // Decrement postsCount for affected folders
    for (const folderId of folderIds) {
      const folder = await db.get(folderId as any);
      if (folder) {
        const count = savedPins.filter((sp: any) => String(sp.folderId) === String(folderId)).length;
        await db.patch(folderId as any, {
          postsCount: Math.max(0, ((folder as any).postsCount || 0) - count),
        } as any);
      }
    }
    
    return savedPins.length;
  },
});

export const getFolderStats = query({
  args: { folderId: v.id("folders") },
  returns: v.object({
    pinsCount: v.number(),
    authorsCount: v.number(),
    firstThreePinsImages: v.array(v.string()),
  }),
  handler: async ({ db }, { folderId }) => {
    const allSavedPins = await (db as any)
      .query("saved_pins")
      .withIndex("by_folder_saved", (q: any) => q.eq("folderId", folderId))
      .collect();
    
    // Sort by savedAt descending
    allSavedPins.sort((a: any, b: any) => b.savedAt.localeCompare(a.savedAt));
    
    // Get pin details
    const pinsWithDetails = await Promise.all(
      allSavedPins.map(async (savedPin: any) => {
        try {
          const pin = await db.get(savedPin.pinId as any);
          return {
            image: pin ? (pin as any).image : null,
            author: pin ? (pin as any).author : null,
          };
        } catch {
          return { image: null, author: null };
        }
      })
    );
    
    const pinsCount = pinsWithDetails.length;
    
    // Count unique authors
    const uniqueAuthors = new Set<string>();
    pinsWithDetails.forEach((item) => {
      if (item.author) {
        uniqueAuthors.add(String(item.author));
      }
    });
    const authorsCount = uniqueAuthors.size;
    
    // Get first 3 images
    const firstThreePinsImages = pinsWithDetails
      .slice(0, 3)
      .map((item) => item.image)
      .filter((img): img is string => Boolean(img));
    
    return {
      pinsCount,
      authorsCount,
      firstThreePinsImages,
    };
  },
});

