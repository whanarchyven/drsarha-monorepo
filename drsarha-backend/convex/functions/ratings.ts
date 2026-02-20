import { query } from "../_generated/server";
import { v } from "convex/values";

const userCompletionSummary = v.object({
  completed: v.number(),
  uncompleted: v.number(),
});

const ratingUser = v.any();

const ratingListItem = v.object({
  user: ratingUser,
  userCompletions: userCompletionSummary,
});

const ratingListResponse = v.object({
  items: v.array(ratingListItem),
  total: v.number(),
  page: v.number(),
  totalPages: v.number(),
  hasMore: v.boolean(),
});

const fullCompletionItem = v.object({
  completion: v.any(),
  knowledge: v.object({
    _id: v.string(),
    type: v.string(),
    name: v.optional(v.string()),
    stars: v.optional(v.number()),
  }),
});

const ratingDetailsResponse = v.object({
  user: ratingUser,
  fullCompletions: v.array(fullCompletionItem),
});

const getKnowledgeByType = async (db: any, type: string, id: string) => {
  switch (type) {
    case "lection":
      return await db.get(id as any);
    case "clinic_task":
      return await db.get(id as any);
    case "interactive_task":
      return await db.get(id as any);
    case "interactive_quiz":
      return await db.get(id as any);
    case "interactive_match":
      return await db.get(id as any);
    default:
      return null;
  }
};

export const listUsersWithStats = query({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  returns: ratingListResponse,
  handler: async ({ db }, { page = 1, limit = 15, search }) => {
    const allUsers: any[] = await (db as any).query("users").collect();

    const filtered = search
      ? allUsers.filter((u) => {
          const value = `${u?.name ?? ""} ${u?.fullName ?? ""} ${u?.email ?? ""}`;
          return value.toLowerCase().includes(search.toLowerCase());
        })
      : allUsers;

    const sorted = filtered.sort((a, b) => {
      const aStars = (a as any).stars ?? 0;
      const bStars = (b as any).stars ?? 0;
      return bStars - aStars;
    });

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const end = start + limit;
    const pageItems = sorted.slice(start, end);

    const items = await Promise.all(
      pageItems.map(async (user: any) => {
        const completions: any[] = await (db as any)
          .query("user_completions")
          .withIndex("by_user", (q: any) => q.eq("user_id", String(user._id)))
          .collect();
        const completed = completions.filter((c) => c.is_completed).length;
        const uncompleted = completions.length - completed;
        return {
          user,
          userCompletions: { completed, uncompleted },
        };
      })
    );

    return {
      items,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  },
});

export const getUserDetails = query({
  args: { userId: v.id("users") },
  returns: ratingDetailsResponse,
  handler: async ({ db }, { userId }) => {
    const user = await db.get(userId);
    if (!user) {
      return { user: null, fullCompletions: [] } as any;
    }

    const completions: any[] = await (db as any)
      .query("user_completions")
      .withIndex("by_user", (q: any) => q.eq("user_id", String(user._id)))
      .collect();

    const completedOnly = completions.filter((c) => c.is_completed);

    const fullCompletions = await Promise.all(
      completedOnly.map(async (completion) => {
        const knowledge = await getKnowledgeByType(
          db,
          completion.type,
          completion.knowledge_id
        );
        return {
          completion,
          knowledge: {
            _id: completion.knowledge_id,
            type: completion.type,
            name: (knowledge as any)?.name,
            stars: (knowledge as any)?.stars,
          },
        };
      })
    );

    return {
      user,
      fullCompletions,
    };
  },
});
