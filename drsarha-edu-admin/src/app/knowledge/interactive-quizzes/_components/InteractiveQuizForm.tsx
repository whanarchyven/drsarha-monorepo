'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

import Image from 'next/image';
import { getContentUrl } from '@/shared/utils/url';
import QuestionCreator from '@/components/question-creator';
import { useEffect, useState } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import type { FunctionReturnType } from 'convex/server';
import type { Question } from '@/shared/models/types/QuestionType';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const publishAfterSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && value.length === 0 ? undefined : value,
  z.string().optional()
);

const formSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),

  cover_image: z.any(),
  // Редактор вопросов управляет стейтом отдельно; не валидируем здесь
  questions: z.any().optional().default([]),
  available_errors: z.number().min(0),
  stars: z.number().min(0).max(5),
  nozology: z.string().min(1, 'Нозология обязательна'),
  publishAfter: publishAfterSchema,
  idx: z.preprocess(
    (value) =>
      value === '' || value === null || value === undefined
        ? undefined
        : Number(value),
    z.number().int().nonnegative().optional()
  ),
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
        analytic_questions: z.array(z.string()).default([]),
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

interface InteractiveQuizFormProps {
  initialData?: NonNullable<
    FunctionReturnType<typeof api.functions.interactive_quizzes.getById>
  >;
}

