import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";

export const add = mutation({
  args: { pinId: v.string(), userId: v.string() },
  returns: v.null(),
  handler: async (ctx, { pinId, userId }) => {
    const existing = await (ctx.db as any)
      .query("pin_likes")
      .withIndex("by_pin_user", (q: any) => q.eq("pinId", pinId).eq("userId", userId))
      .unique();
    if (existing) throw new Error("Already liked");
    await ctx.db.insert("pin_likes", { pinId, userId, createdAt: new Date().toISOString() } as any);
    // inc likes on pin
    const pin = await (ctx.db as any).query("pins").filter((q: any) => q.eq(q.field("_id"), pinId)).unique();
    if (pin) await ctx.db.patch(pin._id, { likes: (pin.likes || 0) + 1 } as any);
    
    // Update task progress for like_pin
    try {
      
      await ctx.runMutation(internal.functions.progress.updateActionProgress, {
        userId: userId as any,
        actionType: "like_pin" as const,
        amount: 1,
      });
    } catch (error) {
      console.error("Error updating task progress for like_pin:", error);
    }
    
    // Create notification for pin author (if not self-like)
    try {
      if (pin && String(pin.author) !== userId) {
        const user = await ctx.runQuery(api.functions.users.getById, { id: userId as any });
        if (user) {
          const now = new Date().toISOString();
          await ctx.runMutation(internal.functions.notifications.createInternal, {
            userId: pin.author as any,
            type: "Like",
            isViewed: false,
            data: {
              fromUserId: userId as any,
              fromUserName: (user as any)?.fullName || (user as any)?.email || "Пользователь",
              pinId: pinId,
              pinTitle: (pin as any).title,
            },
            createdAt: now,
            updatedAt: now,
            mongoId: "",
          } as any);
        }
      }
    } catch (error) {
      console.error("Error creating like notification:", error);
    }
    
    return null;
  },
});

export const remove = mutation({
  args: { pinId: v.string(), userId: v.string() },
  returns: v.null(),
  handler: async ({ db }, { pinId, userId }) => {
    const existing = await (db as any)
      .query("pin_likes")
      .withIndex("by_pin_user", (q: any) => q.eq("pinId", pinId).eq("userId", userId))
      .unique();
    if (!existing) throw new Error("Like not found");
    await db.delete(existing._id);
    const pin = await (db as any).query("pins").filter((q: any) => q.eq(q.field("_id"), pinId)).unique();
    if (pin) await db.patch(pin._id, { likes: Math.max(0, (pin.likes || 0) - 1) } as any);
    return null;
  },
});

export const rating = query({
  args: {},
  returns: v.array(
    v.object({
      pin: v.object({
        _id: v.id("pins"),
        _creationTime: v.number(),
        title: v.string(),
        description: v.string(),
        image: v.string(),
        author: v.union(v.id("users"), v.string()),
        tags: v.optional(v.array(v.union(v.id("pin_tags"), v.string()))),
        likes: v.number(),
        comments: v.number(),
        createdAt: v.string(),
        updatedAt: v.string(),
        mongoId: v.optional(v.string()),
      }),
      likesCount: v.number(),
      author: v.union(
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
    const allLikes = await (db as any).query("pin_likes").collect();
    const allPins = await (db as any).query("pins").collect();
    const allUsers = await (db as any).query("users").collect();

    const pinsById = new Map<string, any>(allPins.map((p: any) => [String(p._id), p]));
    const usersById = new Map<string, any>(allUsers.map((u: any) => [String(u._id), u]));

    const likesByPinId = new Map<string, number>();
    for (const like of allLikes) {
      const key = String(like.pinId);
      likesByPinId.set(key, (likesByPinId.get(key) ?? 0) + 1);
    }

    return Array.from(likesByPinId.entries())
      .map(([pinId, likesCount]) => ({ pin: pinsById.get(pinId), likesCount }))
      .filter((row) => !!row.pin)
      .sort((a, b) => b.likesCount - a.likesCount)
      .slice(0, 20)
      .map((row: any) => {
        const author = usersById.get(String(row.pin.author));
        return {
          pin: row.pin,
          likesCount: row.likesCount,
          author: author
            ? {
                _id: author._id,
                fullName: author.fullName,
                email: author.email,
                avatar: author.avatar,
              }
            : null,
        };
      });
  },
});

export const getUserLikesForPins = query({
  args: { userId: v.string(), pinIds: v.array(v.string()) },
  returns: v.array(v.string()),
  handler: async ({ db }, { userId, pinIds }) => {
    const result: Array<string> = [];
    for (const pinId of pinIds) {
      const like = await (db as any)
        .query("pin_likes")
        .withIndex("by_pin_user", (q: any) => q.eq("pinId", pinId).eq("userId", userId))
        .unique();
      if (like) result.push(pinId);
    }
    return result;
  },
});


