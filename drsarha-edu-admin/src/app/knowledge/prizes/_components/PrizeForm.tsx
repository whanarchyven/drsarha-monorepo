'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { getContentUrl } from '@/shared/utils/url';
import { Card, CardContent } from '@/components/ui/card';
import { useAction } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';

const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Минимум 2 символа')
    .max(100, 'Максимум 100 символов'),
  description: z
    .string()
    .min(10, 'Минимум 10 символов')
    .max(500, 'Максимум 500 символов'),
  level: z
    .number()
    .min(1, 'Минимальный уровень: 1')
    .max(100, 'Максимальный уровень: 100'),
  price: z.number().min(0, 'Цена не может быть отрицательной'),
  image: z.any().optional(),
});

interface PrizeFormProps {
  initialData?: FunctionReturnType<typeof api.functions.prizes.getById> | null;
}

const fileToBase64 = (file: File) =>
  new Promise<{ base64: string; contentType: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Не удалось прочитать файл'));
        return;
      }
      const [, base64] = result.split(',');
      resolve({ base64, contentType: file.type });
    };
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });

export function PrizeForm({ initialData }: PrizeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image ? getContentUrl(initialData.image) : null
  );
  const createPrize = useAction(api.functions.prizes.create);
  const updatePrize = useAction(api.functions.prizes.updateAction);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          level: initialData.level,
          price: initialData.price,
          image: undefined,
        }
      : {
          name: '',
          description: '',
          level: 1,
          price: 0,
          image: undefined,
        },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description,
        level: initialData.level,
        price: initialData.price,
        image: undefined,
      });
      setImagePreview(
        initialData.image ? getContentUrl(initialData.image) : null
      );
      setImageFile(null);
    }
  }, [form, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      if (!initialData && !imageFile) {
        toast.error('Загрузите изображение приза');
        return;
      }

      const imagePayload = imageFile ? await fileToBase64(imageFile) : null;
      const promise = initialData?._id
        ? updatePrize({
            id: initialData._id,
            name: values.name,
            description: values.description,
            level: values.level,
            price: values.price,
            image: imagePayload ?? undefined,
          })
        : createPrize({
            name: values.name,
            description: values.description,
            level: values.level,
            price: values.price,
            image: imagePayload!,
          });

      toast.promise(promise, {
        loading: initialData ? 'Сохраняем приз...' : 'Создаём приз...',
        success: initialData ? 'Приз успешно обновлён' : 'Приз успешно создан',
        error: 'Произошла ошибка при сохранении приза',
      });

      await promise;
      router.push('/knowledge/prizes');
      router.refresh();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error('Произошла ошибка при сохранении приза');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Левая колонка - основные поля */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название приза</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите название приза..."
                      {...field}
                      disabled={isSubmitting}
                    />
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
                    <Textarea
                      placeholder="Введите описание приза..."
                      {...field}
                      disabled={isSubmitting}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Уровень</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={isSubmitting}
                        min="1"
                        max="5"
                      />
                    </FormControl>
                    <FormDescription>
                      Минимальный уровень для получения приза
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цена (звёзды)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={isSubmitting}
                        min="0"
                      />
                    </FormControl>
                    <FormDescription>Стоимость приза в звёздах</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Правая колонка - изображение */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Изображение приза</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isSubmitting}
                      />

                      {imagePreview && (
                        <Card>
                          <CardContent className="p-4">
                            <div className="relative h-48 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-md overflow-hidden">
                              <Image
                                src={imagePreview}
                                alt="Предварительный просмотр"
                                fill
                                className="object-contain p-2"
                              />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 text-center">
                              Предварительный просмотр
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Загрузите изображение приза (рекомендуемый размер:
                    200x200px)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Сохранить' : 'Создать'}
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
  );
}
