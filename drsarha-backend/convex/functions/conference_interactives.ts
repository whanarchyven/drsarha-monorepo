import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import {
  conferenceInteractiveDoc,
  conferenceInteractiveKind,
  conferenceInteractiveQuestion,
  conferenceInteractiveResponseDoc,
} from "../models/conferenceInteractive";

type InteractiveQuestion = {
  id: string;
  image?: string;
  questionText: string;
  variants: Array<{
    id: string;
    text: string;
    isCorrect?: boolean;
  }>;
};

function normalizeQuestions(
  kind: "quiz" | "poll",
  questions: InteractiveQuestion[]
): InteractiveQuestion[] {
  if (!questions.length) {
    throw new Error("Interactive must contain at least one question");
  }

  const seenQuestionIds = new Set<string>();

  return questions.map((question, questionIndex) => {
    const questionId = question.id.trim();
    const questionText = question.questionText.trim();

    if (!questionId) {
      throw new Error(`Question ${questionIndex + 1} must have an id`);
    }
    if (seenQuestionIds.has(questionId)) {
      throw new Error(`Duplicate question id: ${questionId}`);
    }
    seenQuestionIds.add(questionId);

    if (!questionText) {
      throw new Error(`Question ${questionId} must have text`);
    }
    if (!question.variants.length) {
      throw new Error(`Question ${questionId} must have variants`);
    }

    const seenVariantIds = new Set<string>();
    const normalizedVariants = question.variants.map((variant, variantIndex) => {
      const variantId = variant.id.trim();
      const variantText = variant.text.trim();

      if (!variantId) {
        throw new Error(
          `Variant ${variantIndex + 1} in question ${questionId} must have an id`
        );
      }
      if (seenVariantIds.has(variantId)) {
        throw new Error(`Duplicate variant id ${variantId} in question ${questionId}`);
      }
      seenVariantIds.add(variantId);

      if (!variantText) {
        throw new Error(`Variant ${variantId} in question ${questionId} must have text`);
      }

      return {
        id: variantId,
        text: variantText,
        ...(variant.isCorrect !== undefined ? { isCorrect: variant.isCorrect } : {}),
      };
    });

    if (
      kind === "quiz" &&
      normalizedVariants.every((variant) => variant.isCorrect !== true)
    ) {
      throw new Error(`Quiz question ${questionId} must have at least one correct variant`);
    }

    return {
      id: questionId,
      ...(question.image?.trim() ? { image: question.image.trim() } : {}),
      questionText,
      variants: normalizedVariants,
    };
  });
}

function getCorrectVariantIds(question: InteractiveQuestion) {
  return question.variants
    .filter((variant) => variant.isCorrect === true)
    .map((variant) => variant.id)
    .sort();
}

function areEqualStringSets(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  const leftSorted = [...left].sort();
  const rightSorted = [...right].sort();
  return leftSorted.every((value, index) => value === rightSorted[index]);
}

async function getInteractiveOrThrow(db: any, interactiveId: any) {
  const interactive = await db.get(interactiveId);
  if (!interactive) {
    throw new Error("Interactive not found");
  }

  return interactive;
}

async function getConferenceUserOrThrow(db: any, conferenceUserId: any) {
  const conferenceUser = await db.get(conferenceUserId);
  if (!conferenceUser) {
    throw new Error("Conference user not found");
  }

  return conferenceUser;
}

async function disableOtherDisplayedInteractives(db: any, keepId?: any) {
  const displayed = await (db as any)
    .query("conference_interactives")
    .withIndex("by_isDisplayed", (q: any) => q.eq("isDisplayed", true))
    .collect();

  for (const item of displayed) {
    if (keepId && String(item._id) === String(keepId)) {
      continue;
    }

    await db.patch(item._id, {
      isDisplayed: false,
      updatedAt: Date.now(),
    } as any);
  }
}

const interactiveInput = {
  title: v.string(),
  kind: conferenceInteractiveKind,
  showResults: v.boolean(),
  isDisplayed: v.boolean(),
  questions: v.array(conferenceInteractiveQuestion),
};

