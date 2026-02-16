'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Calendar, Award, Target } from 'lucide-react';
import type {
  TaskGroup,
  TaskGroupsByDateResponse,
} from '@/shared/models/TaskGroup';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';

interface TaskGroupsByDateProps {
  data: TaskGroupsByDateResponse;
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onView: (id: string) => void;
}

export function TaskGroupsByDate({
  data,
  isLoading,
  onEdit,
  onDelete,
  onCreate,
  onView,
}: TaskGroupsByDateProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDate =
    searchParams.get('date') || new Date().toISOString().split('T')[0];

  const handleDateChange = (date: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('date', date);
    router.push(`/knowledge/task-groups?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    setDeleteId(null);
    onDelete(id);
  };

  const renderTaskGroupCard = (group: TaskGroup) => (
    <div
      key={group._id}
      className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView(group._id)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{group.name}</h3>
          <div className="text-xs text-muted-foreground mb-1">
            {group.startDate} — {group.endDate}
          </div>
          <div className="text-sm text-muted-foreground line-clamp-2 mb-1">
            {group.description}
          </div>
          <div className="flex gap-2 text-xs mt-2">
            <span>⭐ {group.reward.stars}</span>
            <span>🧠 {group.reward.exp}</span>
            <span>Уровень: {group.level || 'Не указан'}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Заданий: {group.tasks?.length || 0}
          </div>
        </div>
        <div
          className="flex flex-col gap-2 items-end"
          onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="ghost" onClick={() => onEdit(group._id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setDeleteId(group._id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSection = (
    title: string,
    groups: TaskGroup[],
    icon: React.ReactNode
  ) => {
    if (groups.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="w-full">{groups.map(renderTaskGroupCard)}</div>
      </div>
    );
  };

  const renderLevelSections = () => {
    // Группируем задания по уровням
    const levelGroups = (data?.level || []).reduce(
      (acc, group) => {
        const level = group.level || 'unknown';
        if (!acc[level]) {
          acc[level] = [];
        }
        acc[level].push(group);
        return acc;
      },
      {} as Record<string | number, TaskGroup[]>
    );

    return Object.entries(levelGroups).map(([level, groups]) => (
      <div key={level} className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-purple-500" />
          <h2 className="text-2xl font-bold">
            Задания {level === 'unknown' ? 'без уровня' : `${level} уровня`}
          </h2>
        </div>
        <div className="w-full">{groups.map(renderTaskGroupCard)}</div>
      </div>
    ));
  };

  const totalGroups =
    (data?.daily?.length || 0) +
    (data?.weekly?.length || 0) +
    (data?.level?.length || 0);

  return (
    <div className="container p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Группы заданий</h1>
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Создать группу
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Выберите дату:</span>
          </div>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-auto"
          />
        </div>

        {totalGroups === 0 && !isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-muted-foreground mb-4">
                На выбранную дату нет групп заданий
              </div>
              <Button onClick={onCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Создать первую группу
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {renderSection(
              'Ежедневные задания',
              data?.daily || [],
              <Calendar className="h-6 w-6 text-blue-500" />
            )}
            {renderSection(
              'Еженедельные задания',
              data?.weekly || [],
              <Calendar className="h-6 w-6 text-green-500" />
            )}
            {renderLevelSections()}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить эту группу? Это действие нельзя
              отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
