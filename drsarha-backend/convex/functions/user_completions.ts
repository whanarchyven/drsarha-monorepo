import { query, mutation, internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { userCompletionDoc, userCompletionFields } from "../models/userCompletion";
import { internal } from "../_generated/api";
const feedbackItem = v.object({
  analytic_questions: v.optional(v.array(v.string())),
  answers: v.array(v.object({ answer: v.string(), is_correct: v.boolean() })),
  has_correct: v.boolean(),
  question: v.string(),
  user_answers: v.optional(v.union(v.string(), v.array(v.string()))),
});
const feedbackEntry = v.object({ created_at: v.string(), feedback: v.array(feedbackItem) });

export const create = mutation({
  args: v.object({ user_id: v.string(), knowledge_id: v.string(), type: v.string() }),
  returns: userCompletionDoc,
  handler: async ({ db }, { user_id, knowledge_id, type }) => {
    const now = new Date().toISOString();
    const id = await db.insert("user_completions", {
      user_id,
      knowledge_id,
      type,
      created_at: now,
      updated_at: now,
      is_completed: false,
      completed_at: null,
      metadata: null,
      feedback: [],
    } as any);
    return (await db.get(id))!;
  },
});

export const getById = query({ args: { id: v.id("user_completions") }, returns: v.union(userCompletionDoc, v.null()), handler: async ({ db }, { id }) => db.get(id) });

export const getByUserAndKnowledge = query({ args: { user_id: v.string(), knowledge_id: v.string() }, returns: v.union(userCompletionDoc, v.null()), handler: async ({ db }, { user_id, knowledge_id }) => { const hit = await (db as any).query("user_completions").withIndex("by_user_knowledge", (q: any) => q.eq("user_id", user_id).eq("knowledge_id", knowledge_id)).first(); return hit ?? null; } });

export const setCompleted = mutation({ args: { id: v.id("user_completions") }, returns: userCompletionDoc, handler: async ({ db }, { id }) => { const now = new Date().toISOString(); await db.patch(id, { is_completed: true, completed_at: now, updated_at: now } as any); return (await db.get(id))!; } });

// Public: Complete user completion with rewards (stars, exp, notifications, task progress)
export const complete = mutation({
  args: { id: v.id("user_completions") },
  returns: v.object({ 
    success: v.boolean(), 
    message: v.string(),
    starsTransaction: v.optional(v.any())
  }),
  handler: async (ctx, { id }) => {
    return await ctx.runMutation(internal.functions.user_completions.completeWithRewards, { id });
  }
});

export const setMetadata = mutation({ args: { id: v.id("user_completions"), metadata: userCompletionFields.metadata }, returns: userCompletionDoc, handler: async ({ db }, { id, metadata }) => { await db.patch(id, { metadata, updated_at: new Date().toISOString() } as any); return (await db.get(id))!; } });

export const pushFeedback = mutation({ args: { id: v.id("user_completions"), feedbackItem: feedbackEntry }, returns: userCompletionDoc, handler: async ({ db }, { id, feedbackItem }) => { const row: any = await db.get(id); const list: Array<any> = row?.feedback ?? []; list.push(feedbackItem); await db.patch(id, { feedback: list, updated_at: new Date().toISOString() } as any); return (await db.get(id))!; } });

export const getUserIdsByKnowledgeId = query({
  args: { knowledge_id: v.string() },
  returns: v.array(v.string()),
  handler: async ({ db }, { knowledge_id }) => {
    const all = await (db as any).query("user_completions").collect();
    const filtered = all.filter((c: any) => c.knowledge_id === knowledge_id && c.is_completed === true);
    return filtered.map((c: any) => c.user_id);
  },
});

// Get completion metadata by user_id and knowledge_id (for Python backend compatibility)
export const getCompletionMetadata = query({
  args: { user_id: v.string(), knowledge_id: v.string() },
  returns: v.object({
    metadata: v.any(),
  }),
  handler: async ({ db }, { user_id, knowledge_id }) => {
    try {
      const completion = await (db as any)
        .query("user_completions")
        .withIndex("by_user_knowledge", (q: any) => q.eq("user_id", user_id).eq("knowledge_id", knowledge_id))
        .first();
      if (!completion) {
        return { metadata: null };
      }
      return { metadata: (completion as any).metadata || null };
    } catch (e) {
      return { metadata: null };
    }
  },
});

// Internal: get knowledge by type and id
export const fetchKnowledgeByType = internalQuery({
  args: { type: v.string(), id: v.union(v.id("lections"), v.id("clinic_tasks"), v.id("interactive_tasks"), v.id("interactive_quizzes"), v.id("interactive_matches"), v.id("brochures"), v.id("clinic_atlases_test"), v.string()) },
  returns: v.any(),
  handler: async ({ db }, { type, id }) => {
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
      case "brochure":
        return await db.get(id as any);
      case "clinic_atlas":
        return await db.get(id as any);
      default:
        return null;
    }
  }
});

