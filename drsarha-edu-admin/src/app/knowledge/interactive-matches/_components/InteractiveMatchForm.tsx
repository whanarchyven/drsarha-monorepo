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
import { useState, useEffect } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import type { FunctionReturnType } from 'convex/server';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowDown, ArrowUp } from 'lucide-react';

const publishAfterSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && value.length === 0 ? undefined : value,
  z.string().optional()
);

const formSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  cover_image: z.any(),
  answers: z.array(z.string()).default([]),
  available_errors: z.number().min(0),
  stars: z.number().min(0).max(5),
  nozology: z.string().min(1, 'Нозология обязательна'),
  publishAfter: publishAfterSchema,
  idx: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
    z.number().int().nonnegative().optional()
  ),
  // interviewMode/interviewQuestions removed for this module
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

interface InteractiveMatchFormProps {
  initialData?: NonNullable<
    FunctionReturnType<typeof api.functions.interactive_matches.getById>
  >;
}

export function InteractiveMatchForm({
  initialData,
}: InteractiveMatchFormProps) {
  const router = useRouter();
  const nozologies = useQuery(api.functions.nozologies.list, {}) ?? [];
  const createInteractiveMatch = useAction(api.functions.interactive_matches.create);
  const updateInteractiveMatch = useAction(api.functions.interactive_matches.updateAction);
  const [newAnswer, setNewAnswer] = useState('');
  const [answerList, setAnswerList] = useState<string[]>(
    initialData?.answers || []
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

  const handleAddAnswer = () => {
    if (newAnswer.trim()) {
      setAnswerList([...answerList, newAnswer.trim()]);
      setNewAnswer('');
    }
  };

  const handleRemoveAnswer = (index: number) => {
    const newAnswers = [...answerList];
    newAnswers.splice(index, 1);
    setAnswerList(newAnswers);
  };

  const moveAnswer = (index: number, direction: 'up' | 'down') => {
    setAnswerList((prev) => {
      const next = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      cover_image: initialData?.cover_image || null,
      available_errors: initialData?.available_errors || 0,
      answers: initialData?.answers || [],
      stars: initialData?.stars || 0,
      nozology: initialData?.nozology || '',
      feedback: initialData?.feedback || [],
      // interview fields removed
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
      cover_image: initialData.cover_image || null,
      available_errors: initialData.available_errors || 0,
      answers: initialData.answers || [],
      stars: initialData.stars || 0,
      nozology: initialData.nozology || '',
      feedback: initialData.feedback || [],
      // interview fields removed
      publishAfter: normalizePublishAfter(initialData.publishAfter),
      idx: initialData.idx ?? undefined,
      app_visible: initialData.app_visible || false,
      references: initialData.references || [],
    });
    setAnswerList(initialData.answers || []);
    // interview fields removed
    setReferences(initialData.references || []);
  }, [form, initialData]);

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

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const submitPromise = (async () => {
      const publishAfter =
        values.publishAfter && values.publishAfter.length
          ? new Date(values.publishAfter).getTime()
          : undefined;

      const coverFile =
        values.cover_image && values.cover_image instanceof File
          ? values.cover_image
          : undefined;

      if (!initialData?._id && !coverFile) {
        throw new Error('Обложка обязательна при создании');
      }

      if (initialData?._id) {
        const args: {
          id: Id<'interactive_matches'>;
          name?: string;
          cover?: { base64: string; contentType: string };
          answers?: string[];
          available_errors?: number;
          feedback?: z.infer<typeof formSchema>['feedback'];
          nozology?: string;
          stars?: number;
          publishAfter?: number;
          app_visible?: boolean;
          references?: Array<{ name: string; url: string }>;
          idx?: number;
        } = {
          id: initialData._id as Id<'interactive_matches'>,
          name: values.name,
          answers: answerList,
          available_errors: values.available_errors,
          feedback: values.feedback,
          nozology: values.nozology,
          stars: values.stars,
          publishAfter,
          app_visible: values.app_visible,
          references,
        };

        if (coverFile) {
          args.cover = {
            base64: await fileToBase64(coverFile),
            contentType: coverFile.type || 'application/octet-stream',
          };
        }
        if (values.idx !== undefined) {
          args.idx = values.idx;
        }

        await updateInteractiveMatch(args);
        return { mode: 'updated' as const };
      }

      await createInteractiveMatch({
        name: values.name,
        cover: {
          base64: await fileToBase64(coverFile!),
          contentType: coverFile!.type || 'application/octet-stream',
        },
        answers: answerList,
        available_errors: values.available_errors,
        feedback: values.feedback,
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
        loading: 'Сохранение интерактивного соединения...',
        success: (data) =>
          data.mode === 'updated'
            ? 'Интерактивное соединение обновлено'
            : 'Интерактивное соединение создано',
        error: 'Ошибка при сохранении',
      });
      router.push('/knowledge/interactive-matches');
      router.refresh();
    } catch (error) {
      console.error('Error submitting form:', error);
      return;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card className="p-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Название</FormLabel>
                <FormControl>
                  <Input placeholder="Введите название" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="my-4">
            <FormField
              control={form.control}
              name="cover_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Обложка</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          field.onChange(file);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {initialData?.cover_image && (
                    <div className="mt-2">
                      <p className="text-sm mb-2">Текущая обложка:</p>
                      <div className="relative h-40 w-full">
                        <Image
                          src={getContentUrl(initialData.cover_image)}
                          alt="Cover"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />
          </div>

          <div className="my-4">
            <FormLabel>Ответы (в правильном порядке)</FormLabel>
            <div className="flex items-center gap-2 mt-2">
              <Input
                placeholder="Добавить ответ"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
              <Button
                type="button"
                onClick={handleAddAnswer}
                variant="secondary">
                Добавить
              </Button>
            </div>
            <div className="mt-4">
              <ul className="space-y-2">
                {answerList.map((answer, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <span>{answer}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => moveAnswer(index, 'up')}
                        disabled={index === 0}>
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => moveAnswer(index, 'down')}
                        disabled={index === answerList.length - 1}>
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveAnswer(index)}>
                        Удалить
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 my-4">
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

            <FormField
              control={form.control}
              name="stars"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Звезды </FormLabel>
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
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="my-4">
            <FormField
              control={form.control}
              name="nozology"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Нозология</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}>
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
          </div>

          <div className="my-4">
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
          </div>

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

          <div className="mt-8">
            <FormLabel>Обратная связь</FormLabel>
            <FeedbackQuestions />
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/knowledge/interactive-matches')}>
            Отмена
          </Button>
          <Button type="submit">{initialData ? 'Обновить' : 'Создать'}</Button>
        </div>
      </form>
    </Form>
  );
}
