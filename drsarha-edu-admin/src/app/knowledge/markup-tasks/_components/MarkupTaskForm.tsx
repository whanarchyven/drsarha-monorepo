'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import QuestionCreator from '@/components/question-creator';
import { getContentUrl } from '@/shared/utils/url';
import type { Question } from '@/shared/models/types/QuestionType';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MarkupTaskElementDraft, PolygonEditor } from './PolygonEditor';

const WIZARD_STEPS = [
  {
    id: 0,
    label: 'Основное',
    description: 'Название, нозология, комментарий завершения, обложка',
  },
  { id: 1, label: 'Клиника', description: 'Пациент, ИИ, вопросы' },
  { id: 2, label: 'Этапы', description: 'Слайды и разметка' },
] as const;

const publishAfterSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && value.length === 0 ? undefined : value,
  z.string().optional()
);

const formSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  publishAfter: publishAfterSchema,
  idx: z.preprocess(
    (value) =>
      value === '' || value === null || value === undefined
        ? undefined
        : Number(value),
    z.number().int().nonnegative().optional()
  ),
  app_visible: z.boolean().default(false),
  patient_info: z.string().optional().default(''),
  ai_scenario: z.string().optional().default(''),
  /** Временно необязательно; позже можно снова сделать `.min(1, …)`. */
  nozologyId: z.string().optional().default(''),
  complete_comment: z.string().optional().default(''),
});

interface MarkupTaskPointDraft {
  x: number;
  y: number;
}

interface ExistingElement {
  _id: string;
  name?: string;
  description?: string;
  geometry: {
    type: string;
    points: MarkupTaskPointDraft[];
  };
  basis: number;
  fine: number;
  reward: number;
  enable_cheating: boolean;
  order: number;
}

interface ExistingSlide {
  _id: string;
  name: string;
  description?: string;
  image: string;
  base_height: number;
  original_width?: number;
  original_height?: number;
  order: number;
  elements?: ExistingElement[];
}

interface ExistingStage {
  _id: string;
  name: string;
  additional_info?: string;
  description: string;
  task_condition?: string;
  element_name?: string;
  base_color?: string;
  info?: string;
  order: number;
  slides?: ExistingSlide[];
}

interface MarkupTaskSlideDraft {
  id?: string;
  name: string;
  description: string;
  image: string | File | null;
  base_height: number;
  original_width?: number;
  original_height?: number;
  order: number;
  elements: MarkupTaskElementDraft[];
}

interface MarkupTaskStageDraft {
  id?: string;
  name: string;
  additional_info: string;
  description: string;
  task_condition: string;
  element_name: string;
  base_color: string;
  info: string;
  order: number;
  slides: MarkupTaskSlideDraft[];
}

interface MarkupTaskFull {
  _id: string;
  name: string;
  cover_image: string;
  description: string;
  patient_info?: string;
  ai_scenario?: string;
  questions?: unknown[];
  nozologyId?: string;
  complete_comment?: string;
  idx?: number;
  app_visible?: boolean;
  publishAfter?: number;
  stages?: ExistingStage[];
}

interface MarkupTaskFormProps {
  initialData?: MarkupTaskFull | null;
}

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result?.toString() || '';
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const reorderByOrder = <T extends { order: number }>(items: T[]) =>
  items.map((item, index) => ({ ...item, order: index }));

const emptyElement = (order: number): MarkupTaskElementDraft => ({
  geometry: { type: 'polygon', points: [] },
  basis: 0,
  fine: 0,
  reward: 0,
  enable_cheating: false,
  order,
  name: '',
  description: '',
  isClosed: false,
});

const emptySlide = (order: number): MarkupTaskSlideDraft => ({
  name: '',
  description: '',
  image: null,
  base_height: 512,
  order,
  elements: [emptyElement(0)],
});

const emptyStage = (order: number): MarkupTaskStageDraft => ({
  name: '',
  additional_info: '',
  description: '',
  task_condition: '',
  element_name: '',
  base_color: '',
  info: '',
  order,
  slides: [emptySlide(0)],
});