// Get novelty materials - 2 latest from each collection that user hasn't completed
export const getNovelty = query({
  args: {
    user_id: v.string(),
  },
  returns: v.array(v.any()),
  handler: async ({ db }, { user_id }) => {
    // Helper function to get nozology name
    const getNozologyName = async (nozology: any): Promise<string | null> => {
      if (!nozology) return null;
      try {
        // If it's a string, try to get by id first (Convex ids are strings)
        if (typeof nozology === "string") {
          // Try to get document by id - if it exists, it's an id, otherwise it's a name string
          const nozologyDoc = await db.get(nozology as any);
          if (nozologyDoc) {
            // It's a valid id, return the name
            return (nozologyDoc as any).name || null;
          }
          // If db.get returns null, it might be an invalid id or a name string
          // In Convex, invalid ids don't throw, they return null
          // So we treat it as a name string
          return nozology;
        }
        return null;
      } catch {
        return null;
      }
    };

    // Helper function to check if user has completion for a material
    const hasCompletion = async (knowledgeId: string, type: string): Promise<boolean> => {
      try {
        const completion = await (db as any)
          .query("user_completions")
          .withIndex("by_user_knowledge", (q: any) => 
            q.eq("user_id", user_id).eq("knowledge_id", knowledgeId)
          )
          .first();
        
        // Check if completion exists and type matches
        if (completion && (completion as any).type === type) {
          return true;
        }
        return false;
      } catch {
        return false;
      }
    };

    // Helper function to sort by created_at or _creationTime
    const sortByDate = (items: any[]): any[] => {
      return items.sort((a, b) => {
        const dateA = (a as any).created_at 
          ? new Date((a as any).created_at).getTime() 
          : (a as any)._creationTime || 0;
        const dateB = (b as any).created_at 
          ? new Date((b as any).created_at).getTime() 
          : (b as any)._creationTime || 0;
        return dateB - dateA; // Descending order (newest first)
      });
    };

    // Get all lections and filter by user completions
    const allLections = await db.query("lections").collect();
    const sortedLections = sortByDate(allLections);
    const filteredLections: any[] = [];
    for (const lection of sortedLections) {
      if (filteredLections.length >= 2) break;
      const knowledgeId = String((lection as any)._id);
      const hasComp = await hasCompletion(knowledgeId, "lection");
      if (!hasComp) {
        filteredLections.push(lection);
      }
    }

    // Get all interactive_tasks and filter by user completions
    const allInteractiveTasks = await db.query("interactive_tasks").collect();
    const sortedInteractiveTasks = sortByDate(allInteractiveTasks);
    const filteredInteractiveTasks: any[] = [];
    for (const task of sortedInteractiveTasks) {
      if (filteredInteractiveTasks.length >= 2) break;
      const knowledgeId = String((task as any)._id);
      const hasComp = await hasCompletion(knowledgeId, "interactive_task");
      if (!hasComp) {
        filteredInteractiveTasks.push(task);
      }
    }

    // Get all interactive_matches and filter by user completions
    const allInteractiveMatches = await db.query("interactive_matches").collect();
    const sortedInteractiveMatches = sortByDate(allInteractiveMatches);
    const filteredInteractiveMatches: any[] = [];
    for (const match of sortedInteractiveMatches) {
      if (filteredInteractiveMatches.length >= 2) break;
      const knowledgeId = String((match as any)._id);
      const hasComp = await hasCompletion(knowledgeId, "interactive_match");
      if (!hasComp) {
        filteredInteractiveMatches.push(match);
      }
    }

    // Get all interactive_quizzes and filter by user completions
    const allInteractiveQuizzes = await db.query("interactive_quizzes").collect();
    const sortedInteractiveQuizzes = sortByDate(allInteractiveQuizzes);
    const filteredInteractiveQuizzes: any[] = [];
    for (const quiz of sortedInteractiveQuizzes) {
      if (filteredInteractiveQuizzes.length >= 2) break;
      const knowledgeId = String((quiz as any)._id);
      const hasComp = await hasCompletion(knowledgeId, "interactive_quiz");
      if (!hasComp) {
        filteredInteractiveQuizzes.push(quiz);
      }
    }

    // Get all clinic_tasks and filter by user completions
    const allClinicTasks = await db.query("clinic_tasks").collect();
    const sortedClinicTasks = sortByDate(allClinicTasks);
    const filteredClinicTasks: any[] = [];
    for (const clinicTask of sortedClinicTasks) {
      if (filteredClinicTasks.length >= 2) break;
      const knowledgeId = String((clinicTask as any)._id);
      const hasComp = await hasCompletion(knowledgeId, "clinic_task");
      if (!hasComp) {
        filteredClinicTasks.push(clinicTask);
      }
    }

    // Combine all materials
    const allMaterials: any[] = [];

    // Process lections
    for (const lection of filteredLections) {
      const nozologyName = await getNozologyName((lection as any).nozology);
      allMaterials.push({
        type: "lection",
        nozologyName,
        ...lection,
      });
    }

    // Process interactive_tasks
    for (const task of filteredInteractiveTasks) {
      const nozologyName = await getNozologyName((task as any).nozology);
      allMaterials.push({
        type: "interactive_task",
        nozologyName,
        ...task,
      });
    }

    // Process interactive_matches
    for (const match of filteredInteractiveMatches) {
      const nozologyName = await getNozologyName((match as any).nozology);
      allMaterials.push({
        type: "interactive_match",
        nozologyName,
        ...match,
      });
    }

    // Process interactive_quizzes
    for (const quiz of filteredInteractiveQuizzes) {
      const nozologyName = await getNozologyName((quiz as any).nozology);
      allMaterials.push({
        type: "interactive_quiz",
        nozologyName,
        ...quiz,
      });
    }

    // Process clinic_tasks
    for (const clinicTask of filteredClinicTasks) {
      const nozologyName = await getNozologyName((clinicTask as any).nozology);
      allMaterials.push({
        type: "clinic_task",
        nozologyName,
        ...clinicTask,
      });
    }

    // Sort all materials by date again and take first 10
    const sortedAllMaterials = sortByDate(allMaterials);
    return sortedAllMaterials.slice(0, 10);
  },
});

