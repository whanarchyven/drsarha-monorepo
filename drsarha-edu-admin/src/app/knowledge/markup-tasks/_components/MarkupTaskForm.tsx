'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAction, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import { getContentUrl } from '@/shared/utils/url';
import {
  MarkupTaskElementDraft,
  PolygonEditor,
} from './PolygonEditor';

const publishAfterSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && value.length === 0 ? undefined : value,
  z.string().optional()
);

const additionalTaskSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().default(''),
  task_id: z.string().min(1, 'ID задачи обязателен'),
  task_type: z.string().min(1, 'Тип задачи обязателен'),
});

const formSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  cover_image: z.any().optional(),
  publishAfter: publishAfterSchema,
  idx: z.preprocess(
    (value) =>
      value === '' || value === null || value === undefined
        ? undefined
        : Number(value),
    z.number().int().nonnegative().optional()
  ),
  app_visible: z.boolean().default(false),
  additional_tasks: z.array(additionalTaskSchema).default([]),
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
  additional_tasks: Array<{
    name: string;
    description: string;
    task_id: string;
    task_type: string;
  }>;
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
      throw new Error(`В этапе ${stageIndex + 1} должен быть хотя бы один слайд`);
    }

    for (let slideIndex = 0; slideIndex < stage.slides.length; slideIndex += 1) {
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

      for (let elementIndex = 0; elementIndex < slide.elements.length; elementIndex += 1) {
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
    initialData?.stages?.length ? normalizeStages(initialData.stages) : [emptyStage(0)]
  );
  const [expandedStageIndex, setExpandedStageIndex] = useState(0);
  const [expandedSlideKey, setExpandedSlideKey] = useState('0-0');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      cover_image: undefined,
      publishAfter: initialData?.publishAfter
        ? String(initialData.publishAfter).slice(0, 10)
        : '',
      idx: initialData?.idx ?? undefined,
      app_visible: initialData?.app_visible ?? false,
      additional_tasks: initialData?.additional_tasks ?? [],
    },
  });

  const {
    fields: additionalTaskFields,
    append: appendAdditionalTask,
    remove: removeAdditionalTask,
  } = useFieldArray({
    control: form.control,
    name: 'additional_tasks',
  });

  const coverPreview = useMemo(() => {
    if (initialData?.cover_image) return getContentUrl(initialData.cover_image);
    return '';
  }, [initialData?.cover_image]);

  const updateStageDraft = (
    stageIndex: number,
    updater: (stage: MarkupTaskStageDraft) => MarkupTaskStageDraft
  ) => {
    setStages((current) =>
      current.map((stage, index) => (index === stageIndex ? updater(stage) : stage))
    );
  };

  const addStage = () => {
    setStages((current) => [...current, emptyStage(current.length)]);
    setExpandedStageIndex(stages.length);
    setExpandedSlideKey(`${stages.length}-0`);
  };

  const deleteStageDraft = (stageIndex: number) => {
    setStages((current) =>
      reorderByOrder(current.filter((_, index) => index !== stageIndex))
    );
    setExpandedStageIndex(Math.max(0, stageIndex - 1));
  };

  const moveStage = (stageIndex: number, direction: -1 | 1) => {
    const targetIndex = stageIndex + direction;
    if (targetIndex < 0 || targetIndex >= stages.length) return;

    setStages((current) => {
      const next = [...current];
      const temp = next[stageIndex];
      next[stageIndex] = next[targetIndex];
      next[targetIndex] = temp;
      return reorderByOrder(next);
    });
    setExpandedStageIndex(targetIndex);
  };

  const addSlide = (stageIndex: number) => {
    updateStageDraft(stageIndex, (stage) => ({
      ...stage,
      slides: [...stage.slides, emptySlide(stage.slides.length)],
    }));
  };

  const deleteSlideDraft = (stageIndex: number, slideIndex: number) => {
    updateStageDraft(stageIndex, (stage) => ({
      ...stage,
      slides: reorderByOrder(stage.slides.filter((_, index) => index !== slideIndex)),
    }));
  };

  const moveSlide = (stageIndex: number, slideIndex: number, direction: -1 | 1) => {
    updateStageDraft(stageIndex, (stage) => {
      const targetIndex = slideIndex + direction;
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
      nextElements.filter((element) => element.id).map((element) => String(element.id))
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
          throw new Error(`У нового слайда "${slide.name || 'Без названия'}" нет изображения`);
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

      await syncElements(slideId, slide.elements, existingSlide?.elements ?? []);
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const submitPromise = (async () => {
      ensureValidStages(stages);

      const publishAfter =
        values.publishAfter && values.publishAfter.length
          ? new Date(values.publishAfter).getTime()
          : undefined;

      const coverFile =
        values.cover_image?.[0] instanceof File ? values.cover_image[0] : undefined;

      let taskId = initialData?._id;

      if (initialData?._id) {
        const updated = await updateTask({
          id: initialData._id as Id<'markup_tasks'>,
          name: values.name,
          description: values.description,
          additional_tasks: values.additional_tasks,
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
          additional_tasks: values.additional_tasks,
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
    })();

    try {
      await toast.promise(submitPromise, {
        loading: 'Сохранение задачи на разметку...',
        success: (data) =>
          data.mode === 'updated'
            ? 'Задача на разметку обновлена'
            : 'Задача на разметку создана',
        error: (error) =>
          error instanceof Error
            ? error.message
            : 'Ошибка сохранения задачи на разметку',
      });
      router.push('/knowledge/markup-tasks');
      router.refresh();
    } catch (error) {
      console.error('Error saving markup task:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="publishAfter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дата публикации</FormLabel>
                  <FieldHint>
                    До этой даты задача может быть скрыта для обычных пользователей.
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
                    <FormLabel className="mb-0">Видимость в приложении</FormLabel>
                  </div>
                  <FieldHint>
                    Включите, если задача уже готова к показу пользователям.
                  </FieldHint>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="cover_image"
            render={({ field: { value: _value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Обложка</FormLabel>
                <FieldHint>
                  Главная картинка задачи для списка и карточки в админке.
                </FieldHint>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => onChange(event.target.files)}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {coverPreview && (
                  <div className="overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="h-64 w-full object-cover"
                    />
                  </div>
                )}
              </FormItem>
            )}
          />
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Связанные задачи</h2>
              <p className="text-xs text-muted-foreground">
                Дополнительные задания, которые логически связаны с этой разметкой.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                appendAdditionalTask({
                  name: '',
                  description: '',
                  task_id: '',
                  task_type: '',
                })
              }>
              Добавить задачу
            </Button>
          </div>

          <div className="space-y-4">
            {additionalTaskFields.map((field, index) => (
              <Card key={field.id} className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Задача {index + 1}</Badge>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeAdditionalTask(index)}>
                    Удалить
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`additional_tasks.${index}.name`}
                    render={({ field: itemField }) => (
                      <FormItem>
                        <FormLabel>Название</FormLabel>
                        <FieldHint>
                          Понятное имя связанной задачи для админки.
                        </FieldHint>
                        <FormControl>
                          <Input {...itemField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`additional_tasks.${index}.task_type`}
                    render={({ field: itemField }) => (
                      <FormItem>
                        <FormLabel>Тип задачи</FormLabel>
                        <FieldHint>
                          Например: `clinic_task`, `interactive_task`, `markup_task`.
                        </FieldHint>
                        <FormControl>
                          <Input {...itemField} placeholder="clinic_task / interactive_task" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`additional_tasks.${index}.task_id`}
                    render={({ field: itemField }) => (
                      <FormItem>
                        <FormLabel>ID задачи</FormLabel>
                        <FieldHint>
                          Идентификатор связанной сущности в базе.
                        </FieldHint>
                        <FormControl>
                          <Input {...itemField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`additional_tasks.${index}.description`}
                    render={({ field: itemField }) => (
                      <FormItem>
                        <FormLabel>Описание</FormLabel>
                        <FieldHint>
                          Короткое пояснение, зачем эта связанная задача нужна.
                        </FieldHint>
                        <FormControl>
                          <Input {...itemField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Этапы</h2>
              <p className="text-xs text-muted-foreground">
                Каждый этап объединяет свои слайды и контуры разметки.
              </p>
            </div>
            <Button type="button" onClick={addStage}>
              Добавить этап
            </Button>
          </div>

          {stages.map((stage, stageIndex) => (
            <Card key={stage.id ?? `stage-${stageIndex}`} className="p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={
                      expandedStageIndex === stageIndex ? 'default' : 'outline'
                    }
                    onClick={() => setExpandedStageIndex(stageIndex)}>
                    Этап {stageIndex + 1}
                  </Button>
                  <Badge variant="outline">Слайдов: {stage.slides.length}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveStage(stageIndex, -1)}>
                    Вверх
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveStage(stageIndex, 1)}>
                    Вниз
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteStageDraft(stageIndex)}>
                    Удалить этап
                  </Button>
                </div>
              </div>

              {expandedStageIndex === stageIndex && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Название этапа</div>
                      <FieldHint>
                        Видимое имя шага, по которому ориентируется админ.
                      </FieldHint>
                      <Input
                        value={stage.name}
                        onChange={(event) =>
                          updateStageDraft(stageIndex, (item) => ({
                            ...item,
                            name: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Element name</div>
                      <FieldHint>
                        Базовое имя сущности, которую пользователь ищет на слайдах.
                      </FieldHint>
                      <Input
                        value={stage.element_name}
                        onChange={(event) =>
                          updateStageDraft(stageIndex, (item) => ({
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
                        value={stage.description}
                        onChange={(event) =>
                          updateStageDraft(stageIndex, (item) => ({
                            ...item,
                            description: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Additional info (AI)</div>
                      <FieldHint>
                        Внутренний контекст или подсказка для AI-логики этапа.
                      </FieldHint>
                      <Textarea
                        value={stage.additional_info}
                        onChange={(event) =>
                          updateStageDraft(stageIndex, (item) => ({
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
                        value={stage.task_condition}
                        onChange={(event) =>
                          updateStageDraft(stageIndex, (item) => ({
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
                        value={stage.info}
                        onChange={(event) =>
                          updateStageDraft(stageIndex, (item) => ({
                            ...item,
                            info: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Base color</div>
                      <FieldHint>
                        Общий цвет всех контуров этого этапа, например `#ef4444`.
                      </FieldHint>
                      <Input
                        value={stage.base_color}
                        onChange={(event) =>
                          updateStageDraft(stageIndex, (item) => ({
                            ...item,
                            base_color: event.target.value,
                          }))
                        }
                        placeholder="#ef4444"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Слайды этапа</h3>
                        <p className="text-xs text-muted-foreground">
                          У каждого слайда обязательно должно быть изображение.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => addSlide(stageIndex)}>
                        Добавить слайд
                      </Button>
                    </div>

                    {stage.slides.map((slide, slideIndex) => {
                      const slideKey = `${stageIndex}-${slideIndex}`;

                      return (
                        <Card
                          key={slide.id ?? `slide-${slideKey}`}
                          className="p-4 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant={
                                  expandedSlideKey === slideKey
                                    ? 'default'
                                    : 'outline'
                                }
                                onClick={() => setExpandedSlideKey(slideKey)}>
                                Слайд {slideIndex + 1}
                              </Button>
                              <Badge variant="outline">
                                Контуров: {slide.elements.length}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => moveSlide(stageIndex, slideIndex, -1)}>
                                Вверх
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => moveSlide(stageIndex, slideIndex, 1)}>
                                Вниз
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  deleteSlideDraft(stageIndex, slideIndex)
                                }>
                                Удалить слайд
                              </Button>
                            </div>
                          </div>

                          {expandedSlideKey === slideKey && (
                            <div className="space-y-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <div className="text-sm font-medium">
                                    Название слайда
                                  </div>
                                  <FieldHint>
                                    Короткое имя слайда для навигации внутри этапа.
                                  </FieldHint>
                                  <Input
                                    value={slide.name}
                                    onChange={(event) =>
                                      updateSlideDraft(
                                        stageIndex,
                                        slideIndex,
                                        (item) => ({
                                          ...item,
                                          name: event.target.value,
                                        })
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <div className="text-sm font-medium">
                                    Base height
                                  </div>
                                  <FieldHint>
                                    Базовая высота для калибровки масштаба разметки.
                                  </FieldHint>
                                  <Input
                                    type="number"
                                    min={1}
                                    value={slide.base_height}
                                    onChange={(event) =>
                                      updateSlideDraft(
                                        stageIndex,
                                        slideIndex,
                                        (item) => ({
                                          ...item,
                                          base_height: Number(event.target.value || 512),
                                        })
                                      )
                                    }
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="text-sm font-medium">
                                  Описание слайда
                                </div>
                                <FieldHint>
                                  Дополнительный контекст по изображению и сцене.
                                </FieldHint>
                                <Textarea
                                  value={slide.description}
                                  onChange={(event) =>
                                    updateSlideDraft(stageIndex, slideIndex, (item) => ({
                                      ...item,
                                      description: event.target.value,
                                    }))
                                  }
                                />
                              </div>

                              <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                  <div className="text-sm font-medium">
                                    Изображение слайда
                                  </div>
                                  <FieldHint>
                                    Основное изображение, поверх которого строятся контуры.
                                  </FieldHint>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                      handleSlideImageChange(
                                        stageIndex,
                                        slideIndex,
                                        event.target.files?.[0]
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <div className="text-sm font-medium">
                                    Original width
                                  </div>
                                  <FieldHint>
                                    Исходная ширина изображения в пикселях.
                                  </FieldHint>
                                  <Input
                                    type="number"
                                    value={slide.original_width ?? ''}
                                    onChange={(event) =>
                                      updateSlideDraft(
                                        stageIndex,
                                        slideIndex,
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
                                  <FieldHint>
                                    Исходная высота изображения в пикселях.
                                  </FieldHint>
                                  <Input
                                    type="number"
                                    value={slide.original_height ?? ''}
                                    onChange={(event) =>
                                      updateSlideDraft(
                                        stageIndex,
                                        slideIndex,
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

                              {slide.image && (
                                <PolygonEditor
                                  image={slide.image}
                                  elements={slide.elements}
                                  defaultColor={stage.base_color}
                                  onChange={(elements) =>
                                    updateSlideDraft(stageIndex, slideIndex, (item) => ({
                                      ...item,
                                      elements: reorderByOrder(elements),
                                    }))
                                  }
                                />
                              )}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="flex gap-4">
          <Button type="submit">
            {initialData ? 'Сохранить изменения' : 'Создать задачу'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
        </div>
      </form>
    </Form>
  );
}
