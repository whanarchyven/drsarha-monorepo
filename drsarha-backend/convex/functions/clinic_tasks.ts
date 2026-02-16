import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { clinicTaskDoc, clinicTaskFields } from "../models/clinicTask";

export const list = query({
  args: {
    nozology: v.optional(v.string()),
    search: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    forcePublish: v.optional(v.boolean()),
    app_visible: v.optional(v.boolean()),
  },
  returns: v.object({
    items: v.array(clinicTaskDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { nozology, search, page = 1, limit = 10, forcePublish, app_visible }) => {
    const from = (page - 1) * limit;
    const now = Date.now();
    
    const candidates = nozology
      ? await (db as any)
          .query("clinic_tasks")
          .withIndex("by_nozology", (q: any) => q.eq("nozology", nozology))
          .collect()
      : await db.query("clinic_tasks").collect();
    
    // Фильтрация по publishAfter, если forcePublish не установлен
    let filtered = forcePublish 
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
    
    const total = filtered.length;
    const items = filtered.slice(from, from + limit);
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
    const id = await db.insert("clinic_tasks", data as any);
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
      publishAfter: v.optional(v.number()),
      endoscopy_model: v.optional(v.union(v.string(), v.null())),
      endoscopy_video: v.optional(v.union(v.string(), v.null())),
      app_visible: v.optional(v.boolean()),
      references: v.optional(v.array(v.object({ name: v.union(v.string(), v.null()), url: v.string() }))),
    }),
  },
  returns: clinicTaskDoc,
  handler: async ({ db }, { id, data }) => {
    await db.patch(id, data as any);
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