function FieldHint({ children }: { children: ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

type MarkupQuestion = Question & { id?: string };

function docQuestionsToUi(raw: unknown): MarkupQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((q: any) => {
    const id = typeof q?.id === 'string' ? q.id : undefined;
    if (q?.type === 'text') {
      return {
        ...(id ? { id } : {}),
        type: 'text',
        question: q.question ?? '',
        answer: q.answer ?? '',
        additional_info: q.additional_info ?? '',
        correct_answer_comment: q.correct_answer_comment ?? '',
      };
    }
    const answers = Array.isArray(q?.answers) ? q.answers : [];
    return {
      ...(id ? { id } : {}),
      type: 'variants',
      question: q.question ?? '',
      answers:
        answers.length > 0
          ? answers.map((a: any) => ({
              answer: a.answer ?? '',
              isCorrect: Boolean(a.isCorrect),
            }))
          : [{ answer: '', isCorrect: false }],
      correct_answer_comment: q.correct_answer_comment ?? '',
    };
  });
}

const normalizeElements = (elements?: ExistingElement[]) => {
  const normalized: MarkupTaskElementDraft[] = (elements ?? []).map(
    (element: ExistingElement) => ({
      id: element._id,
      name: element.name ?? '',
      description: element.description ?? '',
      geometry: {
        type: element.geometry?.type ?? 'polygon',
        points: element.geometry?.points ?? [],
      },
      basis: element.basis ?? 0,
      fine: element.fine ?? 0,
      reward: element.reward ?? 0,
      enable_cheating: element.enable_cheating ?? false,
      order: element.order ?? 0,
      isClosed: true,
    })
  );

  return reorderByOrder(normalized);
};

const normalizeSlides = (slides?: ExistingSlide[]) => {
  const normalized: MarkupTaskSlideDraft[] = (slides ?? []).map(
    (slide: ExistingSlide) => ({
      id: slide._id,
      name: slide.name ?? '',
      description: slide.description ?? '',
      image: slide.image ?? null,
      base_height: slide.base_height ?? 512,
      original_width: slide.original_width,
      original_height: slide.original_height,
      order: slide.order ?? 0,
      elements: normalizeElements(slide.elements),
    })
  );

  return reorderByOrder(normalized);
};

const normalizeStages = (stages?: ExistingStage[]) => {
  const normalized: MarkupTaskStageDraft[] = (stages ?? []).map(
    (stage: ExistingStage) => ({
      id: stage._id,
      name: stage.name ?? '',
      additional_info: stage.additional_info ?? '',
      description: stage.description ?? '',
      task_condition: stage.task_condition ?? '',
      element_name: stage.element_name ?? '',
      base_color: stage.base_color ?? '',
      info: stage.info ?? '',
      order: stage.order ?? 0,
      slides: normalizeSlides(stage.slides),
    })
  );

  return reorderByOrder(normalized);
};

const ensureValidStages = (stages: MarkupTaskStageDraft[]) => {
  if (!stages.length) {
    throw new Error('Добавьте хотя бы один этап');
  }

  for (let stageIndex = 0; stageIndex < stages.length; stageIndex += 1) {
    const stage = stages[stageIndex];
    if (!stage.name.trim()) {
      throw new Error(`Заполните название этапа ${stageIndex + 1}`);
    }

    if (!stage.slides.length) {
      throw new Error(
        `В этапе ${stageIndex + 1} должен быть хотя бы один слайд`
      );
    }

    for (
      let slideIndex = 0;
      slideIndex < stage.slides.length;
      slideIndex += 1
    ) {
      const slide = stage.slides[slideIndex];
      if (!slide.name.trim()) {
        throw new Error(
          `Заполните название слайда ${slideIndex + 1} в этапе ${stageIndex + 1}`
        );
      }
      if (!slide.image) {
        throw new Error(
          `У слайда ${slideIndex + 1} в этапе ${stageIndex + 1} должно быть изображение`
        );
      }

      for (
        let elementIndex = 0;
        elementIndex < slide.elements.length;
        elementIndex += 1
      ) {
        const element = slide.elements[elementIndex];
        if (element.geometry.points.length < 3 || !element.isClosed) {
          throw new Error(
            `Контур ${elementIndex + 1} на слайде ${slideIndex + 1} этапа ${
              stageIndex + 1
            } должен быть замкнут и содержать минимум 3 точки`
          );
        }
      }
    }
  }
};

export function MarkupTaskForm({ initialData }: MarkupTaskFormProps) {
  const router = useRouter();
  const nozologies = useQuery(api.functions.nozologies.list, {}) ?? [];
  const createTask = useAction(api.functions.markup_tasks.create);
  const updateTask = useAction(api.functions.markup_tasks.updateAction);
  const insertStage = useMutation(api.functions.markup_task_stages.insert);
  const updateStage = useMutation(api.functions.markup_task_stages.update);
  const removeStage = useMutation(api.functions.markup_task_stages.remove);
  const createSlide = useAction(api.functions.markup_task_slides.create);
  const updateSlide = useAction(api.functions.markup_task_slides.updateAction);
  const removeSlide = useMutation(api.functions.markup_task_slides.remove);
  const insertElement = useMutation(api.functions.markup_task_elements.insert);
  const updateElement = useMutation(api.functions.markup_task_elements.update);
  const removeElement = useMutation(api.functions.markup_task_elements.remove);

  const [stages, setStages] = useState<MarkupTaskStageDraft[]>(
    initialData?.stages?.length
      ? normalizeStages(initialData.stages)
      : [emptyStage(0)]
  );
  const [formWizardStep, setFormWizardStep] = useState(0);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [questions, setQuestions] = useState<MarkupQuestion[]>(() =>
    docQuestionsToUi(initialData?.questions)
  );
  /** Локальный файл обложки: input не переживает размонтирование шага мастера. */
  const [coverFileDraft, setCoverFileDraft] = useState<File | null>(null);
  const [coverBlobUrl, setCoverBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    setActiveSlideIndex(0);
  }, [activeStageIndex]);

  useEffect(() => {
    if (!coverFileDraft) {
      setCoverBlobUrl(null);
      return;
    }
    const url = URL.createObjectURL(coverFileDraft);
    setCoverBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFileDraft]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      publishAfter: initialData?.publishAfter
        ? String(initialData.publishAfter).slice(0, 10)
        : '',
      idx: initialData?.idx ?? undefined,
      app_visible: initialData?.app_visible ?? false,
      patient_info: initialData?.patient_info ?? '',
      ai_scenario: initialData?.ai_scenario ?? '',
      nozologyId: initialData?.nozologyId
        ? String(initialData.nozologyId)
        : '',
      complete_comment: initialData?.complete_comment ?? '',
    },
  });

  const existingCoverUrl = initialData?.cover_image
    ? getContentUrl(initialData.cover_image)
    : '';

  const coverPreviewSrc = coverBlobUrl || existingCoverUrl;

  const updateStageDraft = (
    stageIndex: number,
    updater: (stage: MarkupTaskStageDraft) => MarkupTaskStageDraft
  ) => {
    setStages((current) =>
      current.map((stage, index) =>
        index === stageIndex ? updater(stage) : stage
      )
    );
  };

  const addStage = () => {
    let nextStages: MarkupTaskStageDraft[] = [];
    setStages((current) => {
      nextStages = [...current, emptyStage(current.length)];
      return nextStages;
    });
    setActiveStageIndex(nextStages.length - 1);
    setActiveSlideIndex(0);
  };

  const deleteStageDraft = (stageIndex: number) => {
    let nextStages: MarkupTaskStageDraft[] = [];
    setStages((current) => {
      nextStages = reorderByOrder(
        current.filter((_, index) => index !== stageIndex)
      );
      return nextStages;
    });
    setActiveStageIndex((prev) => {
      if (nextStages.length === 0) return 0;
      if (stageIndex < prev) return prev - 1;
      if (stageIndex === prev) return Math.min(prev, nextStages.length - 1);
      return prev;
    });
    setActiveSlideIndex(0);
  };

  const moveStage = (stageIndex: number, direction: -1 | 1) => {
    const targetIndex = stageIndex + direction;

    setStages((current) => {
      if (targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      const temp = next[stageIndex];
      next[stageIndex] = next[targetIndex];
      next[targetIndex] = temp;
      return reorderByOrder(next);
    });
    setActiveStageIndex((prev) => {
      if (prev === stageIndex) return targetIndex;
      if (prev === targetIndex) return stageIndex;
      return prev;
    });
  };

  const addSlide = (stageIndex: number) => {
    let newLen = 0;
    setStages((current) => {
      const next = current.map((st, i) => {
        if (i !== stageIndex) return st;
        const slides = [...st.slides, emptySlide(st.slides.length)];
        newLen = slides.length;
        return { ...st, slides };
      });
      return next;
    });
    if (stageIndex === activeStageIndex) {
      setActiveSlideIndex(Math.max(0, newLen - 1));
    }
  };

  const deleteSlideDraft = (stageIndex: number, slideIndex: number) => {
    let nextLen = 0;
    setStages((current) => {
      const next = current.map((st, i) => {
        if (i !== stageIndex) return st;
        const slides = reorderByOrder(
          st.slides.filter((_, j) => j !== slideIndex)
        );
        nextLen = slides.length;
        return { ...st, slides };
      });
      return next;
    });
    if (stageIndex === activeStageIndex) {
      setActiveSlideIndex((prev) => {
        if (nextLen === 0) return 0;
        if (slideIndex < prev) return prev - 1;
        if (slideIndex === prev) return Math.max(0, nextLen - 1);
        return prev;
      });
    }
  };

  const moveSlide = (
    stageIndex: number,
    slideIndex: number,
    direction: -1 | 1
  ) => {
    const targetIndex = slideIndex + direction;
    updateStageDraft(stageIndex, (stage) => {
      if (targetIndex < 0 || targetIndex >= stage.slides.length) return stage;

      const nextSlides = [...stage.slides];
      const temp = nextSlides[slideIndex];
      nextSlides[slideIndex] = nextSlides[targetIndex];
      nextSlides[targetIndex] = temp;

      return {
        ...stage,
        slides: reorderByOrder(nextSlides),
      };
    });
    if (stageIndex === activeStageIndex) {
      if (slideIndex === activeSlideIndex) {
        setActiveSlideIndex(targetIndex);
      } else if (targetIndex === activeSlideIndex) {
        setActiveSlideIndex(slideIndex);
      }
    }
  };

  const updateSlideDraft = (
    stageIndex: number,
    slideIndex: number,
    updater: (slide: MarkupTaskSlideDraft) => MarkupTaskSlideDraft
  ) => {
    updateStageDraft(stageIndex, (stage) => ({
      ...stage,
      slides: stage.slides.map((slide, index) =>
        index === slideIndex ? updater(slide) : slide
      ),
    }));
  };

  const handleSlideImageChange = (
    stageIndex: number,
    slideIndex: number,
    file?: File
  ) => {
    if (!file) return;

    const image = new Image();
    image.onload = () => {
      updateSlideDraft(stageIndex, slideIndex, (slide) => ({
        ...slide,
        image: file,
        original_width: image.width,
        original_height: image.height,
      }));
    };
    image.src = URL.createObjectURL(file);
  };

  const syncElements = async (
    slideId: string,
    nextElements: MarkupTaskElementDraft[],
    existingElements: Array<{ _id: string }> = []
  ) => {
    const nextIds = new Set(
      nextElements
        .filter((element) => element.id)
        .map((element) => String(element.id))
    );

    for (const existingElement of existingElements) {
      if (!nextIds.has(String(existingElement._id))) {
        await removeElement({
          id: existingElement._id as Id<'markup_task_elements'>,
        });
      }
    }

    const orderedElements = reorderByOrder(nextElements);

    for (let index = 0; index < orderedElements.length; index += 1) {
      const element = orderedElements[index];
      const data = {
        markup_task_slide_id: slideId,
        ...(element.name ? { name: element.name } : {}),
        ...(element.description ? { description: element.description } : {}),
        geometry: {
          type: element.geometry.type,
          points: element.geometry.points,
        },
        basis: element.basis,
        fine: element.fine,
        reward: element.reward,
        enable_cheating: element.enable_cheating,
        order: index,
      };

      if (element.id) {
        await updateElement({
          id: element.id as Id<'markup_task_elements'>,
          data,
        });
      } else {
        await insertElement(data);
      }
    }
  };

  const syncSlides = async (
    stageId: string,
    nextSlides: MarkupTaskSlideDraft[],
    existingSlides: ExistingSlide[] = []
  ) => {
    const nextIds = new Set(
      nextSlides.filter((slide) => slide.id).map((slide) => String(slide.id))
    );

    for (const existingSlide of existingSlides) {
      if (!nextIds.has(String(existingSlide._id))) {
        await removeSlide({
          id: existingSlide._id as Id<'markup_task_slides'>,
        });
      }
    }

    const orderedSlides = reorderByOrder(nextSlides);

    for (let index = 0; index < orderedSlides.length; index += 1) {
      const slide = orderedSlides[index];
      let slideId = slide.id;

      if (slide.id) {
        const args: {
          id: Id<'markup_task_slides'>;
          markup_task_stage_id: string;
          name: string;
          description: string;
          base_height: number;
          original_width?: number;
          original_height?: number;
          order: number;
          image?: string | { base64: string; contentType: string };
        } = {
          id: slide.id as Id<'markup_task_slides'>,
          markup_task_stage_id: stageId,
          name: slide.name,
          description: slide.description,
          base_height: slide.base_height,
          order: index,
          ...(slide.original_width !== undefined
            ? { original_width: slide.original_width }
            : {}),
          ...(slide.original_height !== undefined
            ? { original_height: slide.original_height }
            : {}),
        };

        if (slide.image instanceof File) {
          args.image = {
            base64: await fileToBase64(slide.image),
            contentType: slide.image.type || 'application/octet-stream',
          };
        }

        const updatedSlide = await updateSlide(args);
        slideId = String(updatedSlide._id);
      } else {
        if (!slide.image) {
          throw new Error(
            `У нового слайда "${slide.name || 'Без названия'}" нет изображения`
          );
        }

        const createdSlide = await createSlide({
          markup_task_stage_id: stageId,
          name: slide.name,
          description: slide.description,
          image:
            slide.image instanceof File
              ? {
                  base64: await fileToBase64(slide.image),
                  contentType: slide.image.type || 'application/octet-stream',
                }
              : slide.image,
          base_height: slide.base_height,
          order: index,
          ...(slide.original_width !== undefined
            ? { original_width: slide.original_width }
            : {}),
          ...(slide.original_height !== undefined
            ? { original_height: slide.original_height }
            : {}),
        });
        slideId = String(createdSlide._id);
      }

      const existingSlide = existingSlides.find(
        (candidate) => String(candidate._id) === String(slide.id)
      );

      await syncElements(
        slideId,
        slide.elements,
        existingSlide?.elements ?? []
      );
    }
  };

  const syncStages = async (
    taskId: string,
    nextStages: MarkupTaskStageDraft[],
    existingStages: ExistingStage[] = []
  ) => {
    const nextIds = new Set(
      nextStages.filter((stage) => stage.id).map((stage) => String(stage.id))
    );

    for (const existingStage of existingStages) {
      if (!nextIds.has(String(existingStage._id))) {
        await removeStage({
          id: existingStage._id as Id<'markup_task_stages'>,
        });
      }
    }

    const orderedStages = reorderByOrder(nextStages);

    for (let index = 0; index < orderedStages.length; index += 1) {
      const stage = orderedStages[index];
      let stageId = stage.id;

      if (stage.id) {
        const updatedStage = await updateStage({
          id: stage.id as Id<'markup_task_stages'>,
          data: {
            markup_task_id: taskId,
            name: stage.name,
            additional_info: stage.additional_info,
            description: stage.description,
            task_condition: stage.task_condition,
            element_name: stage.element_name,
            base_color: stage.base_color,
            info: stage.info,
            order: index,
          },
        });
        stageId = String(updatedStage._id);
      } else {
        const createdStage = await insertStage({
          markup_task_id: taskId,
          name: stage.name,
          additional_info: stage.additional_info,
          description: stage.description,
          task_condition: stage.task_condition,
          element_name: stage.element_name,
          base_color: stage.base_color,
          info: stage.info,
          order: index,
        });
        stageId = String(createdStage._id);
      }

      const existingStage = existingStages.find(
        (candidate) => String(candidate._id) === String(stage.id)
      );

      await syncSlides(stageId, stage.slides, existingStage?.slides ?? []);
    }
  };

  const performSave = async (
    values: z.infer<typeof formSchema>
  ): Promise<{ mode: 'created' | 'updated' }> => {
    ensureValidStages(stages);

    const publishAfter =
      values.publishAfter && values.publishAfter.length
        ? new Date(values.publishAfter).getTime()
        : undefined;

    const coverFile = coverFileDraft ?? undefined;

    let taskId = initialData?._id;

    if (initialData?._id) {
      const updated = await updateTask({
        id: initialData._id as Id<'markup_tasks'>,
        name: values.name,
        description: values.description,
        patient_info: values.patient_info ?? '',
        ai_scenario: values.ai_scenario ?? '',
        questions,
        ...(values.nozologyId?.trim()
          ? { nozologyId: values.nozologyId as Id<'nozologies'> }
          : {}),
        complete_comment: values.complete_comment ?? '',
        app_visible: values.app_visible,
        publishAfter,
        ...(values.idx !== undefined ? { idx: values.idx } : {}),
        ...(coverFile
          ? {
              cover: {
                base64: await fileToBase64(coverFile),
                contentType: coverFile.type || 'application/octet-stream',
              },
            }
          : {}),
      });
      taskId = String(updated._id);
    } else {
      if (!coverFile) {
        throw new Error('Обложка обязательна при создании задачи');
      }

      const created = await createTask({
        name: values.name,
        description: values.description,
        patient_info: values.patient_info ?? '',
        ai_scenario: values.ai_scenario ?? '',
        questions,
        ...(values.nozologyId?.trim()
          ? { nozologyId: values.nozologyId as Id<'nozologies'> }
          : {}),
        complete_comment: values.complete_comment ?? '',
        app_visible: values.app_visible,
        cover: {
          base64: await fileToBase64(coverFile),
          contentType: coverFile.type || 'application/octet-stream',
        },
        ...(publishAfter !== undefined ? { publishAfter } : {}),
        ...(values.idx !== undefined ? { idx: values.idx } : {}),
      });
      taskId = String(created._id);
    }

    if (!taskId) {
      throw new Error('Не удалось определить ID задачи');
    }

    await syncStages(taskId, stages, initialData?.stages ?? []);

    return { mode: initialData?._id ? 'updated' : 'created' };
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const toastId = toast.loading('Сохранение задачи на разметку...');
    try {
      const result = await performSave(values);
      toast.success(
        result.mode === 'updated'
          ? 'Задача на разметку обновлена'
          : 'Задача на разметку создана',
        { id: toastId }
      );
      router.push('/knowledge/markup-tasks');
      router.refresh();
    } catch (error) {
      console.error('Error saving markup task:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Ошибка сохранения задачи на разметку',
        { id: toastId }
      );
    }
  };

  const activeStage = stages[activeStageIndex];
  const activeSlide = activeStage?.slides[activeSlideIndex];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          void onSubmit(values);
        })}
        className="space-y-8">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Шаги мастера
            </p>
            {coverPreviewSrc ? (
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-2 py-1.5">
                <span className="text-xs text-muted-foreground">Обложка</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPreviewSrc}
                  alt=""
                  className="h-10 w-14 rounded object-cover"
                />
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                Обложка не выбрана
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            {WIZARD_STEPS.map((step, index) => {
              const isActive = formWizardStep === step.id;
              const isDone = formWizardStep > step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setFormWizardStep(step.id)}
                  className={`flex flex-1 items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                    isActive
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : isDone
                        ? 'border-muted bg-muted/30 hover:bg-muted/50'
                        : 'border-border hover:bg-muted/40'
                  }`}>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isDone
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium leading-tight">
                      {step.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {step.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {formWizardStep === 0 && (
        <Card className="p-6 space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Название</FormLabel>
                <FieldHint>
                  Внутреннее название задачи на разметку в админке и приложении.
                </FieldHint>
                <FormControl>
                  <Input {...field} placeholder="Введите название задачи" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Описание</FormLabel>
                <FieldHint>
                  Коротко опишите, что именно нужно разметить на слайдах.
                </FieldHint>
                <FormControl>
                  <Textarea {...field} placeholder="Введите описание задачи" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nozologyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Нозология</FormLabel>
                <FieldHint>Пока необязательно.</FieldHint>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите нозологию" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {nozologies.map((nozology) => (
                      <SelectItem
                        key={nozology._id}
                        value={String(nozology._id)}>
                        {nozology.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="complete_comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Комментарий при завершении</FormLabel>
                <FieldHint>
                  Текст, который можно показать пользователю после успешного
                  прохождения задачи.
                </FieldHint>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Например: отличная работа, кейс разобран…"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="publishAfter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дата публикации</FormLabel>
                  <FieldHint>
                    До этой даты задача может быть скрыта для обычных
                    пользователей.
                  </FieldHint>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="idx"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Индекс вывода</FormLabel>
                  <FieldHint>
                    Чем выше индекс, тем выше задача будет в списках.
                  </FieldHint>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value ?? ''}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ''
                            ? undefined
                            : Number(event.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="app_visible"
              render={({ field }) => (
                <FormItem className="flex h-full flex-col justify-center gap-2 rounded-md border p-4">
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="mb-0">
                      Видимость в приложении
                    </FormLabel>
                  </div>
                  <FieldHint>
                    Включите, если задача уже готова к показу пользователям.
                  </FieldHint>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <div>
              <Label htmlFor="markup-task-cover-input">Обложка</Label>
              <FieldHint>
                Главная картинка задачи для списка и карточки в админке.
                Файл сохраняется при переходах между шагами.
              </FieldHint>
            </div>
            <Input
              id="markup-task-cover-input"
              key={coverFileDraft ? `${coverFileDraft.name}-${coverFileDraft.size}` : 'no-cover'}
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setCoverFileDraft(file ?? null);
              }}
            />
            {coverPreviewSrc ? (
              <div className="space-y-2">
                <div className="overflow-hidden rounded-md border bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverPreviewSrc}
                    alt="Превью обложки"
                    className="max-h-72 w-full object-contain"
                  />
                </div>
                {coverFileDraft ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Выбрано: {coverFileDraft.name}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCoverFileDraft(null)}>
                      Убрать файл
                    </Button>
                  </div>
                ) : initialData?.cover_image ? (
                  <p className="text-xs text-muted-foreground">
                    Текущая обложка с сервера. Выберите файл, чтобы заменить.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </Card>
        )}

        {formWizardStep === 1 && (
        <Card className="space-y-6 p-6">
          <div>
            <h2 className="text-xl font-semibold">Клиническая часть</h2>
            <p className="text-xs text-muted-foreground">
              Те же поля, что у клинической задачи: данные о пациенте, сценарий ИИ
              и вопросы.
            </p>
          </div>

          <FormField
            control={form.control}
            name="patient_info"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Информация о пациенте</FormLabel>
                <FieldHint>
                  Аналог «дополнительной информации» в клинической задаче.
                </FieldHint>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Контекст кейса, жалобы, анамнез…"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ai_scenario"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AI сценарий</FormLabel>
                <FieldHint>Опишите сценарий работы ИИ с пользователем.</FieldHint>
                <FormControl>
                  <Textarea {...field} placeholder="Сценарий для модели" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <div className="text-sm font-medium">Вопросы</div>
            <FieldHint>
              Формат как у клинической задачи: текстовые ответы или варианты.
            </FieldHint>
            <QuestionCreator questions={questions} setQuestions={setQuestions} />
          </div>
        </Card>
        )}

        {formWizardStep === 2 && activeStage && (
          <Card className="space-y-6 p-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Этапы разметки</h2>
              <p className="text-xs text-muted-foreground">
                Один этап на экране: сначала свойства, затем слайды по одному.
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  disabled={activeStageIndex <= 0}
                  onClick={() => setActiveStageIndex((i) => i - 1)}
                  aria-label="Предыдущий этап">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0 px-1">
                  <p className="text-xs text-muted-foreground">
                    Этап {activeStageIndex + 1} из {stages.length}
                  </p>
                  <p className="truncate font-medium">
                    {activeStage.name.trim() || 'Без названия'}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  disabled={activeStageIndex >= stages.length - 1}
                  onClick={() => setActiveStageIndex((i) => i + 1)}
                  aria-label="Следующий этап">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Badge variant="secondary" className="ml-1">
                  Слайдов: {activeStage.slides.length}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveStage(activeStageIndex, -1)}>
                  Этап вверх
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveStage(activeStageIndex, 1)}>
                  Этап вниз
                </Button>
                <Button type="button" variant="secondary" onClick={addStage}>
                  Добавить этап
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteStageDraft(activeStageIndex)}>
                  Удалить этап
                </Button>
              </div>
            </div>

            <Tabs
              key={activeStageIndex}
              defaultValue="props"
              className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="props">Свойства этапа</TabsTrigger>
                <TabsTrigger value="slides">
                  Слайды ({activeStage.slides.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="props" className="mt-4 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Название этапа</div>
                    <FieldHint>
                      Видимое имя шага, по которому ориентируется админ.
                    </FieldHint>
                    <Input
                      value={activeStage.name}
                      onChange={(event) =>
                        updateStageDraft(activeStageIndex, (item) => ({
                          ...item,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Element name</div>
                    <FieldHint>
                      Базовое имя сущности, которую пользователь ищет на
                      слайдах.
                    </FieldHint>
                    <Input
                      value={activeStage.element_name}
                      onChange={(event) =>
                        updateStageDraft(activeStageIndex, (item) => ({
                          ...item,
                          element_name: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Описание этапа</div>
                    <FieldHint>
                      Что происходит на этом этапе и чего ждём от пользователя.
                    </FieldHint>
                    <Textarea
                      value={activeStage.description}
                      onChange={(event) =>
                        updateStageDraft(activeStageIndex, (item) => ({
                          ...item,
                          description: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Additional info (AI)
                    </div>
                    <FieldHint>
                      Внутренний контекст или подсказка для AI-логики этапа.
                    </FieldHint>
                    <Textarea
                      value={activeStage.additional_info}
                      onChange={(event) =>
                        updateStageDraft(activeStageIndex, (item) => ({
                          ...item,
                          additional_info: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Task condition</div>
                    <FieldHint>
                      Условие прохождения или правило оценки разметки.
                    </FieldHint>
                    <Textarea
                      value={activeStage.task_condition}
                      onChange={(event) =>
                        updateStageDraft(activeStageIndex, (item) => ({
                          ...item,
                          task_condition: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Справка</div>
                    <FieldHint>
                      Справочный текст, который можно показать пользователю.
                    </FieldHint>
                    <Textarea
                      value={activeStage.info}
                      onChange={(event) =>
                        updateStageDraft(activeStageIndex, (item) => ({
                          ...item,
                          info: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Base color</div>
                    <FieldHint>
                      Общий цвет контуров этапа, например #ef4444.
                    </FieldHint>
                    <Input
                      value={activeStage.base_color}
                      onChange={(event) =>
                        updateStageDraft(activeStageIndex, (item) => ({
                          ...item,
                          base_color: event.target.value,
                        }))
                      }
                      placeholder="#ef4444"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="slides" className="mt-4 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Выберите слайд. У каждого должно быть изображение и замкнутые
                    контуры.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => addSlide(activeStageIndex)}>
                    Добавить слайд
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeStage.slides.map((slide, slideIndex) => (
                    <Button
                      key={slide.id ?? `slide-pick-${slideIndex}`}
                      type="button"
                      size="sm"
                      variant={
                        activeSlideIndex === slideIndex ? 'default' : 'outline'
                      }
                      onClick={() => setActiveSlideIndex(slideIndex)}
                      className="gap-2">
                      Слайд {slideIndex + 1}
                      <Badge variant="secondary" className="font-normal">
                        {slide.elements.length}
                      </Badge>
                    </Button>
                  ))}
                </div>

                {activeSlide && (
                  <Card className="space-y-4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        Слайд {activeSlideIndex + 1}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            moveSlide(activeStageIndex, activeSlideIndex, -1)
                          }>
                          Вверх
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            moveSlide(activeStageIndex, activeSlideIndex, 1)
                          }>
                          Вниз
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            deleteSlideDraft(activeStageIndex, activeSlideIndex)
                          }>
                          Удалить слайд
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Название слайда</div>
                        <FieldHint>
                          Короткое имя слайда для навигации внутри этапа.
                        </FieldHint>
                        <Input
                          value={activeSlide.name}
                          onChange={(event) =>
                            updateSlideDraft(
                              activeStageIndex,
                              activeSlideIndex,
                              (item) => ({
                                ...item,
                                name: event.target.value,
                              })
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Base height</div>
                        <FieldHint>
                          Базовая высота для калибровки масштаба разметки.
                        </FieldHint>
                        <Input
                          type="number"
                          min={1}
                          value={activeSlide.base_height}
                          onChange={(event) =>
                            updateSlideDraft(
                              activeStageIndex,
                              activeSlideIndex,
                              (item) => ({
                                ...item,
                                base_height: Number(
                                  event.target.value || 512
                                ),
                              })
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Описание слайда</div>
                      <FieldHint>
                        Дополнительный контекст по изображению и сцене.
                      </FieldHint>
                      <Textarea
                        value={activeSlide.description}
                        onChange={(event) =>
                          updateSlideDraft(
                            activeStageIndex,
                            activeSlideIndex,
                            (item) => ({
                              ...item,
                              description: event.target.value,
                            })
                          )
                        }
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          Изображение слайда
                        </div>
                        <FieldHint>
                          Основное изображение для контуров разметки.
                        </FieldHint>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            handleSlideImageChange(
                              activeStageIndex,
                              activeSlideIndex,
                              event.target.files?.[0]
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Original width</div>
                        <FieldHint>Ширина в пикселях.</FieldHint>
                        <Input
                          type="number"
                          value={activeSlide.original_width ?? ''}
                          onChange={(event) =>
                            updateSlideDraft(
                              activeStageIndex,
                              activeSlideIndex,
                              (item) => ({
                                ...item,
                                original_width:
                                  event.target.value === ''
                                    ? undefined
                                    : Number(event.target.value),
                              })
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          Original height
                        </div>
                        <FieldHint>Высота в пикселях.</FieldHint>
                        <Input
                          type="number"
                          value={activeSlide.original_height ?? ''}
                          onChange={(event) =>
                            updateSlideDraft(
                              activeStageIndex,
                              activeSlideIndex,
                              (item) => ({
                                ...item,
                                original_height:
                                  event.target.value === ''
                                    ? undefined
                                    : Number(event.target.value),
                              })
                            )
                          }
                        />
                      </div>
                    </div>

                    {activeSlide.image && (
                      <PolygonEditor
                        image={activeSlide.image}
                        elements={activeSlide.elements}
                        defaultColor={activeStage.base_color}
                        onChange={(elements) =>
                          updateSlideDraft(
                            activeStageIndex,
                            activeSlideIndex,
                            (item) => ({
                              ...item,
                              elements: reorderByOrder(elements),
                            })
                          )
                        }
                      />
                    )}
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        )}

        <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {formWizardStep > 0 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFormWizardStep((s) => s - 1)}>
                Назад
              </Button>
            )}
            {formWizardStep < 2 && (
              <Button
                type="button"
                onClick={() => setFormWizardStep((s) => s + 1)}>
                Далее
              </Button>
            )}
            <Button type="submit">
              {initialData ? 'Сохранить' : 'Создать задачу'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
