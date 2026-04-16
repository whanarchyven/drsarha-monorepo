import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import {
  pickRandomCheatElement,
  scoreMarkupContours,
  type TaskElementForCheck,
} from "../helpers/markupTaskChecking";
import { markupTaskUserContourValidator } from "../models/userCompletion";

const markupTaskIdValidator = v.union(v.id("markup_tasks"), v.string());
const slideIdValidator = v.union(v.id("markup_task_slides"), v.string());
const elementIdValidator = v.union(v.id("markup_task_elements"), v.string());

const clinicCheckPlaceholderResult = v.object({
  completed: v.boolean(),
  score: v.number(),
  score_percent: v.float64(),
  message: v.string(),
});

const markupCheckResultValidator = v.object({
  completed: v.boolean(),
  score: v.number(),
  score_percent: v.float64(),
  max_score: v.number(),
  guessed_element_ids: v.array(elementIdValidator),
  missed_element_ids: v.array(elementIdValidator),
  ignored_cheat_element_ids: v.array(elementIdValidator),
  completion_id: v.id("user_completions"),
});

const cheatReturnValidator = v.object({
  completion_id: v.id("user_completions"),
  cheat: v.union(
    v.null(),
    v.object({
      element_id: elementIdValidator,
      markup_task_slide_id: slideIdValidator,
      geometry: v.object({
        type: v.string(),
        points: v.array(v.object({ x: v.number(), y: v.number() })),
      }),
      used_at: v.string(),
    })
  ),
  message: v.string(),
});

const createEmptyMarkupTaskMetadata = () => ({
  kind: "markup_task" as const,
  markupStage: {
    completed: false,
    completed_at: null as string | null,
    last_score: 0,
    last_score_percent: 0,
    last_max_score: 0,
    guessed_element_ids: [] as string[],
    cheats: [] as Array<{
      element_id: string;
      markup_task_slide_id: string;
      geometry: {
        type: string;
        points: Array<{ x: number; y: number }>;
      };
      used_at: string;
    }>,
    attempts: [] as Array<{
      created_at: string;
      completed: boolean;
      score: number;
      score_percent: number;
      max_score: number;
      guessed_element_ids: string[];
      missed_element_ids: string[];
      ignored_cheat_element_ids: string[];
      conturs: Array<{
        markup_task_slide_id: string;
        geometry: {
          type: string;
          points: Array<{ x: number; y: number }>;
        };
        use_basis?: boolean;
      }>;
      matches: Array<{
        contour_index: number;
        element_id: string;
        markup_task_slide_id: string;
        use_basis: boolean;
        awarded_score: number;
        overlap_ratio: number;
        area_ratio: number;
      }>;
    }>,
  },
  clinicStage: {
    completed: false,
    completed_at: null as string | null,
    attempts: [] as Array<{
      created_at: string;
      completed: boolean;
      score?: number;
      score_percent?: number;
    }>,
  },
});

type MarkupTaskCompletionState = ReturnType<typeof createEmptyMarkupTaskMetadata>;

const getTaskStructure = async (db: any, markupTaskId: string) => {
  const task = await db.get(markupTaskId as any);
  if (!task) {
    throw new Error("Задача на разметку не найдена");
  }

  const stages = await db
    .query("markup_task_stages")
    .withIndex("by_markup_task", (q: any) => q.eq("markup_task_id", markupTaskId))
    .collect();

  const slides = await Promise.all(
    stages.map((stage: any) =>
      db
        .query("markup_task_slides")
        .withIndex("by_markup_task_stage", (q: any) =>
          q.eq("markup_task_stage_id", stage._id)
        )
        .collect()
    )
  );

  const flatSlides = slides.flat();
  const elements = await Promise.all(
    flatSlides.map((slide: any) =>
      db
        .query("markup_task_elements")
        .withIndex("by_markup_task_slide", (q: any) =>
          q.eq("markup_task_slide_id", slide._id)
        )
        .collect()
    )
  );

  return {
    task,
    slides: flatSlides,
    elements: elements.flat() as TaskElementForCheck[],
  };
};

const getMarkupMetadata = (metadata: unknown): MarkupTaskCompletionState =>
  (
    metadata &&
    typeof metadata === "object" &&
    "kind" in (metadata as Record<string, unknown>) &&
    (metadata as { kind?: string }).kind === "markup_task"
  )
    ? (metadata as MarkupTaskCompletionState)
    : createEmptyMarkupTaskMetadata();

