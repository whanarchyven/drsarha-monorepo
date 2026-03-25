'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { getContentUrl } from '@/shared/utils/url';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const publishAfterSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && value.length === 0 ? undefined : value,
  z.string().optional()
);

const formSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  pdf_file: z.any(),
  cover_image: z.any(),
  nozology: z.string().min(1, 'Выберите нозологию'),
  publishAfter: publishAfterSchema,
  idx: z.preprocess(
    (value) =>
      value === '' || value === null || value === undefined
        ? undefined
        : Number(value),
    z.number().int().nonnegative().optional()
  ),
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

interface BrochureFormProps {
  initialData?: NonNullable<
    FunctionReturnType<typeof api.functions.brochures.getById>
  >;
}
type NozologyItem = FunctionReturnType<
  typeof api.functions.nozologies.list
>[number];

export function BrochureForm({ initialData }: BrochureFormProps) {
  const router = useRouter();
  const nozologies =
    (useQuery(api.functions.nozologies.list, {}) as NozologyItem[]) ?? [];
  const createBrochure = useAction(api.functions.brochures.create);
  const updateBrochure = useAction(api.functions.brochures.updateAction);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
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
      pdf_file: initialData?.pdf_file || '',
      cover_image: initialData?.cover_image || '',
      nozology: initialData?.nozology ? String(initialData.nozology) : '',
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    const submitPromise = (async () => {
      const publishAfter =
        values.publishAfter && values.publishAfter.length
          ? new Date(values.publishAfter).getTime()
          : undefined;

      if (initialData) {
        const args: {
          id: Id<'brochures'>;
          name?: string;
          nozology?: string;
          cover?: { base64: string; contentType: string };
          pdf?: { base64: string; contentType: string };
          publishAfter?: number;
          app_visible?: boolean;
          idx?: number;
          references?: Array<{ name: string; url: string }>;
        } = {
          id: initialData._id as Id<'brochures'>,
          name: values.name,
          nozology: values.nozology,
          publishAfter,
          app_visible: values.app_visible,
          references,
        };
        if (values.idx !== undefined) {
          args.idx = values.idx;
        }
        if (pdfFile) {
          args.pdf = {
            base64: await fileToBase64(pdfFile),
            contentType: pdfFile.type || 'application/pdf',
          };
        }
        if (coverFile) {
          args.cover = {
            base64: await fileToBase64(coverFile),
            contentType: coverFile.type || 'application/octet-stream',
          };
        }
        await updateBrochure(args);
        return { mode: 'updated' as const };
      }

      if (!pdfFile) {
        form.setError('pdf_file', {
          type: 'manual',
          message: 'PDF файл обязателен',
        });
        throw new Error('PDF файл обязателен');
      }
      if (!coverFile) {
        form.setError('cover_image', {
          type: 'manual',
          message: 'Обложка обязательна',
        });
        throw new Error('Обложка обязательна');
      }

      const args: {
        name: string;
        nozology: string;
        cover: { base64: string; contentType: string };
        pdf: { base64: string; contentType: string };
        publishAfter?: number;
        app_visible?: boolean;
        idx?: number;
        references?: Array<{ name: string; url: string }>;
      } = {
        name: values.name,
        nozology: values.nozology,
        cover: {
          base64: await fileToBase64(coverFile),
          contentType: coverFile.type || 'application/octet-stream',
        },
        pdf: {
          base64: await fileToBase64(pdfFile),
          contentType: pdfFile.type || 'application/pdf',
        },
        publishAfter,
        app_visible: values.app_visible,
        references,
      };
      if (values.idx !== undefined) {
        args.idx = values.idx;
      }
      await createBrochure(args);
      return { mode: 'created' as const };
    })();

    try {
      await toast.promise(submitPromise, {
        loading: 'Сохранение брошюры...',
        success: (data) =>
          data.mode === 'updated' ? 'Брошюра обновлена' : 'Брошюра создана',
        error: 'Ошибка сохранения брошюры',
      });
      router.push('/knowledge/brochures');
      router.refresh();
    } catch {
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {initialData ? 'Редактирование брошюры' : 'Создание брошюры'}
        </CardTitle>
        <CardDescription>
          Заполните форму для {initialData ? 'обновления' : 'создания'} брошюры
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите название брошюры..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pdf_file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PDF файл</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file.name);
                            setPdfFile(file);
                          }
                        }}
                        className="file:mr-4 h-fit file:py-2 file:px-4 file:rounded-lg file:border-0
                          file:text-sm file:font-medium file:bg-primary/10 file:text-primary
                          hover:file:bg-primary/20 cursor-pointer"
                      />
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormDescription>Загрузите PDF файл брошюры</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cover_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Обложка</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file.name);
                            setCoverFile(file);
                            handleCoverImageChange(e);
                          }
                        }}
                        className="file:mr-4 h-fit file:py-2 file:px-4 file:rounded-lg file:border-0
                          file:text-sm file:font-medium file:bg-primary/10 file:text-primary
                          hover:file:bg-primary/20 cursor-pointer"
                      />
                      {coverPreview && (
                        <div className="relative w-full rounded-lg overflow-hidden">
                          <img
                            src={coverPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Загрузите изображение обложки
                  </FormDescription>
                  <FormMessage />
                  {initialData?.cover_image && (
                    <div className="relative aspect-video w-full">
                      <Image
                        src={getContentUrl(initialData.cover_image)}
                        alt="Preview"
                        width={500}
                        height={300}
                        className="max-w-full h-auto"
                      />
                    </div>
                  )}
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
                  <FormDescription>
                    Выберите соответствующую нозологию для брошюры
                  </FormDescription>
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

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Загрузка...
                  </>
                ) : initialData ? (
                  'Сохранить'
                ) : (
                  'Создать'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}>
                Отмена
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
