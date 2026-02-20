'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
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
import { FeedbackQuestions } from '@/shared/ui/FeedBackQuestions/FeedbackQuestions';
import { ImagesField } from '@/shared/ui/ImagesField/ImagesField';
import { useState } from 'react';
import Image from 'next/image';
import { getContentUrl } from '@/shared/utils/url';
import { DiagnosesField } from './DiagnosesField';
import { Question } from '@/shared/models/types/QuestionType';
import QuestionCreator from '@/components/question-creator';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { useInsightQuestions } from '@/shared/hooks/use-insight-questions';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Search } from 'lucide-react';
import type { BaseInsightQuestionDto } from '@/app/api/client/schemas';
import { useAction, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import type { FunctionReturnType } from 'convex/server';

const publishAfterSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && value.length === 0 ? undefined : value,
  z.string().optional()
);

const formSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  difficulty: z.number().min(1).max(10),
  description: z.string().min(1, 'Описание обязательно'),
  cover_image: z.any(),
  images: z
    .array(
      z.object({
        image: z.any(),
        is_open: z.boolean(),
      })
    )
    .default([]),
  additional_info: z.string().optional(),
  ai_scenario: z.string().optional(),
  stars: z.number().min(0),
  nozology: z.string().min(1, 'Нозология обязательна'),
  publishAfter: publishAfterSchema,
  idx: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
    z.number().int().nonnegative().optional()
  ),
  interviewMode: z.boolean().default(false),
  interviewQuestions: z.array(z.string()).default([]),
  interviewAnalyticQuestions: z.array(z.string()).default([]),
  feedback: z
    .array(
      z.object({
        question: z.string(),
        has_correct: z.boolean(),
        answers: z
          .array(
            z.object({
              answer: z.string(),
              is_correct: z.boolean(),
            })
          )
          .optional(),
        analytic_questions: z.array(z.string()).optional(),
      })
    )
    .default([]),
  endoscopy_video: z.any().optional(),
  endoscopy_model: z.any().optional(),
  timecodes: z
    .array(
      z.object({
        time: z.preprocess(
          (value) =>
            value === '' || value === null || value === undefined
              ? undefined
              : Number(value),
          z.number().nonnegative()
        ),
        title: z.string().optional().default(''),
        description: z.string().optional(),
      })
    )
    .default([]),
  app_visible: z.boolean().default(false),
  references: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
      })
    )
    .default([]),
});

interface ClinicTaskFormProps {
  initialData?: NonNullable<
    FunctionReturnType<typeof api.functions.clinic_tasks.getById>
  >;
}

