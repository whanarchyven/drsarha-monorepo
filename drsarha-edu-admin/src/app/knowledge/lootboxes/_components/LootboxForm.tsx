'use client';

import { useForm, useFieldArray } from 'react-hook-form';
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
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { getContentUrl } from '@/shared/utils/url';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAction, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';

const itemSchema = z.object({
  type: z.enum(['stars', 'exp', 'prize', 'lootbox']),
  amount: z.number().min(1, 'Минимум 1'),
  chance: z.number().min(0, 'Мин. 0%').max(1, 'Макс. 100%'),
  objectId: z.string().optional(),
});

const formSchema = z.object({
  title: z
    .string()
    .min(2, 'Минимум 2 символа')
    .max(100, 'Максимум 100 символов'),
  description: z
    .string()
    .min(5, 'Минимум 5 символов')
    .max(500, 'Максимум 500 символов'),
  image: z.any().optional(),
  items: z.array(itemSchema).min(1, 'Добавьте хотя бы один предмет'),
});

interface LootboxFormProps {
  initialData?: FunctionReturnType<typeof api.functions.lootboxes.getById> | null;
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

export function LootboxForm({ initialData }: LootboxFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image ? getContentUrl(initialData.image) : null
  );
  const createLootbox = useAction(api.functions.lootboxes.create);
  const updateLootbox = useAction(api.functions.lootboxes.updateAction);
  const prizesResponse = useQuery(api.functions.prizes.list, {
    page: 1,
    limit: 100,
  });
  const lootboxesResponse = useQuery(api.functions.lootboxes.list, {
    page: 1,
    limit: 100,
  });
  const prizes = prizesResponse?.items ?? [];
  const lootboxes = lootboxesResponse?.items ?? [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          image: undefined,
          items: (initialData?.items || []).filter(Boolean).map((i) => {
            const raw: any = i as any;
            const allowed = ['stars', 'exp', 'prize', 'lootbox'] as const;
            const normalizedType = (
              allowed.includes(raw?.type) ? raw.type : 'stars'
            ) as 'stars' | 'exp' | 'prize' | 'lootbox';
            const isObjectRef =
              normalizedType === 'prize' || normalizedType === 'lootbox';
            const objectId = isObjectRef
              ? raw?.objectId === null || raw?.objectId === ''
                ? undefined
                : raw?.objectId
              : undefined;
            return {
              ...raw,
              type: normalizedType,
              objectId,
            };
          }),
        }
      : {
          title: '',
          description: '',
          image: undefined,
          items: [{ type: 'stars', amount: 1, chance: 1 }], // 100%
        },
  });

  useEffect(() => {
    if (!initialData) return;
    form.reset({
      title: initialData.title,
      description: initialData.description,
      image: undefined,
      items: (initialData?.items || []).filter(Boolean).map((i) => {
        const raw: any = i as any;
        const allowed = ['stars', 'exp', 'prize', 'lootbox'] as const;
        const normalizedType = (
          allowed.includes(raw?.type) ? raw.type : 'stars'
        ) as 'stars' | 'exp' | 'prize' | 'lootbox';
        const isObjectRef =
          normalizedType === 'prize' || normalizedType === 'lootbox';
        const objectId = isObjectRef
          ? raw?.objectId === null || raw?.objectId === ''
            ? undefined
            : raw?.objectId
          : undefined;
        return {
          ...raw,
          type: normalizedType,
          objectId,
        };
      }),
    });
    setImagePreview(initialData.image ? getContentUrl(initialData.image) : null);
    setImageFile(null);
  }, [form, initialData]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedItems = form.watch('items');

  const onInvalid = (errors: any) => {
    console.error('Validation errors:', errors);
    const firstErrorMessage = Object.values(errors || {})
      .map((e: any) => e?.message || (e?.root && e.root.message))
      .find(Boolean) as string | undefined;
    toast.error(firstErrorMessage || 'Проверьте корректность заполнения формы');
  };

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
    console.log(values, 'VALUES');
    try {
      setIsSubmitting(true);
      console.log(values, 'VALUES');
      const sanitizedItems = (values.items || [])
        .filter(Boolean)
        .map((it: any) => {
          const isObjectRef = it?.type === 'prize' || it?.type === 'lootbox';
          return {
            ...it,
            objectId: isObjectRef
              ? it?.objectId === null || it?.objectId === ''
                ? undefined
                : it?.objectId
              : undefined,
          };
        });
      if (!initialData && !imageFile) {
        toast.error('Загрузите изображение лутбокса');
        return;
      }

      const imagePayload = imageFile ? await fileToBase64(imageFile) : null;
      const promise = initialData?._id
        ? updateLootbox({
            id: initialData._id,
            title: values.title,
            description: values.description,
            items: sanitizedItems as any,
            image: imagePayload ?? undefined,
          })
        : createLootbox({
            title: values.title,
            description: values.description,
            items: sanitizedItems as any,
            image: imagePayload!,
          });

      toast.promise(promise, {
        loading: initialData ? 'Сохраняем лутбокс...' : 'Создаём лутбокс...',
        success: initialData
          ? 'Лутбокс успешно обновлён'
          : 'Лутбокс успешно создан',
        error: 'Произошла ошибка при сохранении лутбокса',
      });

      await promise;
      router.push('/knowledge/lootboxes');
      router.refresh();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error('Произошла ошибка при сохранении лутбокса');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Левая колонка - основные поля */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название лутбокса</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите название..."
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
                      placeholder="Введите описание..."
                      {...field}
                      disabled={isSubmitting}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Правая колонка - изображение */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Изображение лутбокса</FormLabel>
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
                            <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-md overflow-hidden">
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
                    Загрузите изображение лутбокса (рекомендуемый размер:
                    200x200px)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2 justify-between items-center border p-2 rounded-md bg-muted/30">
            <FormLabel>Предметы в лутбоксе</FormLabel>
            <p className="text-sm text-muted-foreground">
              Сумма процентов:{' '}
              {Math.round(
                (watchedItems || []).reduce(
                  (acc, item) => acc + (item.chance || 0),
                  0
                ) * 100
              )}
              %
            </p>
          </div>
          {fields.map((item, idx) => (
            <div
              key={item.id}
              className="flex gap-2 items-end border p-2 rounded-md bg-muted/30">
              <FormField
                control={form.control}
                name={`items.${idx}.type`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Тип</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                      disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stars">Звёзды</SelectItem>
                        <SelectItem value="exp">Опыт</SelectItem>
                        <SelectItem value="prize">Приз</SelectItem>
                        <SelectItem value="lootbox">Лутбокс</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {['prize', 'lootbox'].includes(
                form.watch(`items.${idx}.type`)
              ) && (
                <FormField
                  control={form.control}
                  name={`items.${idx}.objectId`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>
                        {form.watch(`items.${idx}.type`) === 'prize'
                          ? 'Приз'
                          : 'Лутбокс'}
                      </FormLabel>
                      <Select
                        value={field.value || ''}
                        onValueChange={(val) => field.onChange(val)}
                        disabled={isSubmitting}>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              form.watch(`items.${idx}.type`) === 'prize'
                                ? 'Выберите приз'
                                : 'Выберите лутбокс'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {form.watch(`items.${idx}.type`) === 'prize'
                            ? prizes.map((p) => (
                                <SelectItem key={p._id} value={p._id}>
                                  {p.name}
                                </SelectItem>
                              ))
                            : lootboxes
                                .filter(
                                  (l) =>
                                    !initialData || l._id !== initialData._id
                                )
                                .map((l) => (
                                  <SelectItem key={l._id} value={l._id}>
                                    {l.title}
                                  </SelectItem>
                                ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name={`items.${idx}.amount`}
                render={({ field }) => (
                  <FormItem className="w-24">
                    <FormLabel>Кол-во</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        disabled={isSubmitting}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${idx}.chance`}
                render={({ field }) => (
                  <FormItem className="w-24">
                    <FormLabel>Шанс (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={Math.round((field.value || 0) * 100)}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) / 100)
                        }
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>0-100%</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(idx)}
                disabled={fields.length === 1 || isSubmitting}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ type: 'stars', amount: 1, chance: 1 })}
            disabled={isSubmitting}>
            <Plus className="mr-2 h-4 w-4" /> Добавить предмет
          </Button>
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
