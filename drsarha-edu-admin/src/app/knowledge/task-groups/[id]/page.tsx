'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Award, Target } from 'lucide-react';
import { TaskList } from './_components/TaskList';
import { TaskForm } from './_components/TaskForm';
import { toast } from 'sonner';
import LoadingSpinner from '@/shared/ui/LoadingSpinner/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

export default function TaskGroupDetailPage() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<Id<'tasks'> | null>(null);
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as Id<'task_groups'>;
  const taskGroup = useQuery(api.functions.task_groups.getById, {
    id: groupId,
  });
  const tasks = useQuery(api.functions.tasks.listByGroup, { groupId });
  const removeTask = useMutation(api.functions.tasks.remove);
  const isLoading = taskGroup === undefined || tasks === undefined;
  const taskGroupWithTasks = useMemo(
    () =>
      taskGroup
        ? {
            ...taskGroup,
            tasks: tasks ?? [],
          }
        : null,
    [taskGroup, tasks]
  );
  const editingTask = useMemo(
    () => (editingTaskId ? tasks?.find((t) => t._id === editingTaskId) : null),
    [editingTaskId, tasks]
  );

  const getRewardTotals = () => {
    const items = taskGroup?.reward?.items ?? [];
    return items.reduce(
      (acc, item) => {
        if (item.type === 'stars') acc.stars += item.amount || 0;
        if (item.type === 'exp') acc.exp += item.amount || 0;
        return acc;
      },
      { stars: 0, exp: 0 }
    );
  };

  const handleAddTask = () => {
    setEditingTaskId(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (taskId: Id<'tasks'>) => {
    setEditingTaskId(taskId);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId: Id<'tasks'>) => {
    try {
      await removeTask({ id: taskId });
      toast.success('Задание удалено');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Не удалось удалить задание');
    }
  };

  const handleTaskFormSuccess = async () => {
    setShowTaskForm(false);
    setEditingTaskId(null);
  };

  const handleTaskFormCancel = () => {
    setShowTaskForm(false);
    setEditingTaskId(null);
  };

  if (isLoading) {
    return (
      <div className="container p-6">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!taskGroupWithTasks) {
    return null;
  }

  if (showTaskForm) {
    return (
      <div className="container p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleTaskFormCancel}
            className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к группе
          </Button>
        </div>
        <TaskForm
          groupId={taskGroupWithTasks._id}
          initialData={editingTask || undefined}
          isEditing={!!editingTask}
          onSuccess={handleTaskFormSuccess}
          onCancel={handleTaskFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="container p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/knowledge/task-groups')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к группам
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{taskGroupWithTasks.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {taskGroupWithTasks.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {taskGroupWithTasks.startDate} — {taskGroupWithTasks.endDate}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">⭐ {getRewardTotals().stars}</span>
              </div>

              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-500" />
                <span className="text-sm">🧠 {getRewardTotals().exp}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Уровень: {taskGroupWithTasks.level || 'Не указан'}
              </span>
            </div>
          </CardContent>
        </Card>

        <TaskList
          tasks={taskGroupWithTasks.tasks || []}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>
    </div>
  );
}
