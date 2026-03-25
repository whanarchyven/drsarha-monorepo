'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/shared/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useAction } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import type { FunctionReturnType } from 'convex/server';
import { useState } from 'react';
import { getContentUrl } from '@/shared/utils/url';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  description: z.string().min(2, 'Минимум 2 символа'),
  idx: z.preprocess(
    (value) =>
      value === '' || value === null || value === undefined
        ? undefined
        : Number(value),
    z.number().int().nonnegative().optional()
  ),
  cover_image: z.any(),
});

interface CategoryFormProps {
  initialData?: NonNullable<
    FunctionReturnType<typeof api.functions.categories.getById>
  >;
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const createCategory = useAction(api.functions.categories.create);
  const updateCategory = useAction(api.functions.categories.updateAction);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      idx: undefined,
      cover_image: '',
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('Form submitted with values:', values);
    try {
      if (initialData && initialData._id) {
        console.log('Updating existing category...');
        const args: {
          id: Id<'categories'>;
          name?: string;
          description?: string;
          idx?: number;
          cover?: { base64: string; contentType: string };
        } = {
          id: initialData._id as Id<'categories'>,
          name: values.name,
          description: values.description,
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
        await updateCategory(args);
      } else {
        console.log('Creating new category...');
        const args: {
          name: string;
          description?: string;
          idx?: number;
          cover?: { base64: string; contentType: string };
        } = {
          name: values.name,
          description: values.description,
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
        await createCategory(args);
      }
      console.log('API call successful');
      router.push('/knowledge/');
      router.refresh();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название</FormLabel>
              <FormControl>
                <Input placeholder="Введите название..." {...field} />
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
                <Textarea placeholder="Введите описание..." {...field} />
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
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>Загрузите изображение обложки</FormDescription>
              <FormMessage />
              {initialData?.cover_image && !coverPreview && (
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
        <div className="flex gap-4">
          <Button type="submit">{initialData ? 'Сохранить' : 'Создать'}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
        </div>
      </form>
    </Form>
  );
}
