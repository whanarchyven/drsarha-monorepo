'use client';

import { useForm } from 'react-hook-form';
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
import { useAction, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import type { Id } from '@convex/_generated/dataModel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FeedbackQuestions } from '@/shared/ui/FeedBackQuestions/FeedbackQuestions';
import { getContentUrl } from '@/shared/utils/url';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { toast } from 'sonner';

const publishAfterSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && value.length === 0 ? undefined : value,
  z.string().optional()
);

const formSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  duration: z.string().min(1, 'Длительность обязательна'),
  stars: z.number().min(0).default(0),
  nozology: z.string().min(1, 'Нозология обязательна'),
  cover_image: z.any(),
  video: z.any(),
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
        analytic_questions: z.array(z.string()).optional(),
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

interface LectionFormProps {
  initialData?: NonNullable<
    FunctionReturnType<typeof api.functions.lections.getById>
  >;
}

export function LectionForm({ initialData }: LectionFormProps) {
  const router = useRouter();
  const nozologies = useQuery(api.functions.nozologies.list, {}) ?? [];
  const createLection = useAction(api.functions.lections.create);
  const updateLection = useAction(api.functions.lections.updateAction);
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
      description: initialData?.description || '',
      duration: initialData?.duration || '',
      stars: initialData?.stars || 0,
      nozology: initialData?.nozology ? String(initialData.nozology) : '',
      feedback: initialData?.feedback || [],
      cover_image: undefined,
      video: undefined,
      publishAfter: normalizePublishAfter(initialData?.publishAfter),
      idx: initialData?.idx ?? undefined,
      app_visible: initialData?.app_visible || false,
      references: initialData?.references || [],
    },
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

  const uploadVideo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload-video', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || 'Ошибка загрузки видео');
    }
    return data.path as string;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const submitPromise = (async () => {
      const publishAfter =
        values.publishAfter && values.publishAfter.length
          ? new Date(values.publishAfter).getTime()
          : undefined;

      const coverFile = values.cover_image?.[0];
      const videoFile = values.video?.[0];

      if (!initialData?._id) {
        if (!coverFile) {
          form.setError('cover_image', {
            type: 'manual',
            message: 'Обложка обязательна',
          });
          throw new Error('Обложка обязательна');
        }
        if (!videoFile) {
          form.setError('video', {
            type: 'manual',
            message: 'Видео обязательно',
          });
          throw new Error('Видео обязательно');
        }
      }

      const videoPath = videoFile ? await uploadVideo(videoFile) : undefined;

      if (initialData?._id) {
        const args: {
          id: Id<'lections'>;
          name?: string;
          description?: string;
          duration?: string;
          stars?: number;
          nozology?: string;
          feedback?: unknown;
          publishAfter?: number;
          app_visible?: boolean;
          idx?: number;
          references?: Array<{ name: string; url: string }>;
          cover?: { base64: string; contentType: string };
          video?: { base64: string; contentType: string };
          videoPath?: string;
        } = {
          id: initialData._id as Id<'lections'>,
          name: values.name,
          description: values.description,
          duration: values.duration,
          stars: values.stars,
          nozology: values.nozology,
          feedback: values.feedback,
          publishAfter,
          app_visible: values.app_visible,
          references,
          ...(videoPath ? { videoPath } : {}),
        };
        if (values.idx !== undefined) {
          args.idx = values.idx;
        }
        if (coverFile) {
          args.cover = {
            base64: await fileToBase64(coverFile),
            contentType: coverFile.type || 'application/octet-stream',
          };
        }
        await updateLection(args);
        return { mode: 'updated' as const };
      }

      await createLection({
        name: values.name,
        cover: {
          base64: await fileToBase64(coverFile!),
          contentType: coverFile!.type || 'application/octet-stream',
        },
        videoPath: videoPath!,
        description: values.description,
        duration: values.duration,
        stars: values.stars,
        feedback: values.feedback,
        nozology: values.nozology,
        publishAfter,
        app_visible: values.app_visible,
        ...(values.idx !== undefined ? { idx: values.idx } : {}),
        references,
      });
      return { mode: 'created' as const };
    })();

    try {
      await toast.promise(submitPromise, {
        loading: 'Сохранение лекции...',
        success: (data) =>
          data.mode === 'updated' ? 'Лекция обновлена' : 'Лекция создана',
        error: 'Ошибка сохранения лекции',
      });

      router.push('/knowledge/lections');
      router.refresh();
    } catch {
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
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Длительность</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Введите длительность" />
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
            name="video"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Видео</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => onChange(e.target.files)}
                    {...field}
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
            name="stars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Звезды</FormLabel>
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
            {initialData ? 'Сохранить изменения' : 'Создать лекцию'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
        </div>
      </form>
    </Form>
  );
}
