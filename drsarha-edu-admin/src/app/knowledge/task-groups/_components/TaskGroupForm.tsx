'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { taskGroupsApi } from '@/shared/api/taskGroups';
import { toast } from '@/hooks/use-toast';
import LoadingSpinner from '@/shared/ui/LoadingSpinner/LoadingSpinner';
import type { TaskGroup } from '@/shared/models/TaskGroup';
import { prizesApi } from '@/shared/api/prizes';
import { lootboxesApi } from '@/shared/api/lootboxes';
import { Plus, Trash2 } from 'lucide-react';

const rewardItemSchema = z.object({
  type: z.enum(['stars', 'exp', 'prize', 'lootbox']),
  amount: z.number().min(1, 'Минимум 1'),
  title: z
    .string()
    .min(1, 'Название обязательно')
    .max(200, 'Максимум 200 символов'),
  objectId: z.string().optional(),
});

const taskGroupSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  startDate: z.string().min(1, 'Дата начала обязательна'),
  endDate: z.string().min(1, 'Дата окончания обязательна'),
  rewardItems: z
    .array(rewardItemSchema)
    .min(1, 'Добавьте хотя бы одну награду'),
  level: z.number().nullable(),
  timeType: z.enum(['daily', 'weekly', 'level'], {
    required_error: 'Тип времени обязателен',
  }),
});

type TaskGroupFormData = z.infer<typeof taskGroupSchema>;

interface TaskGroupFormProps {
  initialData?: TaskGroup;
  isEditing?: boolean;
}