// Internal: Complete user completion with rewards
export const completeWithRewards = internalMutation({
  args: { id: v.id("user_completions") },
  returns: v.object({ 
    success: v.boolean(), 
    message: v.string(),
    starsTransaction: v.optional(v.any())
  }),
  handler: async (ctx, { id }) => {
    const completion = await ctx.db.get(id);
    if (!completion) {
      return { success: false, message: "Данные не найдены" };
    }
    
    if ((completion as any).is_completed) {
      return { success: false, message: "Задание уже выполнено" };
    }

    // Mark as completed
    const now = new Date().toISOString();
    await ctx.db.patch(id, { is_completed: true, completed_at: now, updated_at: now } as any);
    
    // Get knowledge details
    const type = (completion as any).type;
    const knowledgeId = (completion as any).knowledge_id;
    const userId = (completion as any).user_id;
    
    const knowledge = await ctx.runQuery(internal.functions.user_completions.fetchKnowledgeByType, { 
      type, 
      id: knowledgeId as any 
    });
    
    if (!knowledge) {
      return { success: false, message: "Данные не найдены" };
    }

    const stars = (knowledge as any).stars || 0;
    const exp = (knowledge as any).exp || 0;
    
    // Create stars transaction
    const starsTransaction = await ctx.runMutation(internal.functions.transactions.createStarsInternal, {
      user_id: userId,
      stars,
      type: "plus" as const,
      knowledge_id: knowledgeId,
      created_at: now,
    } as any);
    
    // Update user balance
    await ctx.runMutation(internal.functions.users.incInternal, { id: userId as any, stars } as any);
    
    // Create notification for stars
    await ctx.runMutation(internal.functions.notifications.createInternal, {
      userId,
      type: "Transaction",
      isViewed: false,
      data: {
        transactionType: "stars",
        amount: stars,
        operationType: "plus",
        knowledgeId,
        knowledgeName: (knowledge as any).name,
        knowledgeType: type,
      },
      createdAt: now,
      updatedAt: now,
      mongoId: "",
    } as any);

    // If exp exists, create exp transaction
    if (exp > 0) {
      await ctx.runMutation(internal.functions.transactions.createExpInternal, {
        user_id: userId,
        exp,
        type: "plus" as const,
        knowledge_id: knowledgeId,
        created_at: now,
      } as any);
      
      // Update user balance
      await ctx.runMutation(internal.functions.users.incInternal, { id: userId as any, exp } as any);
      
      // Create notification for exp
      await ctx.runMutation(internal.functions.notifications.createInternal, {
        userId,
        type: "Transaction",
        isViewed: false,
        data: {
          transactionType: "exp",
          amount: exp,
          operationType: "plus",
          knowledgeId,
          knowledgeName: (knowledge as any).name,
          knowledgeType: type,
        },
        createdAt: now,
        updatedAt: now,
        mongoId: "",
      } as any);
    }

    // Update task group progress
    const taskGroupServiceResult = await ctx.runMutation(internal.functions.progress.updateKnowledgeProgress, {
      userId: userId as any,
      knowledgeId,
      knowledgeType: type,
    } as any);
    
    const message = exp > 0 
      ? `Получено ${stars} звёзд и ${exp} опыта` 
      : `Получено ${stars} звёзд`;
    
    return { 
      success: true, 
      starsTransaction, 
      message
    };
  }
});