export const checkMarkupStage = mutation({
  args: {
    user_id: v.string(),
    markup_task_id: markupTaskIdValidator,
    conturs: v.array(markupTaskUserContourValidator),
  },
  returns: markupCheckResultValidator,
  handler: async (ctx, args) => {
    const markupTaskId = String(args.markup_task_id);
    const completion = await ctx.runMutation(
      internal.functions.user_completions.ensureMarkupTaskCompletion,
      {
        user_id: args.user_id,
        knowledge_id: markupTaskId,
      }
    );

    const { slides, elements } = await getTaskStructure(ctx.db, markupTaskId);
    const allowedSlideIds = new Set(slides.map((slide: any) => String(slide._id)));
    for (const contour of args.conturs) {
      if (!allowedSlideIds.has(String(contour.markup_task_slide_id))) {
        throw new Error("Передан contour со слайдом, который не принадлежит задаче");
      }
    }

    const currentMetadata = getMarkupMetadata((completion as any).metadata);
    const cheatedElementIds = currentMetadata.markupStage.cheats.map((entry) =>
      String(entry.element_id)
    );
    const scoreResult = scoreMarkupContours({
      conturs: args.conturs.map((contour) => ({
        markup_task_slide_id: String(contour.markup_task_slide_id),
        geometry: contour.geometry,
        use_basis: contour.use_basis,
      })),
      taskElements: elements.map((element: any) => ({
        _id: String(element._id),
        markup_task_slide_id: String(element.markup_task_slide_id),
        geometry: element.geometry,
        basis: element.basis,
        fine: element.fine,
        reward: element.reward,
        enable_cheating: element.enable_cheating,
      })),
      cheatedElementIds,
    });

    const now = new Date().toISOString();
    const nextMarkupStage = {
      ...currentMetadata.markupStage,
      completed: currentMetadata.markupStage.completed || scoreResult.completed,
      completed_at:
        currentMetadata.markupStage.completed_at ??
        (scoreResult.completed ? now : null),
      last_score: scoreResult.score,
      last_score_percent: scoreResult.scorePercent,
      last_max_score: scoreResult.maxScore,
      guessed_element_ids: scoreResult.guessedElementIds,
      attempts: [
        ...currentMetadata.markupStage.attempts,
        {
          created_at: now,
          completed: scoreResult.completed,
          score: scoreResult.score,
          score_percent: scoreResult.scorePercent,
          max_score: scoreResult.maxScore,
          guessed_element_ids: scoreResult.guessedElementIds,
          missed_element_ids: scoreResult.missedElementIds,
          ignored_cheat_element_ids: scoreResult.ignoredCheatElementIds,
          conturs: args.conturs,
          matches: scoreResult.matches.map((match) => ({
            contour_index: match.contour_index,
            element_id: match.element_id,
            markup_task_slide_id: match.markup_task_slide_id,
            use_basis: match.use_basis,
            awarded_score: match.awarded_score,
            overlap_ratio: match.overlap_ratio,
            area_ratio: match.area_ratio,
          })),
        },
      ],
    };

    await ctx.runMutation(internal.functions.user_completions.setMarkupTaskMetadata, {
      id: (completion as any)._id,
      metadata: {
        ...currentMetadata,
        kind: "markup_task",
        markupStage: nextMarkupStage,
      },
    });

    await ctx.runMutation(internal.functions.user_completions.finalizeMarkupTaskIfReady, {
      id: (completion as any)._id,
    });

    return {
      completed: scoreResult.completed,
      score: scoreResult.score,
      score_percent: scoreResult.scorePercent,
      max_score: scoreResult.maxScore,
      guessed_element_ids: scoreResult.guessedElementIds,
      missed_element_ids: scoreResult.missedElementIds,
      ignored_cheat_element_ids: scoreResult.ignoredCheatElementIds,
      completion_id: (completion as any)._id,
    };
  },
});

export const checkClinicStage = mutation({
  args: {
    user_id: v.string(),
    markup_task_id: markupTaskIdValidator,
    answers: v.array(v.any()),
  },
  returns: clinicCheckPlaceholderResult,
  handler: async () => {
    return {
      completed: false,
      score: 0,
      score_percent: 0,
      message: "Проверка клинической части для markup_task пока не реализована",
    };
  },
});

export const useCheat = mutation({
  args: {
    user_id: v.string(),
    task_id: markupTaskIdValidator,
  },
  returns: cheatReturnValidator,
  handler: async (ctx, args) => {
    const markupTaskId = String(args.task_id);
    const completion = await ctx.runMutation(
      internal.functions.user_completions.ensureMarkupTaskCompletion,
      {
        user_id: args.user_id,
        knowledge_id: markupTaskId,
      }
    );

    const currentMetadata = getMarkupMetadata((completion as any).metadata);
    const { elements } = await getTaskStructure(ctx.db, markupTaskId);
    const cheatedElementIds = currentMetadata.markupStage.cheats.map((entry) =>
      String(entry.element_id)
    );
    const picked = pickRandomCheatElement(
      elements.map((element: any) => ({
        _id: String(element._id),
        markup_task_slide_id: String(element.markup_task_slide_id),
        geometry: element.geometry,
        basis: element.basis,
        fine: element.fine,
        reward: element.reward,
        enable_cheating: element.enable_cheating,
      })),
      cheatedElementIds
    );

    if (!picked) {
      return {
        completion_id: (completion as any)._id,
        cheat: null,
        message: "Больше нет доступных cheat-контуров",
      };
    }

    const cheatEntry = {
      element_id: String(picked._id),
      markup_task_slide_id: String(picked.markup_task_slide_id),
      geometry: picked.geometry,
      used_at: new Date().toISOString(),
    };

    await ctx.runMutation(internal.functions.user_completions.setMarkupTaskMetadata, {
      id: (completion as any)._id,
      metadata: {
        ...currentMetadata,
        kind: "markup_task",
        markupStage: {
          ...currentMetadata.markupStage,
          cheats: [...currentMetadata.markupStage.cheats, cheatEntry],
        },
      },
    });

    return {
      completion_id: (completion as any)._id,
      cheat: cheatEntry,
      message: "Контур успешно открыт",
    };
  },
});
