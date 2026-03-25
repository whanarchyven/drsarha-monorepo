'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import LoadingSpinner from '@/shared/ui/LoadingSpinner/LoadingSpinner';
import type { TaskActionType, KnowledgeType } from '@/shared/models/TaskGroup';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import type { Id } from '@convex/_generated/dataModel';

const taskSchema = z
  .object({
    title: z.string().min(1, 'Название обязательно'),
    description: z.string().min(1, 'Описание обязательно'),
    actionType: z.enum(
      [
        'create_pin',
        'like_pin',
        'create_comment',
        'create_folder',
        'complete_knowledge',
        'invite_user',
        'create_story',
        'listen_podcast',
      ],
      {
        required_error: 'Тип действия обязателен',
      }
    ),
    config: z.object({
      targetAmount: z
        .number()
        .min(1, 'Целевое количество должно быть больше 0'),
      knowledgeRef: z.string().nullable(),
      knowledgeType: z
        .enum([
          'lection',
          'clinic_task',
          'clinic_atlas',
          'interactive_task',
          'brochure',
          'interactive_match',
          'interactive_quiz',
        ])
        .nullable(),
    }),
    reward: z.object({
      stars: z.number().min(0, 'Количество звезд должно быть не меньше 0'),
      exp: z.number().min(0, 'Количество опыта должно быть не меньше 0'),
    }),
  })
  .refine(
    (data) => {
      // Если actionType = complete_knowledge, то knowledgeType и knowledgeRef обязательны
      if (data.actionType === 'complete_knowledge') {
        if (!data.config.knowledgeType || !data.config.knowledgeRef) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        'Для complete_knowledge необходимо указать тип и ссылку на знание',
      path: ['config', 'knowledgeType'], // Указываем путь для ошибки
    }
  );

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  groupId: Id<'task_groups'>;
  initialData?: FunctionReturnType<
    typeof api.functions.tasks.listByGroup
  >[number];
  isEditing?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TaskForm({
  groupId,
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState<TaskActionType>(
    initialData?.actionType || 'create_pin'
  );
  const createTask = useMutation(api.functions.tasks.create);
  const updateTask = useMutation(api.functions.tasks.update);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          actionType: initialData.actionType,
          config: {
            targetAmount: initialData.config.targetAmount,
            knowledgeRef: initialData.config.knowledgeRef,
            knowledgeType: initialData.config.knowledgeType,
          },
          reward: {
            stars: initialData.reward.stars,
            exp: initialData.reward.exp,
          },
        }
      : {
          title: '',
          description: '',
          actionType: 'create_pin' as const,
          config: {
            targetAmount: 1,
            knowledgeRef: null,
            knowledgeType: null,
          },
          reward: {
            stars: 0,
            exp: 0,
          },
        },
  });

  useEffect(() => {
    if (!initialData) return;
    reset({
      title: initialData.title,
      description: initialData.description,
      actionType: initialData.actionType as TaskActionType,
      config: {
        targetAmount: initialData.config.targetAmount,
        knowledgeRef: initialData.config.knowledgeRef,
        knowledgeType: initialData.config.knowledgeType as KnowledgeType | null,
      },
      reward: {
        stars: initialData.reward.stars,
        exp: initialData.reward.exp,
      },
    });
    setSelectedActionType(initialData.actionType as TaskActionType);
  }, [initialData, reset]);

  const onSubmit = async (data: TaskFormData) => {
    setIsLoading(true);
    try {
      if (isEditing && initialData) {
        const payload: any = {
          title: data.title,
          description: data.description,
          actionType: data.actionType,
          config: {
            targetAmount: data.config.targetAmount,
            knowledgeRef: data.config.knowledgeRef,
            knowledgeType: data.config.knowledgeType,
          },
          reward: {
            stars: data.reward.stars,
            exp: data.reward.exp,
          },
          isActive: true,
          updatedAt: new Date().toISOString(),
        };
        const promise = updateTask({ id: initialData._id, patch: payload });
        toast.promise(promise, {
          loading: 'Сохраняем задание...',
          success: 'Задание обновлено',
          error: 'Не удалось сохранить задание',
        });
        await promise;
      } else {
        const payload: any = {
          title: data.title,
          description: data.description,
          actionType: data.actionType,
          config: {
            targetAmount: data.config.targetAmount,
            knowledgeRef: data.config.knowledgeRef,
            knowledgeType: data.config.knowledgeType,
          },
          reward: {
            stars: data.reward.stars,
            exp: data.reward.exp,
          },
          groupId,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const promise = createTask(payload);
        toast.promise(promise, {
          loading: 'Добавляем задание...',
          success: 'Задание добавлено',
          error: 'Не удалось сохранить задание',
        });
        await promise;
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Не удалось сохранить задание');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Редактировать задание' : 'Добавить задание'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Название задания</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Введите название задания"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Введите описание задания"
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
              <Label htmlFor="actionType">Тип действия</Label>
              <Select
                value={selectedActionType}
                onValueChange={(value: TaskActionType) => {
                  setSelectedActionType(value);
                  setValue('actionType', value);
                }}
                disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип действия" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create_pin">Создать пин</SelectItem>
                  <SelectItem value="like_pin">Поставить лайк</SelectItem>
                  <SelectItem value="create_comment">
                    Создать комментарий
                  </SelectItem>
                  <SelectItem value="create_folder">Создать папку</SelectItem>
                  <SelectItem value="complete_knowledge">
                    Завершить знание
                  </SelectItem>
                  <SelectItem value="invite_user">
                    Пригласить пользователя
                  </SelectItem>
                  {/* <SelectItem value="create_story">Создать историю</SelectItem>
                  <SelectItem value="listen_podcast">Послушать подкаст</SelectItem> */}
                </SelectContent>
              </Select>
              {errors.actionType && (
                <p className="text-sm text-destructive">
                  {errors.actionType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">Целевое количество</Label>
              <Input
                id="targetAmount"
                type="number"
                {...register('config.targetAmount', { valueAsNumber: true })}
                placeholder="1"
                min="1"
                disabled={isLoading}
              />
              {errors.config?.targetAmount && (
                <p className="text-sm text-destructive">
                  {errors.config.targetAmount.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rewardStars">Награда (звезды)</Label>
              <Input
                id="rewardStars"
                type="number"
                {...register('reward.stars', { valueAsNumber: true })}
                placeholder="0"
                min="0"
                disabled={isLoading}
              />
              {errors.reward?.stars && (
                <p className="text-sm text-destructive">
                  {errors.reward.stars.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rewardExp">Награда (опыт)</Label>
              <Input
                id="rewardExp"
                type="number"
                {...register('reward.exp', { valueAsNumber: true })}
                placeholder="0"
                min="0"
                disabled={isLoading}
              />
              {errors.reward?.exp && (
                <p className="text-sm text-destructive">
                  {errors.reward.exp.message}
                </p>
              )}
            </div>
          </div>

          {/* Условные поля для complete_knowledge */}
          {selectedActionType === 'complete_knowledge' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="knowledgeType">Тип знания</Label>
                <Select
                  value={watch('config.knowledgeType') || ''}
                  onValueChange={(value: KnowledgeType) => {
                    setValue('config.knowledgeType', value);
                  }}
                  disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип знания" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lection">Лекция</SelectItem>
                    <SelectItem value="clinic_task">
                      Клиническое задание
                    </SelectItem>
                    <SelectItem value="clinic_atlas">
                      Клинический атлас
                    </SelectItem>
                    <SelectItem value="interactive_task">
                      Интерактивное задание
                    </SelectItem>
                    <SelectItem value="brochure">Брошюра</SelectItem>
                    <SelectItem value="interactive_match">
                      Интерактивное сопоставление
                    </SelectItem>
                    <SelectItem value="interactive_quiz">
                      Интерактивная викторина
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.config?.knowledgeType && (
                  <p className="text-sm text-destructive">
                    {errors.config.knowledgeType.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="knowledgeRef">ID знания</Label>
                <Input
                  id="knowledgeRef"
                  {...register('config.knowledgeRef')}
                  placeholder="Введите ID знания"
                  disabled={isLoading}
                />
                {errors.config?.knowledgeRef && (
                  <p className="text-sm text-destructive">
                    {errors.config.knowledgeRef.message}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  {isEditing ? 'Обновление...' : 'Добавление...'}
                </>
              ) : isEditing ? (
                'Обновить задание'
              ) : (
                'Добавить задание'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