export function TaskGroupForm({
  initialData,
  isEditing = false,
}: TaskGroupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [prizes, setPrizes] = useState<{ _id: string; name: string }[]>([]);
  const [lootboxes, setLootboxes] = useState<{ _id: string; title: string }[]>(
    []
  );
  const router = useRouter();

  console.log(initialData, 'INITIAL DATA');

  useEffect(() => {
    // Загружаем призы и лутбоксы для селектов
    prizesApi.getAll({ limit: 100 }).then((res) => setPrizes(res.items));
    lootboxesApi.getAll({ limit: 100 }).then((res) => setLootboxes(res.items));

    // Отладочная информация
    if (initialData) {
      console.log('Initial data:', initialData);
      console.log('Reward items:', initialData.reward?.items);
    }
  }, [initialData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<TaskGroupFormData>({
    resolver: zodResolver(taskGroupSchema),
    defaultValues: initialData
      ? {
          name: initialData.name || '',
          description: initialData.description || '',
          startDate: initialData.startDate
            ? initialData.startDate.split('T')[0]
            : '',
          endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
          rewardItems: initialData.reward?.items?.length
            ? initialData.reward.items.map((item) => ({
                type: (item.type || 'stars') as
                  | 'stars'
                  | 'exp'
                  | 'prize'
                  | 'lootbox',
                amount: typeof item.amount === 'number' ? item.amount : 1,
                title:
                  item.title ||
                  (item.type === 'stars'
                    ? 'Звезды'
                    : item.type === 'exp'
                      ? 'Опыт'
                      : 'Награда'),
                objectId: item.objectId || undefined,
              }))
            : [{ type: 'stars', amount: 1, title: 'Звезды' }],
          level: initialData.level || null,
          timeType: initialData.timeType || 'daily',
        }
      : {
          name: '',
          description: '',
          startDate: '',
          endDate: '',
          rewardItems: [{ type: 'stars', amount: 1, title: 'Звезды' }],
          level: null,
          timeType: 'daily',
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rewardItems',
  });

  const onSubmit = async (data: TaskGroupFormData) => {
    setIsLoading(true);
    try {
      const payload: any = {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        rewardItems: data.rewardItems,
        timeType: data.timeType,
      };
      if (typeof data.level === 'number') {
        payload.level = data.level;
      }
      if (isEditing && initialData) {
        await taskGroupsApi.update(initialData._id, payload);
        toast({
          title: 'Успешно',
          description: 'Группа заданий обновлена',
        });
      } else {
        await taskGroupsApi.create(payload);
        toast({
          title: 'Успешно',
          description: 'Группа заданий создана',
        });
      }
      router.push('/knowledge/task-groups');
    } catch (error) {
      console.error('Error saving task group:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить группу заданий',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing
                ? 'Редактировать группу заданий'
                : 'Создать группу заданий'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Название группы</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Введите название группы"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Введите описание группы"
                  disabled={isLoading}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Дата начала</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register('startDate')}
                    disabled={isLoading}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-destructive">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Дата окончания</Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register('endDate')}
                    disabled={isLoading}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-destructive">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Уровень</Label>
                <Input
                  id="level"
                  type="number"
                  {...register('level', {
                    setValueAs: (value) => {
                      if (value === '' || isNaN(Number(value))) return null;
                      return Number(value);
                    },
                  })}
                  placeholder="Не указан"
                  min="1"
                  max="100"
                  disabled={isLoading}
                />
                {errors.level && (
                  <p className="text-sm text-destructive">
                    {errors.level.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeType">Тип времени</Label>
                <Select
                  value={watch('timeType')}
                  onValueChange={(value) =>
                    setValue('timeType', value as 'daily' | 'weekly' | 'level')
                  }
                  disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип времени" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Ежедневные задания</SelectItem>
                    <SelectItem value="weekly">Еженедельные задания</SelectItem>
                    <SelectItem value="level">Задания по уровню</SelectItem>
                  </SelectContent>
                </Select>
                {errors.timeType && (
                  <p className="text-sm text-destructive">
                    {errors.timeType.message}
                  </p>
                )}
              </div>

              {/* Модуль с наградами */}
              <div className="space-y-4">
                <Label>Награды</Label>
                {fields.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex gap-2 items-end border p-4 rounded-md bg-muted/30">
                    <div className="flex-1 space-y-2">
                      <Label>Тип награды</Label>
                      <Select
                        value={watch(`rewardItems.${idx}.type`)}
                        onValueChange={(value) =>
                          setValue(
                            `rewardItems.${idx}.type`,
                            value as 'stars' | 'exp' | 'prize' | 'lootbox'
                          )
                        }
                        disabled={isLoading}>
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
                      {errors.rewardItems?.[idx]?.type &&
                        typeof errors.rewardItems[idx]?.type === 'object' &&
                        'message' in (errors.rewardItems[idx]?.type as any) && (
                          <p className="text-sm text-destructive">
                            {
                              (errors.rewardItems[idx]?.type as any)
                                ?.message as string
                            }
                          </p>
                        )}
                    </div>

                    {['prize', 'lootbox'].includes(
                      watch(`rewardItems.${idx}.type`)
                    ) && (
                      <div className="flex-1 space-y-2">
                        <Label>
                          {watch(`rewardItems.${idx}.type`) === 'prize'
                            ? 'Приз'
                            : 'Лутбокс'}
                        </Label>
                        <Select
                          value={watch(`rewardItems.${idx}.objectId`) || ''}
                          onValueChange={(value) =>
                            setValue(`rewardItems.${idx}.objectId`, value)
                          }
                          disabled={isLoading}>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                watch(`rewardItems.${idx}.type`) === 'prize'
                                  ? 'Выберите приз'
                                  : 'Выберите лутбокс'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {watch(`rewardItems.${idx}.type`) === 'prize'
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
                        {errors.rewardItems?.[idx]?.objectId &&
                          (errors.rewardItems[idx]?.objectId as any)
                            ?.message && (
                            <p className="text-sm text-destructive">
                              {
                                (errors.rewardItems[idx]?.objectId as any)
                                  ?.message as string
                              }
                            </p>
                          )}
                      </div>
                    )}

                    <div className="w-24 space-y-2">
                      <Label>Количество</Label>
                      <Input
                        type="number"
                        min={1}
                        {...register(`rewardItems.${idx}.amount`, {
                          valueAsNumber: true,
                        })}
                        disabled={isLoading}
                      />
                      {errors.rewardItems?.[idx]?.amount &&
                        (errors.rewardItems[idx]?.amount as any)?.message && (
                          <p className="text-sm text-destructive">
                            {
                              (errors.rewardItems[idx]?.amount as any)
                                ?.message as string
                            }
                          </p>
                        )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <Label>Название</Label>
                      <Input
                        {...register(`rewardItems.${idx}.title`)}
                        placeholder="Введите название награды"
                        disabled={isLoading}
                      />
                      {errors.rewardItems?.[idx]?.title &&
                        (errors.rewardItems[idx]?.title as any)?.message && (
                          <p className="text-sm text-destructive">
                            {
                              (errors.rewardItems[idx]?.title as any)
                                ?.message as string
                            }
                          </p>
                        )}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(idx)}
                      disabled={fields.length === 1 || isLoading}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({ type: 'stars', amount: 1, title: 'Звезды' })
                  }
                  disabled={isLoading}>
                  <Plus className="mr-2 h-4 w-4" /> Добавить награду
                </Button>

                {errors.rewardItems && (
                  <p className="text-sm text-destructive">
                    {errors.rewardItems.message as string}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      {isEditing ? 'Обновление...' : 'Создание...'}
                    </>
                  ) : isEditing ? (
                    'Обновить группу'
                  ) : (
                    'Создать группу'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}>
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
