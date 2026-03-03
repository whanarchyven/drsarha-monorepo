import { query, mutation, action, httpAction } from "../_generated/server";
import { v } from "convex/values";
import { clinicTaskDoc, clinicTaskFields } from "../models/clinicTask";
import { api, internal } from "../_generated/api";

const sortByIdx = (items: any[]) =>
  items.slice().sort((a, b) => {
    const aIdx = a.idx;
    const bIdx = b.idx;
    if (aIdx === undefined && bIdx === undefined) {
      return (a._creationTime ?? 0) - (b._creationTime ?? 0);
    }
    if (aIdx === undefined) return 1;
    if (bIdx === undefined) return -1;
    if (aIdx !== bIdx) return bIdx - aIdx;
    return (a._creationTime ?? 0) - (b._creationTime ?? 0);
  });

const ensureQuestionIds = (questions: any[]) =>
  (questions || []).map((question) => {
    if (question?.id && typeof question.id === "string") {
      return question;
    }
    return {
      ...question,
      id: crypto.randomUUID(),
    };
  });

export const list = query({
  args: {
    nozology: v.optional(v.string()),
    search: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    forcePublish: v.optional(v.boolean()),
    app_visible: v.optional(v.boolean()),
    admin_id: v.optional(v.string()),
  },
  returns: v.object({
    items: v.array(clinicTaskDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { nozology, search, page = 1, limit = 10, forcePublish, app_visible, admin_id }) => {
    const from = (page - 1) * limit;
    const now = Date.now();
    const isAdmin = admin_id && admin_id === process.env.ADMIN_ID;
    const allowUnpublished = isAdmin && forcePublish !== false;
    
    const candidates = nozology
      ? await (db as any)
          .query("clinic_tasks")
          .withIndex("by_nozology", (q: any) => q.eq("nozology", nozology))
          .collect()
      : await db.query("clinic_tasks").collect();
    
    // Фильтрация по publishAfter, если forcePublish не установлен
    let filtered = allowUnpublished
      ? candidates 
      : candidates.filter((t: any) => {
          if (!t.publishAfter) return true; // Если publishAfter не установлен, показываем
          return t.publishAfter <= now; // Показываем только если дата публикации наступила
        });
    
    // Фильтрация по app_visible
    if (app_visible === true) {
      filtered = filtered.filter((t: any) => t.app_visible === true);
    }
    
    // Фильтрация по поиску
    if (search) {
      filtered = filtered.filter((t: any) => t.name.toLowerCase().includes(search.toLowerCase()));
    }
    
    const sorted = sortByIdx(filtered);
    const total = sorted.length;
    const items = sorted.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    return { items, total, page, totalPages, hasMore: page < totalPages };
  },
});

export const getById = query({
  args: { id: v.id("clinic_tasks") },
  returns: v.union(clinicTaskDoc, v.null()),
  handler: async ({ db }, { id }) => db.get(id),
});

export const insert = mutation({
  args: v.object(clinicTaskFields),
  returns: clinicTaskDoc,
  handler: async ({ db }, data) => {
    const normalized = {
      ...data,
      questions: ensureQuestionIds(data.questions),
    };
    const id = await db.insert("clinic_tasks", normalized as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const update = mutation({
  args: {
    id: v.id("clinic_tasks"),
    data: v.object({
      name: v.optional(v.string()),
      difficulty: v.optional(v.number()),
      cover_image: v.optional(v.string()),
      images: v.optional(v.array(v.object({ image: v.string(), is_open: v.boolean() }))),
      description: v.optional(v.string()),
      questions: v.optional(v.array(v.any())),
      additional_info: v.optional(v.string()),
      ai_scenario: v.optional(v.string()),
      stars: v.optional(v.number()),
      feedback: v.optional(v.any()),
      nozology: v.optional(v.string()),
      interviewMode: v.optional(v.boolean()),
      interviewQuestions: v.optional(v.array(v.string())),
      interviewAnalyticQuestions: v.optional(v.array(v.string())),
      idx: v.optional(v.number()),
      publishAfter: v.optional(v.number()),
      endoscopy_model: v.optional(v.union(v.string(), v.null())),
      endoscopy_video: v.optional(v.union(v.string(), v.null())),
      timecodes: v.optional(
        v.array(
          v.object({
            time: v.number(),
            title: v.string(),
            description: v.optional(v.string()),
          })
        )
      ),
      app_visible: v.optional(v.boolean()),
      references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
    }),
  },
  returns: clinicTaskDoc,
  handler: async ({ db }, { id, data }) => {
    const normalized = {
      ...data,
      ...(data.questions ? { questions: ensureQuestionIds(data.questions) } : {}),
    };
    await db.patch(id, normalized as any);
    const doc = await db.get(id);
    return doc!;
  },
});

export const remove = mutation({
  args: { id: v.id("clinic_tasks") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return true;
  },
});

const fileValidator = v.object({ base64: v.string(), contentType: v.string() });
const fileOrPathValidator = v.union(v.string(), fileValidator);
const optionalFileOrPathOrNull = v.optional(v.union(fileOrPathValidator, v.null()));

const uploadIfNeeded = async (
  ctx: any,
  file: { base64: string; contentType: string } | string | undefined,
  fileType: "images" | "video" | "files"
) => {
  if (!file) return undefined;
  if (typeof file === "string") return file;
  return await ctx.runAction(internal.helpers.upload.uploadToS3, { file, fileType });
};

export const create = action({
  args: {
    name: v.string(),
    difficulty: v.number(),
    cover: fileValidator,
    images: v.optional(
      v.array(v.object({ image: fileOrPathValidator, is_open: v.boolean() }))
    ),
    description: v.string(),
    questions: v.array(v.any()),
    additional_info: v.optional(v.string()),
    ai_scenario: v.optional(v.string()),
    stars: v.number(),
    feedback: v.any(),
    nozology: v.string(),
    interviewMode: v.optional(v.boolean()),
    interviewQuestions: v.optional(v.array(v.string())),
    interviewAnalyticQuestions: v.optional(v.array(v.string())),
    publishAfter: v.optional(v.number()),
    endoscopy_model: optionalFileOrPathOrNull,
    endoscopy_video: optionalFileOrPathOrNull,
    endoscopy_modelPath: v.optional(v.string()),
    endoscopy_videoPath: v.optional(v.string()),
    timecodes: v.optional(
      v.array(
        v.object({
          time: v.number(),
          title: v.string(),
          description: v.optional(v.string()),
        })
      )
    ),
    app_visible: v.optional(v.boolean()),
    references: v.optional(
      v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))
    ),
    idx: v.optional(v.number()),
  },
  returns: clinicTaskDoc,
  handler: async (ctx, args) => {
    const cover_image = await uploadIfNeeded(ctx, args.cover, "images");
    const images = await Promise.all(
      (args.images ?? []).map(async (img) => ({
        ...img,
        image: (await uploadIfNeeded(ctx, img.image, "images")) as string,
      }))
    );
    const endoscopy_video = args.endoscopy_videoPath
      ? args.endoscopy_videoPath
      : await uploadIfNeeded(ctx, args.endoscopy_video ?? undefined, "video");
    const endoscopy_model = args.endoscopy_modelPath
      ? args.endoscopy_modelPath
      : await uploadIfNeeded(ctx, args.endoscopy_model ?? undefined, "files");

    const created = await ctx.runMutation(api.functions.clinic_tasks.insert, {
      name: args.name,
      difficulty: args.difficulty,
      cover_image,
      images,
      description: args.description,
      questions: args.questions,
      additional_info: args.additional_info ?? "",
      ai_scenario: args.ai_scenario ?? "",
      stars: args.stars,
      feedback: args.feedback,
      nozology: args.nozology,
      ...(args.interviewMode !== undefined ? { interviewMode: args.interviewMode } : {}),
      ...(args.interviewQuestions ? { interviewQuestions: args.interviewQuestions } : {}),
      ...(args.interviewAnalyticQuestions ? { interviewAnalyticQuestions: args.interviewAnalyticQuestions } : {}),
      ...(args.idx !== undefined ? { idx: args.idx } : {}),
      ...(args.publishAfter ? { publishAfter: args.publishAfter } : {}),
      ...(args.timecodes ? { timecodes: args.timecodes } : {}),
      ...(args.app_visible !== undefined ? { app_visible: args.app_visible } : {}),
      ...(endoscopy_video ? { endoscopy_video } : {}),
      ...(endoscopy_model ? { endoscopy_model } : {}),
      ...(args.references ? { references: args.references } : {}),
    } as any);

    return created;
  },
});

export const updateAction = action({
  args: {
    id: v.id("clinic_tasks"),
    name: v.optional(v.string()),
    difficulty: v.optional(v.number()),
    cover: v.optional(fileValidator),
    images: v.optional(
      v.array(v.object({ image: fileOrPathValidator, is_open: v.boolean() }))
    ),
    description: v.optional(v.string()),
    questions: v.optional(v.array(v.any())),
    additional_info: v.optional(v.string()),
    ai_scenario: v.optional(v.string()),
    stars: v.optional(v.number()),
    feedback: v.optional(v.any()),
    nozology: v.optional(v.string()),
    interviewMode: v.optional(v.boolean()),
    interviewQuestions: v.optional(v.array(v.string())),
    interviewAnalyticQuestions: v.optional(v.array(v.string())),
    publishAfter: v.optional(v.number()),
    endoscopy_model: optionalFileOrPathOrNull,
    endoscopy_video: optionalFileOrPathOrNull,
    endoscopy_modelPath: v.optional(v.string()),
    endoscopy_videoPath: v.optional(v.string()),
    timecodes: v.optional(
      v.array(
        v.object({
          time: v.number(),
          title: v.string(),
          description: v.optional(v.string()),
        })
      )
    ),
    app_visible: v.optional(v.boolean()),
    references: v.optional(
      v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))
    ),
    idx: v.optional(v.number()),
  },
  returns: clinicTaskDoc,
  handler: async (ctx, args) => {
    const data: Record<string, any> = {};
    if (args.name !== undefined) data.name = args.name;
    if (args.difficulty !== undefined) data.difficulty = args.difficulty;
    if (args.description !== undefined) data.description = args.description;
    if (args.questions !== undefined) data.questions = args.questions;
    if (args.additional_info !== undefined) data.additional_info = args.additional_info;
    if (args.ai_scenario !== undefined) data.ai_scenario = args.ai_scenario;
    if (args.stars !== undefined) data.stars = args.stars;
    if (args.feedback !== undefined) data.feedback = args.feedback;
    if (args.nozology !== undefined) data.nozology = args.nozology;
    if (args.interviewMode !== undefined) data.interviewMode = args.interviewMode;
    if (args.interviewQuestions !== undefined)
      data.interviewQuestions = args.interviewQuestions;
    if (args.interviewAnalyticQuestions !== undefined)
      data.interviewAnalyticQuestions = args.interviewAnalyticQuestions;
    if (args.publishAfter !== undefined) data.publishAfter = args.publishAfter;
    if (args.app_visible !== undefined) data.app_visible = args.app_visible;
    if (args.references !== undefined) data.references = args.references;
    if (args.idx !== undefined) data.idx = args.idx;
    if (args.timecodes !== undefined) data.timecodes = args.timecodes;

    if (args.cover) {
      data.cover_image = await uploadIfNeeded(ctx, args.cover, "images");
    }
    if (args.images) {
      data.images = await Promise.all(
        args.images.map(async (img) => ({
          ...img,
          image: (await uploadIfNeeded(ctx, img.image, "images")) as string,
        }))
      );
    }
    if (args.endoscopy_video === null) {
      data.endoscopy_video = null;
    } else if (args.endoscopy_videoPath) {
      data.endoscopy_video = args.endoscopy_videoPath;
    } else if (args.endoscopy_video) {
      data.endoscopy_video = await uploadIfNeeded(
        ctx,
        args.endoscopy_video ?? undefined,
        "video"
      );
    }
    if (args.endoscopy_model === null) {
      data.endoscopy_model = null;
    } else if (args.endoscopy_modelPath) {
      data.endoscopy_model = args.endoscopy_modelPath;
    } else if (args.endoscopy_model) {
      data.endoscopy_model = await uploadIfNeeded(
        ctx,
        args.endoscopy_model ?? undefined,
        "files"
      );
    }

    const updated = await ctx.runMutation(api.functions.clinic_tasks.update, {
      id: args.id,
      data,
    });

    return updated;
  },
});



export const rewriteInterviewMode = mutation({
    args: {},
    returns: v.any(),
    handler: async ({ db }) => {
      console.log("Write and test your query function here!");
      const tasks=await db.query("clinic_tasks").take(40);
      let promises=tasks.map(async (item)=>{
        const isTrue=item.interviewMode=="true"
        console.log(item,"ITEM",isTrue,"IS TRUE")
        const res= await db.patch(item._id,{...item,interviewMode:isTrue})
        return res
      })
      return await Promise.all(promises)
    },
  })

// Добавить уникальные ID к вопросам в массиве questions
export const addQuestionIds = mutation({
  args: {
    batchSize: v.optional(v.number()),
  },
  returns: v.object({
    processed: v.number(),
    updated: v.number(),
    totalQuestions: v.number(),
  }),
  handler: async ({ db }, { batchSize = 100 }) => {
    const tasks = await db.query("clinic_tasks").take(batchSize);
    let processed = 0;
    let updated = 0;
    let totalQuestions = 0;

    for (const task of tasks) {
      if (!task.questions || !Array.isArray(task.questions)) {
        continue;
      }

      let hasChanges = false;
      const updatedQuestions = task.questions.map((question: any) => {
        totalQuestions++;
        // Если у вопроса уже есть ID, оставляем его
        if (question.id && typeof question.id === "string") {
          return question;
        }
        // Генерируем уникальный ID для вопроса без ID
        hasChanges = true;
        return {
          ...question,
          id: crypto.randomUUID(),
        };
      });

      if (hasChanges) {
        await db.patch(task._id, {
          questions: updatedQuestions,
        });
        updated++;
      }
      processed++;
    }

    return {
      processed,
      updated,
      totalQuestions,
    };
  },
})

// Get task condition (additional_info and ai_scenario)
export const getTaskCondition = query({
  args: { task_id: v.string() },
  returns: v.object({
    additional_info: v.string(),
    ai_scenario:v.string(),
  }),
  handler: async ({ db }, { task_id }) => {
    try {
      const task = await db.get(task_id as any);
      if (!task) {
        return { additional_info:"",ai_scenario:"" };
      }
      const taskData = task as any;
      return { additional_info:taskData.additional_info, ai_scenario:taskData.ai_scenario };
    } catch (e) {
      return { additional_info:"",ai_scenario:"" };
    }
  },
});

export const getClinicTaskQuestionCondition = query({
  args: { task_id: v.string(), question_id: v.string() },
  returns: v.union(v.any(), v.null()),
  handler: async ({ db }, { task_id, question_id }) => {
    try {
      const task = await db.get(task_id as any);
      if (!task) return null;
      const taskData = task as any;
      const questions: any[] = Array.isArray(taskData.questions)
        ? taskData.questions
        : [];
      const hit = questions.find((q) => String(q.id) === String(question_id));
      return hit ?? null;
    } catch {
      return null;
    }
  },
});

export const getTaskConditionHttp = httpAction(async (ctx, req) => {
  try {
    const url = new URL(req.url);
    const task_id = url.searchParams.get("task_id") || "";
    if (!task_id) {
      return new Response(
        JSON.stringify({ additional_info: "", ai_scenario: "" }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    }
    const result = await ctx.runQuery(api.functions.clinic_tasks.getTaskCondition, {
      task_id,
    });
    return new Response(
      JSON.stringify({
        additional_info: result.additional_info || "",
        ai_scenario: result.ai_scenario || "",
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ additional_info: "", ai_scenario: "" }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  }
});

export const getClinicTaskQuestionConditionHttp = httpAction(async (ctx, req) => {
  try {
    const url = new URL(req.url);
    const task_id = url.searchParams.get("task_id") || "";
    const question_id = url.searchParams.get("question_id") || "";
    if (!task_id || !question_id) {
      return new Response(JSON.stringify(null), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    const result = await ctx.runQuery(
      api.functions.clinic_tasks.getClinicTaskQuestionCondition,
      { task_id, question_id }
    );
    return new Response(JSON.stringify(result ?? null), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify(null), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
});

// Get task answer treatment
export const getTaskAnswerTreatment = query({
  args: { task_id: v.string() },
  returns: v.object({
    answer: v.string(),
  }),
  handler: async ({ db }, { task_id }) => {
    try {
      const task = await db.get(task_id as any);
      if (!task) {
        return { answer: "" };
      }
      const taskData = task as any;
      // Try to find treatment in task data
      const answer = taskData.treatment || taskData.answer?.treatment || "";
      return { answer };
    } catch (e) {
      return { answer: "" };
    }
  },
});

// Get task answer diagnosis
export const getTaskAnswerDiagnosis = query({
  args: { task_id: v.string() },
  returns: v.object({
    answer: v.string(),
  }),
  handler: async ({ db }, { task_id }) => {
    try {
      const task = await db.get(task_id as any);
      if (!task) {
        return { answer: "" };
      }
      const taskData = task as any;
      // Try to find correct_diagnosis in task data
      const answer = taskData.correct_diagnosis || taskData.answer?.correct_diagnosis || "";
      return { answer };
    } catch (e) {
      return { answer: "" };
    }
  },
});

// Get full task (without _id field for compatibility with MongoDB)
export const getTask = query({
  args: { task_id: v.string() },
  returns: v.any(),
  handler: async ({ db }, { task_id }) => {
    try {
      const task = await db.get(task_id as any);
      if (!task) {
        return null;
      }
      const taskData = task as any;
      // Remove _id and _creationTime for MongoDB compatibility
      const { _id, _creationTime, ...rest } = taskData;
      return rest;
    } catch (e) {
      return null;
    }
  },
});
