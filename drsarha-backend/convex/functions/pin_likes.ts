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