export function InteractiveQuizForm({ initialData }: InteractiveQuizFormProps) {
  const router = useRouter();
  const nozologies = useQuery(api.functions.nozologies.list, {}) ?? [];
  const createInteractiveQuiz = useAction(
    api.functions.interactive_quizzes.create
  );
  const updateInteractiveQuiz = useAction(
    api.functions.interactive_quizzes.updateAction
  );

  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions || []
  );
  const [references, setReferences] = useState<
    Array<{ name: string; url: string }>
  >(initialData?.references || []);
  const [newReferenceName, setNewReferenceName] = useState('');
  const [newReferenceUrl, setNewReferenceUrl] = useState('');

  const normalizePublishAfter = (
    value: string | number | Date | undefined
  ): string => {
    if (!value) return '';
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === 'number') {
      return new Date(value).toISOString().slice(0, 10);
    }
    const asNumber = Number(value);
    if (!Number.isNaN(asNumber) && value.trim() !== '') {
      return new Date(asNumber).toISOString().slice(0, 10);
    }
    return value.slice(0, 10);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      available_errors: initialData?.available_errors || 0,
      stars: initialData?.stars || 0,
      nozology: initialData?.nozology || '',
      questions: initialData?.questions || [],
      feedback: initialData?.feedback || [],
      cover_image: undefined,
      publishAfter: normalizePublishAfter(initialData?.publishAfter),
      idx: initialData?.idx ?? undefined,
      app_visible: initialData?.app_visible || false,
      references: initialData?.references || [],
    },
  });

  useEffect(() => {
    if (!initialData) return;
    form.reset({
      name: initialData.name || '',
      available_errors: initialData.available_errors || 0,
      stars: initialData.stars || 0,
      nozology: initialData.nozology || '',
      questions: initialData.questions || [],
      feedback: initialData.feedback || [],
      cover_image: undefined,
      publishAfter: normalizePublishAfter(initialData.publishAfter),
      idx: initialData.idx ?? undefined,
      app_visible: initialData.app_visible || false,
      references: initialData.references || [],
    });
    setQuestions(initialData.questions || []);
    setReferences(initialData.references || []);
  }, [form, initialData]);

  // Подсветка первой ошибки Zod и фокус на поле
  const onInvalid = (errors: any) => {
    const getFirstErrorField = (errObj: any, parent = ''): string | null => {
      for (const key of Object.keys(errObj || {})) {
        const node = errObj[key];
        const name = parent ? `${parent}.${key}` : key;
        if (node && typeof node === 'object') {
          if (node.message) return name;
          const nested = getFirstErrorField(node, name);
          if (nested) return nested;
        }
      }
      return null;
    };
    const first = getFirstErrorField(errors);
    if (first) {
      // @ts-ignore — имя может быть вложенным (array/object)
      form.setFocus(first);
    }
    toast.error('Проверьте обязательные поля и исправьте ошибки формы');
    console.error('Form validation errors:', errors);
  };

  const fileToBase64 = (file: File | Blob) =>
    new Promise<{ base64: string; contentType: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result?.toString() || '';
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve({
          base64,
          contentType: (file as File).type || 'application/octet-stream',
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const blobUrlToBase64 = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return await fileToBase64(blob);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const submitPromise = (async () => {
      if (!initialData && !values.cover_image?.[0]) {
        throw new Error(
          'Обложка обязательна при создании интерактивной викторины'
        );
      }

      const publishAfter =
        values.publishAfter && values.publishAfter.length
          ? new Date(values.publishAfter).getTime()
          : undefined;

      const coverFile =
        values.cover_image?.[0] instanceof File
          ? values.cover_image[0]
          : undefined;

      const questionsData = await Promise.all(
        questions.map(async (question) => {
          const questionData: any = {
            question: question.question,
            type: question.type,
            correct_answer_comment: question.correct_answer_comment,
          };

          if (question.image) {
            if (typeof question.image === 'string') {
              if (question.image.startsWith('blob:')) {
                questionData.image = await blobUrlToBase64(question.image);
              } else {
                questionData.image = question.image;
              }
            }
          }

          if (question.type === 'variants' && question.answers) {
            questionData.answers = await Promise.all(
              question.answers.map(async (answer) => {
                const answerData: any = {
                  answer: answer.answer,
                  isCorrect: answer.isCorrect,
                };

                if (answer.image) {
                  if (typeof answer.image === 'string') {
                    if (answer.image.startsWith('blob:')) {
                      answerData.image = await blobUrlToBase64(answer.image);
                    } else {
                      answerData.image = answer.image;
                    }
                  }
                }

                return answerData;
              })
            );
          } else if (question.type === 'text') {
            questionData.answer = question.answer;
            if ('additional_info' in question && question.additional_info) {
              questionData.additional_info = question.additional_info;
            }
          }

          return questionData;
        })
      );

      const feedbackData = values.feedback.map((item) => ({
        ...item,
        analytic_questions: item.analytic_questions || [],
      }));

      if (initialData?._id) {
        const args: {
          id: Id<'interactive_quizzes'>;
          name?: string;
          cover?: { base64: string; contentType: string };
          questions?: any[];
          available_errors?: number;
          feedback?: z.infer<typeof formSchema>['feedback'];
          nozology?: string;
          stars?: number;
          publishAfter?: number;
          app_visible?: boolean;
          references?: Array<{ name: string; url: string }>;
          idx?: number;
        } = {
          id: initialData._id as Id<'interactive_quizzes'>,
          name: values.name,
          questions: questionsData,
          available_errors: values.available_errors,
          feedback: feedbackData,
          nozology: values.nozology,
          stars: values.stars,
          publishAfter,
          app_visible: values.app_visible,
          references,
        };

        if (coverFile) {
          args.cover = await fileToBase64(coverFile);
        }
        if (values.idx !== undefined) {
          args.idx = values.idx;
        }

        await updateInteractiveQuiz(args);
        return { mode: 'updated' as const };
      }

      await createInteractiveQuiz({
        name: values.name,
        cover: await fileToBase64(coverFile!),
        questions: questionsData,
        available_errors: values.available_errors,
        feedback: feedbackData,
        nozology: values.nozology,
        stars: values.stars,
        publishAfter,
        app_visible: values.app_visible,
        references,
        ...(values.idx !== undefined ? { idx: values.idx } : {}),
      });

      return { mode: 'created' as const };
    })();

    try {
      await toast.promise(submitPromise, {
        loading: 'Сохранение интерактивной викторины...',
        success: (data) =>
          data.mode === 'updated'
            ? 'Интерактивная викторина успешно обновлена'
            : 'Интерактивная викторина успешно создана',
        error: 'Ошибка сохранения интерактивной викторины',
      });
      router.push('/knowledge/interactive-quizzes');
      router.refresh();
    } catch (error) {
      console.error('Error saving interactive quiz:', error);
      return;
    }
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
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        noValidate
        className="space-y-8">
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
              name="stars"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Звезды (0-5)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={5}
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
              name="available_errors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Доступные ошибки</FormLabel>
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
          <FeedbackQuestions />
        </Card>

        <div className="flex gap-4">
          <Button type="submit">
            {initialData
              ? 'Сохранить изменения'
              : 'Создать интерактивную викторину'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
        </div>
      </form>
    </Form>
  );
}
