import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { collaborationRequestDoc, collaborationRequestFields } from "../models/collaborationRequest";
import { api, internal } from "../_generated/api";

export const getById = query({
  args: { id: v.id("collaboration_requests") },
  returns: v.union(collaborationRequestDoc, v.null()),
  handler: async ({ db }, { id }) => {
    return db.get(id);
  },
});

export const createRequest = mutation({
  args: {
    folderId: v.id("folders"),
    inviterId: v.id("users"),
    inviteeId: v.id("users"),
    message: v.optional(v.string()),
    expiresInDays: v.optional(v.number()),
  },
  returns: collaborationRequestDoc,
  handler: async (ctx, { folderId, inviterId, inviteeId, message, expiresInDays = 7 }) => {
    // Check if there's already a pending request
    const existing = await (ctx.db as any)
      .query("collaboration_requests")
      .withIndex("by_folder_invitee", (q: any) => q.eq("folderId", folderId).eq("inviteeId", inviteeId))
      .collect();
    
    const hasPending = existing.some((r: any) => r.status === "pending" && (!r.expiresAt || new Date(r.expiresAt) > new Date()));
    if (hasPending) {
      throw new Error("Пользователь уже приглашен в эту папку");
    }
    
    // Get folder and inviter info
    const folder = await ctx.db.get(folderId);
    const inviter = await ctx.runQuery(api.functions.users.getById, { id: inviterId });
    
    if (!folder || !inviter) {
      throw new Error("Папка или пользователь не найден");
    }
    
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    const id = await ctx.db.insert("collaboration_requests", {
      folderId,
      inviterId,
      inviteeId,
      status: "pending",
      message,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    } as any);
    
    const createdRequest = (await ctx.db.get(id))!;
    
    // Create notification
    try {
      await ctx.runMutation(api.functions.notifications.create, {
        userId: inviteeId,
        type: "CollaborationRequest",
        isViewed: false,
        data: {
          requestId: id,
          fromUserId: inviterId,
          fromUserName: (inviter as any)?.fullName || (inviter as any)?.email || "Пользователь",
          folderId: folderId,
          folderName: (folder as any)?.name,
          message,
        },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        mongoId: undefined,
      } as any);
    } catch (error) {
      console.error("Error creating notification:", error);
    }
    
    // Update task progress for invite_user
    try {
      await ctx.runMutation(internal.functions.progress.updateActionProgress, {
        userId: inviterId,
        actionType: "invite_user" as const,
        amount: 1,
      });
    } catch (error) {
      console.error("Error updating task progress for invite_user:", error);
    }
    
    return createdRequest;
  },
});