const interactiveStatsResponse = v.object({
  interactiveId: v.id("conference_interactives"),
  kind: conferenceInteractiveKind,
  totalParticipants: v.number(),
  questionStats: v.array(
    v.object({
      questionId: v.string(),
      questionText: v.string(),
      totalResponses: v.number(),
      variants: v.array(
        v.object({
          variantId: v.string(),
          text: v.string(),
          count: v.number(),
        })
      ),
      correctVariantIds: v.array(v.string()),
    })
  ),
});

export const listInteractives = query({
  args: {
    kind: v.optional(conferenceInteractiveKind),
    isDisplayed: v.optional(v.boolean()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(conferenceInteractiveDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { kind, isDisplayed, page = 1, limit = 20 }) => {
    const from = (page - 1) * limit;
    let items = await (db as any).query("conference_interactives").collect();

    if (kind) {
      items = items.filter((item: any) => item.kind === kind);
    }
    if (isDisplayed !== undefined) {
      items = items.filter((item: any) => item.isDisplayed === isDisplayed);
    }

    items = items.sort((a: any, b: any) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

    const total = items.length;
    return {
      items: items.slice(from, from + limit),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      hasMore: page * limit < total,
    };
  },
});

export const getInteractiveById = query({
  args: { id: v.id("conference_interactives") },
  returns: v.union(conferenceInteractiveDoc, v.null()),
  handler: async ({ db }, { id }) => db.get(id),
});

export const getDisplayedInteractive = query({
  args: {},
  returns: v.union(conferenceInteractiveDoc, v.null()),
  handler: async ({ db }) => {
    const interactive = await (db as any)
      .query("conference_interactives")
      .withIndex("by_isDisplayed", (q: any) => q.eq("isDisplayed", true))
      .first();

    return interactive ?? null;
  },
});

export const createInteractive = mutation({
  args: interactiveInput,
  returns: conferenceInteractiveDoc,
  handler: async ({ db }, { title, kind, showResults, isDisplayed, questions }) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      throw new Error("Interactive title is required");
    }

    const normalizedQuestions = normalizeQuestions(kind, questions as any);
    if (isDisplayed) {
      await disableOtherDisplayedInteractives(db);
    }

    const now = Date.now();
    const id = await db.insert("conference_interactives", {
      title: trimmedTitle,
      kind,
      showResults,
      isDisplayed,
      questions: normalizedQuestions,
      createdAt: now,
      updatedAt: now,
    } as any);

    return (await db.get(id))! as any;
  },
});

export const updateInteractive = mutation({
  args: {
    id: v.id("conference_interactives"),
    data: v.object({
      title: v.optional(v.string()),
      kind: v.optional(conferenceInteractiveKind),
      showResults: v.optional(v.boolean()),
      isDisplayed: v.optional(v.boolean()),
      questions: v.optional(v.array(conferenceInteractiveQuestion)),
    }),
  },
  returns: conferenceInteractiveDoc,
  handler: async ({ db }, { id, data }) => {
    const existing = await getInteractiveOrThrow(db, id);
    const nextKind = data.kind ?? existing.kind;
    const nextQuestions = data.questions
      ? normalizeQuestions(nextKind, data.questions as any)
      : existing.questions;

    if (!data.questions && data.kind && data.kind !== existing.kind) {
      normalizeQuestions(nextKind, existing.questions as any);
    }

    if (data.isDisplayed === true) {
      await disableOtherDisplayedInteractives(db, id);
    }

    const patch: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (data.title !== undefined) {
      const trimmedTitle = data.title.trim();
      if (!trimmedTitle) {
        throw new Error("Interactive title is required");
      }
      patch.title = trimmedTitle;
    }
    if (data.kind !== undefined) patch.kind = data.kind;
    if (data.showResults !== undefined) patch.showResults = data.showResults;
    if (data.isDisplayed !== undefined) patch.isDisplayed = data.isDisplayed;
    if (data.questions !== undefined) patch.questions = nextQuestions;
    if (data.kind !== undefined && data.questions === undefined) {
      patch.questions = nextQuestions;
    }

    await db.patch(id, patch as any);
    return (await db.get(id))! as any;
  },
});

export const deleteInteractive = mutation({
  args: { id: v.id("conference_interactives") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    const responses = await (db as any)
      .query("conference_interactive_responses")
      .withIndex("by_interactive_user", (q: any) => q.eq("interactiveId", id))
      .collect();

    for (const response of responses) {
      await db.delete(response._id);
    }

    await db.delete(id);
    return true;
  },
});

export const setDisplayedInteractive = mutation({
  args: {
    id: v.id("conference_interactives"),
    isDisplayed: v.boolean(),
  },
  returns: conferenceInteractiveDoc,
  handler: async ({ db }, { id, isDisplayed }) => {
    await getInteractiveOrThrow(db, id);

    if (isDisplayed) {
      await disableOtherDisplayedInteractives(db, id);
    }

    await db.patch(id, {
      isDisplayed,
      updatedAt: Date.now(),
    } as any);

    return (await db.get(id))! as any;
  },
});

export const submitResponse = mutation({
  args: {
    interactiveId: v.id("conference_interactives"),
    questionId: v.string(),
    conferenceUserId: v.id("conference_users"),
    selectedVariantIds: v.array(v.string()),
  },
  returns: conferenceInteractiveResponseDoc,
  handler: async (
    { db },
    { interactiveId, questionId, conferenceUserId, selectedVariantIds }
  ) => {
    const interactive = await getInteractiveOrThrow(db, interactiveId);
    await getConferenceUserOrThrow(db, conferenceUserId);

    const trimmedQuestionId = questionId.trim();
    if (!trimmedQuestionId) {
      throw new Error("Question id is required");
    }

    const selectedIds = Array.from(
      new Set(selectedVariantIds.map((variantId) => variantId.trim()).filter(Boolean))
    );
    if (!selectedIds.length) {
      throw new Error("At least one selected variant is required");
    }

    const question = (interactive.questions as InteractiveQuestion[]).find(
      (item) => item.id === trimmedQuestionId
    );
    if (!question) {
      throw new Error("Question not found in interactive");
    }

    const allowedVariantIds = new Set(question.variants.map((variant) => variant.id));
    if (selectedIds.some((variantId) => !allowedVariantIds.has(variantId))) {
      throw new Error("Selected variant does not belong to the question");
    }

    const now = Date.now();
    const existing = await (db as any)
      .query("conference_interactive_responses")
      .withIndex("by_interactive_question_user", (q: any) =>
        q
          .eq("interactiveId", interactiveId)
          .eq("questionId", trimmedQuestionId)
          .eq("conferenceUserId", conferenceUserId)
      )
      .unique();

    const patch: Record<string, unknown> = {
      interactiveId,
      questionId: trimmedQuestionId,
      conferenceUserId,
      selectedVariantIds: selectedIds,
      answeredAt: now,
      updatedAt: now,
    };

    if (interactive.kind === "quiz") {
      patch.isCorrect = areEqualStringSets(selectedIds, getCorrectVariantIds(question));
    }

    if (existing) {
      await db.patch(existing._id, patch as any);
      return (await db.get(existing._id))! as any;
    }

    const id = await db.insert("conference_interactive_responses", patch as any);
    return (await db.get(id))! as any;
  },
});

export const getInteractiveProgress = query({
  args: {
    interactiveId: v.id("conference_interactives"),
    conferenceUserId: v.id("conference_users"),
  },
  returns: v.object({
    interactiveId: v.id("conference_interactives"),
    kind: conferenceInteractiveKind,
    totalQuestions: v.number(),
    answeredQuestions: v.number(),
    correctAnswers: v.union(v.number(), v.null()),
    responses: v.array(
      v.object({
        questionId: v.string(),
        selectedVariantIds: v.array(v.string()),
        isCorrect: v.union(v.boolean(), v.null()),
      })
    ),
  }),
  handler: async ({ db }, { interactiveId, conferenceUserId }) => {
    const interactive = await getInteractiveOrThrow(db, interactiveId);
    const responses = await (db as any)
      .query("conference_interactive_responses")
      .withIndex("by_interactive_user", (q: any) =>
        q.eq("interactiveId", interactiveId).eq("conferenceUserId", conferenceUserId)
      )
      .collect();

    const mappedResponses = responses.map((response: any) => ({
      questionId: response.questionId,
      selectedVariantIds: response.selectedVariantIds,
      isCorrect: response.isCorrect ?? null,
    }));

    return {
      interactiveId,
      kind: interactive.kind,
      totalQuestions: interactive.questions.length,
      answeredQuestions: responses.length,
      correctAnswers:
        interactive.kind === "quiz"
          ? responses.filter((response: any) => response.isCorrect === true).length
          : null,
      responses: mappedResponses,
    };
  },
});

export const getInteractiveStats = query({
  args: {
    interactiveId: v.id("conference_interactives"),
  },
  returns: v.union(interactiveStatsResponse, v.null()),
  handler: async ({ db }, { interactiveId }) => {
    const interactive = await getInteractiveOrThrow(db, interactiveId);
    if (!interactive.showResults) {
      return null;
    }

    const responses = await (db as any)
      .query("conference_interactive_responses")
      .withIndex("by_interactive_user", (q: any) => q.eq("interactiveId", interactiveId))
      .collect();

    const participants = new Set(responses.map((response: any) => String(response.conferenceUserId)));
    const responsesByQuestion = new Map<string, any[]>();

    for (const response of responses) {
      const items = responsesByQuestion.get(response.questionId) ?? [];
      items.push(response);
      responsesByQuestion.set(response.questionId, items);
    }

    return {
      interactiveId,
      kind: interactive.kind,
      totalParticipants: participants.size,
      questionStats: (interactive.questions as InteractiveQuestion[]).map((question) => {
        const questionResponses = responsesByQuestion.get(question.id) ?? [];
        return {
          questionId: question.id,
          questionText: question.questionText,
          totalResponses: questionResponses.length,
          variants: question.variants.map((variant) => ({
            variantId: variant.id,
            text: variant.text,
            count: questionResponses.filter((response) =>
              (response.selectedVariantIds ?? []).includes(variant.id)
            ).length,
          })),
          correctVariantIds:
            interactive.kind === "quiz" ? getCorrectVariantIds(question) : [],
        };
      }),
    };
  },
});

export const getQuizLeaderboard = query({
  args: {
    interactiveId: v.id("conference_interactives"),
  },
  returns: v.array(
    v.object({
      conferenceUserId: v.id("conference_users"),
      name: v.string(),
      side: v.union(v.literal("jedi"), v.literal("sith"), v.literal("ai")),
      score: v.number(),
      answeredQuestions: v.number(),
    })
  ),
  handler: async ({ db }, { interactiveId }) => {
    const interactive = await getInteractiveOrThrow(db, interactiveId);
    if (interactive.kind !== "quiz" || !interactive.showResults) {
      return [];
    }

    const responses = await (db as any)
      .query("conference_interactive_responses")
      .withIndex("by_interactive_user", (q: any) => q.eq("interactiveId", interactiveId))
      .collect();

    const rows = new Map<
      string,
      {
        conferenceUserId: any;
        score: number;
        answeredQuestions: number;
      }
    >();

    for (const response of responses) {
      const key = String(response.conferenceUserId);
      const current = rows.get(key) ?? {
        conferenceUserId: response.conferenceUserId,
        score: 0,
        answeredQuestions: 0,
      };
      current.answeredQuestions += 1;
      if (response.isCorrect === true) {
        current.score += 1;
      }
      rows.set(key, current);
    }

    const leaderboard = [];
    for (const row of rows.values()) {
      const user = await getConferenceUserOrThrow(db, row.conferenceUserId);
      leaderboard.push({
        conferenceUserId: row.conferenceUserId,
        name: user.name,
        side: user.side,
        score: row.score,
        answeredQuestions: row.answeredQuestions,
      });
    }

    return leaderboard.sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if (right.answeredQuestions !== left.answeredQuestions) {
        return right.answeredQuestions - left.answeredQuestions;
      }
      return left.name.localeCompare(right.name);
    });
  },
});