export function ClinicTaskForm({ initialData }: ClinicTaskFormProps) {
  const router = useRouter();
  const nozologies = useQuery(api.functions.nozologies.list, {}) ?? [];
  const createClinicTask = useAction(api.functions.clinic_tasks.create);
  const updateClinicTask = useAction(api.functions.clinic_tasks.updateAction);
  const [newInterviewQuestion, setNewInterviewQuestion] = useState('');
  const [interviewQuestionsList, setInterviewQuestionsList] = useState<
    string[]
  >(initialData?.interviewQuestions || []);
  const [references, setReferences] = useState<
    Array<{ name: string; url: string }>
  >(initialData?.references || []);
  const [newReferenceName, setNewReferenceName] = useState('');
  const [newReferenceUrl, setNewReferenceUrl] = useState('');

  // Состояние для аналитических вопросов интервью
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyticDialogOpen, setIsAnalyticDialogOpen] = useState(false);
  const [selectedAnalyticQuestions, setSelectedAnalyticQuestions] = useState<
    string[]
  >(
    Array.isArray(initialData?.interviewAnalyticQuestions)
      ? initialData.interviewAnalyticQuestions
      : []
  );
  const [iqPage, setIqPage] = useState(1);
  const [iqSearch, setIqSearch] = useState('');
  const iqLimit = 100;
  const iqSkip = (iqPage - 1) * iqLimit;
  const { questions: analyticQuestionsRaw } = useInsightQuestions(
    iqSearch,
    iqLimit,
    iqSkip
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      difficulty: initialData?.difficulty || 1,
      description: initialData?.description || '',
      additional_info: initialData?.additional_info || '',
      ai_scenario: initialData?.ai_scenario || '',
      stars: initialData?.stars || 0,
      nozology: initialData?.nozology || '',
      feedback: initialData?.feedback || [],
      cover_image: undefined,
      images: initialData?.images || [],
      interviewMode: initialData?.interviewMode || false,
      interviewQuestions: initialData?.interviewQuestions || [],
      interviewAnalyticQuestions: Array.isArray(
        initialData?.interviewAnalyticQuestions
      )
        ? initialData.interviewAnalyticQuestions
        : [],
      publishAfter: initialData?.publishAfter
        ? typeof initialData.publishAfter === 'string'
          ? initialData.publishAfter.slice(0, 10)
          : initialData.publishAfter instanceof Date
            ? initialData.publishAfter.toISOString().slice(0, 10)
            : String(initialData.publishAfter).slice(0, 10)
        : '',
      idx: initialData?.idx ?? undefined,
      endoscopy_video: initialData?.endoscopy_video || null,
      endoscopy_model: initialData?.endoscopy_model || null,
      timecodes: initialData?.timecodes || [],
      app_visible: initialData?.app_visible || false,
      references: initialData?.references || [],
    },
  });

  const {
    fields: timecodeFields,
    append: appendTimecode,
    remove: removeTimecode,
  } = useFieldArray({
    control: form.control,
    name: 'timecodes',
  });

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result?.toString() || '';
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const uploadEndoscopyFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload-video', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || 'Ошибка загрузки файла');
    }
    return data.path as string;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const submitPromise = (async () => {
      const publishAfter =
        values.publishAfter && values.publishAfter.length
          ? new Date(values.publishAfter).getTime()
          : undefined;

      const coverFile = values.cover_image?.[0] instanceof File ? values.cover_image[0] : undefined;
      const endoscopyVideoCleared = values.endoscopy_video === null;
      const endoscopyModelCleared = values.endoscopy_model === null;
      const endoscopyVideoFile =
        values.endoscopy_video?.[0] instanceof File
          ? values.endoscopy_video[0]
          : undefined;
      const endoscopyModelFile =
        values.endoscopy_model?.[0] instanceof File
          ? values.endoscopy_model[0]
          : undefined;

      const endoscopyVideoPath = endoscopyVideoFile
        ? await uploadEndoscopyFile(endoscopyVideoFile)
        : undefined;
      const endoscopyModelPath = endoscopyModelFile
        ? await uploadEndoscopyFile(endoscopyModelFile)
        : undefined;

      const images = await Promise.all(
        values.images.map(async (img) => {
          if (typeof img.image === 'string') {
            return { image: img.image, is_open: img.is_open };
          }
          const file = img.image?.[0];
          if (!file) {
            return { image: '', is_open: img.is_open };
          }
          return {
            image: {
              base64: await fileToBase64(file),
              contentType: file.type || 'application/octet-stream',
            },
            is_open: img.is_open,
          };
        })
      );

      const timecodes = (values.timecodes || [])
        .filter((item) => item.time !== undefined && !Number.isNaN(item.time))
        .map((item) => ({
          time: Number(item.time),
          title: item.title ?? '',
          ...(item.description ? { description: item.description } : {}),
        }));

      if (initialData?._id) {
        const args: {
          id: Id<'clinic_tasks'>;
          name?: string;
          difficulty?: number;
          description?: string;
          additional_info?: string;
          ai_scenario?: string;
          stars?: number;
          nozology?: string;
          publishAfter?: number;
          interviewMode?: boolean;
          interviewQuestions?: string[];
          interviewAnalyticQuestions?: string[];
          app_visible?: boolean;
          references?: Array<{ name: string; url: string }>;
          feedback?: z.infer<typeof formSchema>['feedback'];
          questions?: Question[];
          images?: Array<{
            image:
              | string
              | { base64: string; contentType: string };
            is_open: boolean;
          }>;
          cover?: { base64: string; contentType: string };
          endoscopy_videoPath?: string;
          endoscopy_modelPath?: string;
          endoscopy_video?: null;
          endoscopy_model?: null;
          idx?: number;
          timecodes?: Array<{ time: number; title: string; description?: string }>;
        } = {
          id: initialData._id as Id<'clinic_tasks'>,
          name: values.name,
          difficulty: values.difficulty,
          description: values.description,
          additional_info: values.additional_info || '',
          ai_scenario: values.ai_scenario || '',
          stars: values.stars,
          nozology: values.nozology,
          publishAfter,
          interviewMode: values.interviewMode,
          interviewQuestions: interviewQuestionsList,
          interviewAnalyticQuestions: selectedAnalyticQuestions,
          app_visible: values.app_visible,
          references,
          feedback: values.feedback,
          questions,
          images,
          ...(timecodes.length ? { timecodes } : {}),
        };

        if (coverFile) {
          args.cover = {
            base64: await fileToBase64(coverFile),
            contentType: coverFile.type || 'application/octet-stream',
          };
        }
        if (endoscopyVideoPath) {
          args.endoscopy_videoPath = endoscopyVideoPath;
        } else if (endoscopyVideoCleared) {
          args.endoscopy_video = null;
        }
        if (endoscopyModelPath) {
          args.endoscopy_modelPath = endoscopyModelPath;
        } else if (endoscopyModelCleared) {
          args.endoscopy_model = null;
        }
        if (values.idx !== undefined) {
          args.idx = values.idx;
        }

        await updateClinicTask(args);
        return { mode: 'updated' as const };
      }

      if (!coverFile) {
        throw new Error('Обложка обязательна при создании задачи');
      }

      await createClinicTask({
        name: values.name,
        difficulty: values.difficulty,
        cover: {
          base64: await fileToBase64(coverFile),
          contentType: coverFile.type || 'application/octet-stream',
        },
        images,
        description: values.description,
        questions,
        additional_info: values.additional_info || '',
        ai_scenario: values.ai_scenario || '',
        stars: values.stars,
        feedback: values.feedback,
        nozology: values.nozology,
        publishAfter,
        interviewMode: values.interviewMode,
        interviewQuestions: interviewQuestionsList,
        interviewAnalyticQuestions: selectedAnalyticQuestions,
        app_visible: values.app_visible,
        references,
        ...(endoscopyVideoPath
          ? {
              endoscopy_videoPath: endoscopyVideoPath,
            }
          : {}),
        ...(endoscopyModelPath
          ? {
              endoscopy_modelPath: endoscopyModelPath,
            }
          : {}),
        ...(values.idx !== undefined ? { idx: values.idx } : {}),
        ...(timecodes.length ? { timecodes } : {}),
      });
      return { mode: 'created' as const };
    })();

    try {
      await toast.promise(submitPromise, {
        loading: 'Сохранение задачи...',
        success: (data) =>
          data.mode === 'updated'
            ? 'Задача успешно обновлена'
            : 'Задача успешно создана',
        error: 'Ошибка сохранения задачи',
      });
      router.push('/knowledge/clinic-tasks');
      router.refresh();
    } catch (error) {
      console.error('Error saving clinic task:', error);
      return;
    }
  };

  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions || []
  );

  // Тип для более безопасного обращения к полям вопроса
  type AnalyticQuestion = {
    id: string;
    title: string;
    prompt: string;
  };

  // Создаем безопасную версию вопросов с гарантированными полями
  const analyticQuestions: AnalyticQuestion[] = analyticQuestionsRaw.map(
    (q) => ({
      id: q.id || '',
      title: q.title || '',
      prompt: q.prompt || '',
    })
  );

  // Функции для работы с аналитическими вопросами
  const openAnalyticsDialog = () => {
    setSearchQuery(''); // Сбрасываем поиск при каждом открытии
    setIsAnalyticDialogOpen(true);
  };

  const saveAnalyticQuestions = () => {
    setIsAnalyticDialogOpen(false);
  };

  const toggleAnalyticQuestion = (id: string) => {
    setSelectedAnalyticQuestions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddInterviewQuestion = () => {
    if (newInterviewQuestion.trim()) {
      setInterviewQuestionsList([
        ...interviewQuestionsList,
        newInterviewQuestion.trim(),
      ]);
      setNewInterviewQuestion('');
    }
  };

  const handleRemoveInterviewQuestion = (index: number) => {
    const newQuestions = [...interviewQuestionsList];
    newQuestions.splice(index, 1);
    setInterviewQuestionsList(newQuestions);
  };

  const handleAddReference = () => {
    if (newReferenceName.trim() && newReferenceUrl.trim()) {
      setReferences([
        ...references,
        { name: newReferenceName.trim(), url: newReferenceUrl.trim() },
      ]);
      setNewReferenceName('');
      setNewReferenceUrl('');
    }
  };

  const handleRemoveReference = (index: number) => {
    const newReferences = [...references];
    newReferences.splice(index, 1);
    setReferences(newReferences);
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
                <FormControl>
                  <Input {...field} placeholder="Введите название" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Сложность (1-10)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stars"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Звёзды</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Описание</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Введите описание" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="publishAfter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Дата публикации</FormLabel>
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
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Введите индекс..."
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? undefined : Number(e.target.value)
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
            name="additional_info"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Дополнительная информация</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Дополнительная информация"
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
                <FormControl>
                  <Textarea {...field} placeholder="Опишите AI сценарий" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nozology"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Нозология</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
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
            name="cover_image"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Обложка</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onChange(e.target.files)}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {initialData?.cover_image && (
                  <div className="relative aspect-video w-full">
                    <Image
                      src={getContentUrl(initialData.cover_image)}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endoscopy_video"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Видео эндоскопии</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => onChange(e.target.files)}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {initialData?.endoscopy_video &&
                  form.watch('endoscopy_video') && (
                    <div className="relative flex flex-row items-center gap-2">
                      <p className="text-green-500">Видео загружено</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          form.setValue('endoscopy_video', null);
                        }}>
                        Удалить
                      </Button>
                    </div>
                  )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endoscopy_model"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Модель эндоскопии</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    onChange={(e) => onChange(e.target.files)}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {initialData?.endoscopy_model &&
                  form.watch('endoscopy_model') && (
                    <div className="relative flex flex-row items-center gap-2">
                      <p className="text-green-500">Модель загружена</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          form.setValue('endoscopy_model', null);
                        }}>
                        Удалить
                      </Button>
                    </div>
                  )}
              </FormItem>
            )}
          />

          <div className="my-4 space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Таймкоды</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendTimecode({ time: 0, title: '', description: '' })
                }>
                Добавить таймкод
              </Button>
            </div>

            {timecodeFields.map((field, index) => (
              <div
                key={field.id}
                className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`timecodes.${index}.time`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Время (сек)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="Например, 10"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ''
                                  ? undefined
                                  : Number(e.target.value)
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
                    name={`timecodes.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Заголовок</FormLabel>
                        <FormControl>
                          <Input placeholder="Название" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`timecodes.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Описание (необязательно)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeTimecode(index)}>
                    Удалить
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="my-4">
            <FormField
              control={form.control}
              name="interviewMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Режим интервью</FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          {form.watch('interviewMode') && (
            <div className="my-4">
              <FormLabel>Вопросы интервью</FormLabel>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="Добавить вопрос интервью"
                  value={newInterviewQuestion}
                  onChange={(e) => setNewInterviewQuestion(e.target.value)}
                />
                <Button
                  type="button"
                  onClick={handleAddInterviewQuestion}
                  variant="secondary">
                  Добавить
                </Button>
              </div>
              <div className="mt-4">
                <ul className="space-y-2">
                  {interviewQuestionsList.map((question, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <span>{question}</span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveInterviewQuestion(index)}>
                        Удалить
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {form.watch('interviewMode') && (
            <div className="my-4">
              <FormLabel>Аналитические вопросы интервью</FormLabel>
              {selectedAnalyticQuestions.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalyticQuestions.map((id: string) => {
                      const question = analyticQuestions.find(
                        (q) => q.id === id
                      );
                      return (
                        <Badge key={id} variant="secondary">
                          {question
                            ? `${question.title.substring(0, 30)}...`
                            : id}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openAnalyticsDialog}
                className="mt-2">
                <BarChart className="h-4 w-4 mr-2" />
                {selectedAnalyticQuestions.length > 0
                  ? 'Изменить аналитические вопросы'
                  : 'Добавить аналитические вопросы'}
              </Button>
            </div>
          )}

          <QuestionCreator questions={questions} setQuestions={setQuestions} />

          <FormField
            control={form.control}
            name="app_visible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Видимость в приложении</FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="my-4">
            <FormLabel>Ссылки (References)</FormLabel>
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Название ссылки"
                  value={newReferenceName}
                  onChange={(e) => setNewReferenceName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="URL"
                  value={newReferenceUrl}
                  onChange={(e) => setNewReferenceUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddReference}
                  variant="secondary">
                  Добавить
                </Button>
              </div>
              <div className="mt-4">
                <ul className="space-y-2">
                  {references.map((ref, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <span>
                        <strong>{ref.name}:</strong> {ref.url}
                      </span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveReference(index)}>
                        Удалить
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <ImagesField />
        </Card>

        <Card className="p-6">
          <FeedbackQuestions />
        </Card>

        <div className="flex gap-4">
          <Button type="submit">
            {initialData ? 'Сохранить изменения' : 'Создать клиническую задачу'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
        </div>

        <Dialog
          open={isAnalyticDialogOpen}
          onOpenChange={setIsAnalyticDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Выбор аналитических вопросов для интервью
              </DialogTitle>
            </DialogHeader>

            <div className="relative my-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск вопросов..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>

            <div className="mb-2">
              <Input
                placeholder="Поиск вопросов..."
                value={iqSearch}
                onChange={(e) => setIqSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {analyticQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-start border rounded-md p-2 space-x-2">
                    <Checkbox
                      id={`analytic-${question.id}`}
                      checked={selectedAnalyticQuestions.includes(question.id)}
                      onCheckedChange={() =>
                        toggleAnalyticQuestion(question.id)
                      }
                    />
                    <label
                      htmlFor={`analytic-${question.id}`}
                      className="text-sm leading-tight cursor-pointer">
                      <span className="font-bold">{question.title}</span> <br />{' '}
                      <br /> {question.prompt}
                    </label>
                  </div>
                ))}

                {analyticQuestions.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? 'Нет результатов по вашему запросу'
                      : 'Нет доступных аналитических вопросов'}
                  </p>
                )}
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIqPage((p) => Math.max(1, p - 1))}
                disabled={iqPage === 1}>
                Назад
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (analyticQuestions.length === iqLimit)
                    setIqPage((p) => p + 1);
                }}
                disabled={analyticQuestions.length < iqLimit}>
                Вперед
              </Button>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAnalyticDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={saveAnalyticQuestions}>Сохранить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </Form>
  );
}
