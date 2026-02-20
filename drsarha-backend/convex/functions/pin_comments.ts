import { mutation, query, internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { pinCommentDoc, pinCommentFields } from "../models/pin";
import { api, internal } from "../_generated/api";

export const listRoot = query({
  args: { pinId: v.string(), page: v.optional(v.number()), limit: v.optional(v.number()), userId: v.optional(v.string()) },
  returns: v.object({ items: v.array(pinCommentDoc), total: v.number(), page: v.number(), totalPages: v.number(), hasMore: v.boolean() }),
  handler: async ({ db }, { pinId, page = 1, limit = 10, userId }) => {
    const bannedUserIds = new Set<string>();
    const reportedCommentIds = new Set<string>();
    if (userId) {
      const bans = await (db as any)
        .query("user_bans")
        .withIndex("by_user_and_created", (q: any) => q.eq("userId", userId))
        .collect();
      for (const ban of bans) {
        bannedUserIds.add(String(ban.bannedUserId));
      }
      const reports = await (db as any)
        .query("pin_comment_reports")
        .withIndex("by_reporter", (q: any) => q.eq("reporter", userId))
        .collect();
      for (const report of reports) {
        reportedCommentIds.add(String(report.commentId));
      }
    }
    let all = await (db as any).query("pin_comments").withIndex("by_pin_created", (q: any) => q.eq("pinId", pinId)).collect();
    all = all.filter((c: any) => !c.parentId);
    if (userId) {
      all = all.filter((c: any) =>
        !bannedUserIds.has(String(c.userId)) && !reportedCommentIds.has(String(c._id)),
      );
    }
    all.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
    const total = all.length; const from = (page - 1) * limit; const items = all.slice(from, from + limit); const totalPages = Math.ceil(total / limit) || 1; return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const add = mutation({
  args: { pinId: v.string(), userId: v.string(), content: v.string() },
  returns: pinCommentDoc,
  handler: async (ctx, { pinId, userId, content }) => {
    const now = new Date().toISOString();
    const id = await ctx.db.insert("pin_comments", { pinId, userId, content, likes: [], createdAt: now, updatedAt: now } as any);
    const created = (await ctx.db.get(id))!;
    
    // inc comments on pin
    const pin = await (ctx.db as any).query("pins").filter((q: any) => q.eq(q.field("_id"), pinId)).unique();
    if (pin) await ctx.db.patch(pin._id, { comments: (pin.comments || 0) + 1, updatedAt: now } as any);
    
    // Update task progress for create_comment
    try {
      await ctx.runMutation(internal.functions.progress.updateActionProgress, {
        userId: userId as any,
        actionType: "create_comment" as const,
        amount: 1,
      });
    } catch (error) {
      console.error("Error updating task progress for create_comment:", error);
    }
    
    // Create notification for pin author (if not self-comment)
    try {
      if (pin && String(pin.author) !== userId) {
        const user = await ctx.runQuery(api.functions.users.getById, { id: userId as any });
        if (user) {
          // Truncate comment text to 100 characters
          const truncatedComment = content.length > 100 ? content.substring(0, 100) + '...' : content;
          await ctx.runMutation(internal.functions.notifications.createInternal, {
            userId: pin.author as any,
            type: "Comment",
            isViewed: false,
            data: {
              fromUserId: userId as any,
              fromUserName: (user as any)?.fullName || (user as any)?.email || "Пользователь",
              pinId: pinId,
              pinTitle: (pin as any).title,
              commentId: id as any,
              commentText: truncatedComment,
            },
            createdAt: now,
            updatedAt: now,
            mongoId: "",
          } as any);
        }
      }
    } catch (error) {
      console.error("Error creating comment notification:", error);
    }
    
    return created;
  },
});

export const getById = query({ args: { id: v.id("pin_comments") }, returns: v.union(pinCommentDoc, v.null()), handler: async ({ db }, { id }) => db.get(id) });

export const update = mutation({ args: { id: v.id("pin_comments"), content: v.string() }, returns: pinCommentDoc, handler: async ({ db }, { id, content }) => { await db.patch(id, { content, updatedAt: new Date().toISOString() } as any); return (await db.get(id))!; } });

export const remove = mutation({
  args: { id: v.id("pin_comments") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    const c = await db.get(id);
    if (!c) return false;

    const replies = await (db as any)
      .query("pin_comments")
      .withIndex("by_parent", (q: any) => q.eq("parentId", id))
      .collect();
    for (const reply of replies) {
      await db.delete(reply._id);
    }

    await db.delete(id);

    const pin = await (db as any).query("pins").filter((q: any) => q.eq(q.field("_id"), c.pinId)).unique();
    if (pin) {
      const decrement = 1 + replies.length;
      await db.patch(pin._id, { comments: Math.max(0, (pin.comments || 0) - decrement) } as any);
    }
    return true;
  },
});

export const like = mutation({ args: { id: v.id("pin_comments"), userId: v.string() }, returns: v.null(), handler: async ({ db }, { id, userId }) => { const c = await db.get(id); if (!c) throw new Error("Not found"); if (!(c as any).likes.includes(userId)) await db.patch(id, { likes: ([...(c as any).likes, userId]) as any } as any); return null; } });

export const unlike = mutation({ args: { id: v.id("pin_comments"), userId: v.string() }, returns: v.null(), handler: async ({ db }, { id, userId }) => { const c = await db.get(id); if (!c) throw new Error("Not found"); await db.patch(id, { likes: ((c as any).likes as Array<string>).filter((u) => u !== userId) as any } as any); return null; } });

// Functions for clinic_atlas comments
export const getAllByClinicAtlas = query({
  args: {
    clinicAtlasId: v.string(),
    userId: v.optional(v.string()),
    viewerId: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(pinCommentDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { clinicAtlasId, userId, viewerId, page = 1, limit = 10 }) => {
    const bannedUserIds = new Set<string>();
    const reportedCommentIds = new Set<string>();
    if (viewerId) {
      const bans = await (db as any)
        .query("user_bans")
        .withIndex("by_user_and_created", (q: any) => q.eq("userId", viewerId))
        .collect();
      for (const ban of bans) {
        bannedUserIds.add(String(ban.bannedUserId));
      }
      const reports = await (db as any)
        .query("pin_comment_reports")
        .withIndex("by_reporter", (q: any) => q.eq("reporter", viewerId))
        .collect();
      for (const report of reports) {
        reportedCommentIds.add(String(report.commentId));
      }
    }
    let all = await (db as any)
      .query("pin_comments")
      .withIndex("by_clinic_atlas", (q: any) => q.eq("clinicAtlasId", clinicAtlasId))
      .collect();
    
    // Filter by userId if provided
    if (userId) {
      all = all.filter((c: any) => c.userId === userId);
    }
    
    // Return only root comments (without parentId)
    all = all.filter((c: any) => !c.parentId);
    if (viewerId) {
      all = all.filter((c: any) =>
        !bannedUserIds.has(String(c.userId)) && !reportedCommentIds.has(String(c._id)),
      );
    }
    
    // Sort by createdAt descending
    all.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
    
    const total = all.length;
    const from = (page - 1) * limit;
    const items = all.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    
    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const createForClinicAtlas = mutation({
  args: {
    content: v.string(),
    userId: v.string(),
    clinicAtlasId: v.string(),
    parentId: v.optional(v.string()),
  },
  returns: pinCommentDoc,
  handler: async (ctx, { content, userId, clinicAtlasId, parentId }) => {
    // Get user fullName
    let userFullName = '';
    try {
      const user = await ctx.runQuery(api.functions.users.getById, { id: userId as any });
      userFullName = (user as any)?.fullName || '';
    } catch {}
    
    // If parentId provided, get pinId from parent
    let pinId: string | undefined;
    if (parentId) {
      try {
        const parent = await ctx.db.get(parentId as any);
        pinId = (parent as any)?.pinId;
      } catch {}
    }
    
    const now = new Date().toISOString();
    const id = await ctx.db.insert("pin_comments", {
      content,
      userId,
      userFullName,
      clinicAtlasId,
      pinId,
      likes: [],
      createdAt: now,
      updatedAt: now,
      parentId: parentId ? parentId as any : undefined,
    } as any);
    
    return (await ctx.db.get(id))!;
  },
});

export const createReply = mutation({
  args: {
    replyToCommentId: v.id("pin_comments"),
    content: v.string(),
    userId: v.string(),
    clinicAtlasId: v.string(),
  },
  returns: pinCommentDoc,
  handler: async (ctx, { replyToCommentId, content, userId, clinicAtlasId }) => {
    // Get the comment we're replying to
    const replyTo = await ctx.db.get(replyToCommentId);
    if (!replyTo) throw new Error('Комментарий, на который отвечают, не найден');
    
    // Find root parentId
    const rootParentId = (replyTo as any).parentId ? (replyTo as any).parentId : replyToCommentId;
    
    // Get user info for responseToUser
    let responseToUserFullName = '';
    try {
      const respondedUser = await ctx.runQuery(api.functions.users.getById, { id: (replyTo as any).userId as any });
      responseToUserFullName = (respondedUser as any)?.fullName || '';
    } catch {}
    
    // Get author fullName
    let authorFullName = '';
    try {
      const author = await ctx.runQuery(api.functions.users.getById, { id: userId as any });
      authorFullName = (author as any)?.fullName || '';
    } catch {}
    
    const now = new Date().toISOString();
    const id = await ctx.db.insert("pin_comments", {
      content,
      userId,
      userFullName: authorFullName,
      clinicAtlasId,
      pinId: (replyTo as any).pinId || undefined,
      likes: [],
      createdAt: now,
      updatedAt: now,
      parentId: rootParentId as any,
      responseToUser: {
        id: (replyTo as any).userId,
        fullName: responseToUserFullName,
      },
    } as any);
    
    return (await ctx.db.get(id))!;
  },
});

export const getThread = query({
  args: {
    parentId: v.id("pin_comments"),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    userId: v.optional(v.string()),
  },
  returns: v.object({
    items: v.array(pinCommentDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { parentId, page = 1, limit = 20, userId }) => {
    const bannedUserIds = new Set<string>();
    const reportedCommentIds = new Set<string>();
    if (userId) {
      const bans = await (db as any)
        .query("user_bans")
        .withIndex("by_user_and_created", (q: any) => q.eq("userId", userId))
        .collect();
      for (const ban of bans) {
        bannedUserIds.add(String(ban.bannedUserId));
      }
      const reports = await (db as any)
        .query("pin_comment_reports")
        .withIndex("by_reporter", (q: any) => q.eq("reporter", userId))
        .collect();
      for (const report of reports) {
        reportedCommentIds.add(String(report.commentId));
      }
    }
    let all = await (db as any)
      .query("pin_comments")
      .withIndex("by_parent", (q: any) => q.eq("parentId", parentId))
      .collect();
    if (userId) {
      all = all.filter((c: any) =>
        !bannedUserIds.has(String(c.userId)) && !reportedCommentIds.has(String(c._id)),
      );
    }
    
    // Sort by createdAt ascending (oldest first)
    all.sort((a: any, b: any) => a.createdAt.localeCompare(b.createdAt));
    
    const total = all.length;
    const from = (page - 1) * limit;
    const items = all.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    
    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const addLikeClinicAtlas = mutation({
  args: { id: v.id("pin_comments"), userId: v.string() },
  returns: v.null(),
  handler: async ({ db }, { id, userId }) => {
    const c = await db.get(id);
    if (!c) throw new Error("Not found");
    const likes = (c as any).likes || [];
    if (!likes.includes(userId)) {
      await db.patch(id, { likes: [...likes, userId] as any } as any);
    }
    return null;
  },
});

export const rating = query({
  args: {},
  returns: v.array(
    v.object({
      userId: v.union(v.id("users"), v.string()),
      commentsCount: v.number(),
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
    const allComments = await (db as any).query("pin_comments").collect();
    const allUsers = await (db as any).query("users").collect();
    const usersById = new Map<string, any>(allUsers.map((u: any) => [String(u._id), u]));

    const commentsByUserId = new Map<string, { userId: any; commentsCount: number }>();
    for (const comment of allComments) {
      const key = String(comment.userId);
      const current = commentsByUserId.get(key);
      if (current) {
        current.commentsCount += 1;
      } else {
        commentsByUserId.set(key, { userId: comment.userId, commentsCount: 1 });
      }
    }

    return Array.from(commentsByUserId.values())
      .sort((a, b) => b.commentsCount - a.commentsCount)
      .slice(0, 20)
      .map((row) => {
        const user = usersById.get(String(row.userId));
        const optionalString = (value: unknown) =>
          typeof value === "string" ? value : undefined;
        return {
          userId: row.userId,
          commentsCount: row.commentsCount,
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

export const removeLikeClinicAtlas = mutation({
  args: { id: v.id("pin_comments"), userId: v.string() },
  returns: v.null(),
  handler: async ({ db }, { id, userId }) => {
    const c = await db.get(id);
    if (!c) throw new Error("Not found");
    const likes = ((c as any).likes as Array<string>).filter((u) => u !== userId);
    await db.patch(id, { likes: likes as any } as any);
    return null;
  },
});