export const getUserIncomingRequests = query({
  args: {
    userId: v.id("users"),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(v.object({
      ...collaborationRequestFields,
      _id: v.id("collaboration_requests"),
      _creationTime: v.number(),
      folder: v.optional(v.any()),
      inviter: v.optional(v.any()),
    })),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { userId, page = 1, limit = 10 }) => {
    const all = await (db as any)
      .query("collaboration_requests")
      .withIndex("by_invitee_status", (q: any) => q.eq("inviteeId", userId).eq("status", "pending"))
      .collect();
    
    const now = new Date().toISOString();
    const valid = all.filter((r: any) => !r.expiresAt || r.expiresAt > now);
    
    // Sort by createdAt descending
    valid.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
    
    // Get folder and inviter details
    const itemsWithDetails = await Promise.all(
      valid.map(async (req: any) => {
        let folder = null;
        let inviter = null;
        
        try {
          folder = await db.get(req.folderId as any);
          inviter = await db.get(req.inviterId as any);
          // Remove sensitive fields
          if (inviter) {
            delete (inviter as any).password;
            delete (inviter as any).refreshToken;
          }
        } catch {}
        
        return {
          ...req,
          folder,
          inviter,
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

export const getUserOutgoingRequests = query({
  args: {
    userId: v.id("users"),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(v.object({
      ...collaborationRequestFields,
      _id: v.id("collaboration_requests"),
      _creationTime: v.number(),
      folder: v.optional(v.any()),
      invitee: v.optional(v.any()),
    })),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { userId, page = 1, limit = 10 }) => {
    const all = await (db as any)
      .query("collaboration_requests")
      .withIndex("by_inviter", (q: any) => q.eq("inviterId", userId))
      .collect();
    
    // Sort by createdAt descending
    all.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
    
    // Get folder and invitee details
    const itemsWithDetails = await Promise.all(
      all.map(async (req: any) => {
        let folder = null;
        let invitee = null;
        
        try {
          folder = await db.get(req.folderId as any);
          invitee = await db.get(req.inviteeId as any);
          // Remove sensitive fields
          if (invitee) {
            delete (invitee as any).password;
            delete (invitee as any).refreshToken;
          }
        } catch {}
        
        return {
          ...req,
          folder,
          invitee,
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

export const acceptRequest = mutation({
  args: {
    requestId: v.id("collaboration_requests"),
    userId: v.id("users"),
  },
  returns: v.boolean(),
  handler: async (ctx, { requestId, userId }) => {
    const request = await ctx.db.get(requestId);
    if (!request || (request as any).inviteeId !== userId || (request as any).status !== "pending") {
      throw new Error("Приглашение не найдено");
    }
    
    // Check if expired
    if ((request as any).expiresAt && new Date((request as any).expiresAt) < new Date()) {
      await ctx.db.patch(requestId, {
        status: "expired",
        updatedAt: new Date().toISOString(),
      } as any);
      throw new Error("Приглашение истекло");
    }
    
    // Update request status
    await ctx.db.patch(requestId, {
      status: "accepted",
      updatedAt: new Date().toISOString(),
    } as any);
    
    // Add user as collaborator
    const folderId = (request as any).folderId;
    const now = new Date().toISOString();
    await ctx.db.insert("folder_collaborators", {
      folderId: folderId as any,
      userId,
      role: "collaborator",
      joinedAt: now,
      status: "active",
    } as any);
    
    // Increment collaboratorsCount
    const folder = await ctx.db.get(folderId as any);
    if (folder) {
      await ctx.db.patch(folderId as any, {
        collaboratorsCount: ((folder as any).collaboratorsCount || 0) + 1,
      } as any);
    }
    
    // Update notification to mark as finished
    try {
      const allNotifications = await (ctx.db as any).query("notifications").collect();
      const notification = allNotifications.find((n: any) => 
        n.type === "CollaborationRequest" && 
        (n.data as any)?.requestId === requestId
      );
      
      if (notification) {
        await ctx.db.patch(notification._id, {
          data: {
            ...(notification.data as any),
            isFinished: true,
          },
          updatedAt: new Date().toISOString(),
        } as any);
      }
    } catch (error) {
      console.error("Error updating notification:", error);
    }
    
    return true;
  },
});

export const declineRequest = mutation({
  args: {
    requestId: v.id("collaboration_requests"),
    userId: v.id("users"),
  },
  returns: v.boolean(),
  handler: async (ctx, { requestId, userId }) => {
    const request = await ctx.db.get(requestId);
    if (!request || (request as any).inviteeId !== userId || (request as any).status !== "pending") {
      return false;
    }
    
    await ctx.db.patch(requestId, {
      status: "declined",
      updatedAt: new Date().toISOString(),
    } as any);
    
    // Update notification to mark as finished
    try {
      const allNotifications = await (ctx.db as any).query("notifications").collect();
      const notification = allNotifications.find((n: any) => 
        n.type === "CollaborationRequest" && 
        (n.data as any)?.requestId === requestId
      );
      
      if (notification) {
        await ctx.db.patch(notification._id, {
          data: {
            ...(notification.data as any),
            isFinished: true,
          },
          updatedAt: new Date().toISOString(),
        } as any);
      }
    } catch (error) {
      console.error("Error updating notification:", error);
    }
    
    return true;
  },
});

export const revokeRequest = mutation({
  args: {
    requestId: v.id("collaboration_requests"),
    inviterId: v.id("users"),
  },
  returns: v.boolean(),
  handler: async ({ db }, { requestId, inviterId }) => {
    const request = await db.get(requestId);
    if (!request || (request as any).inviterId !== inviterId || (request as any).status !== "pending") {
      return false;
    }
    
    await db.delete(requestId);
    return true;
  },
});

export const cleanupExpiredRequests = mutation({
  args: {},
  returns: v.number(),
  handler: async ({ db }) => {
    const all = await (db as any).query("collaboration_requests").collect();
    const now = new Date().toISOString();
    
    let count = 0;
    for (const req of all) {
      if ((req as any).status === "pending" && (req as any).expiresAt && (req as any).expiresAt < now) {
        await db.patch(req._id, {
          status: "expired",
          updatedAt: now,
        } as any);
        count++;
      }
    }
    
    return count;
  },
});

export const getFolderRequests = query({
  args: {
    folderId: v.id("folders"),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    status: v.optional(v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined"), v.literal("expired"))),
  },
  returns: v.object({
    items: v.array(v.object({
      ...collaborationRequestFields,
      _id: v.id("collaboration_requests"),
      _creationTime: v.number(),
      inviter: v.optional(v.any()),
      invitee: v.optional(v.any()),
    })),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { folderId, page = 1, limit = 10, status }) => {
    let all = await (db as any)
      .query("collaboration_requests")
      .withIndex("by_folder", (q: any) => q.eq("folderId", folderId))
      .collect();
    
    if (status) {
      all = all.filter((r: any) => r.status === status);
    }
    
    // Sort by createdAt descending
    all.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
    
    // Get inviter and invitee details
    const itemsWithDetails = await Promise.all(
      all.map(async (req: any) => {
        let inviter = null;
        let invitee = null;
        
        try {
          inviter = await db.get(req.inviterId as any);
          invitee = await db.get(req.inviteeId as any);
          // Remove sensitive fields
          if (inviter) {
            delete (inviter as any).password;
            delete (inviter as any).refreshToken;
          }
          if (invitee) {
            delete (invitee as any).password;
            delete (invitee as any).refreshToken;
          }
        } catch {}
        
        return {
          ...req,
          inviter,
          invitee,
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

export const getUserRequestsStats = query({
  args: { userId: v.id("users") },
  returns: v.object({
    incoming: v.object({
      total: v.number(),
      pending: v.number(),
    }),
    outgoing: v.object({
      total: v.number(),
      pending: v.number(),
      accepted: v.number(),
      declined: v.number(),
    }),
  }),
  handler: async ({ db }, { userId }) => {
    const incoming = await (db as any)
      .query("collaboration_requests")
      .withIndex("by_invitee_status", (q: any) => q.eq("inviteeId", userId))
      .collect();
    
    const outgoing = await (db as any)
      .query("collaboration_requests")
      .withIndex("by_inviter", (q: any) => q.eq("inviterId", userId))
      .collect();
    
    const incomingTotal = incoming.length;
    const incomingPending = incoming.filter((r: any) => r.status === "pending" && (!r.expiresAt || new Date(r.expiresAt) > new Date())).length;
    
    const outgoingTotal = outgoing.length;
    const outgoingPending = outgoing.filter((r: any) => r.status === "pending").length;
    const outgoingAccepted = outgoing.filter((r: any) => r.status === "accepted").length;
    const outgoingDeclined = outgoing.filter((r: any) => r.status === "declined").length;
    
    return {
      incoming: { total: incomingTotal, pending: incomingPending },
      outgoing: {
        total: outgoingTotal,
        pending: outgoingPending,
        accepted: outgoingAccepted,
        declined: outgoingDeclined,
      },
    };
  },
});


