'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Award, Target } from 'lucide-react';
import { TaskList } from './_components/TaskList';
import { TaskForm } from './_components/TaskForm';
import { taskGroupsApi } from '@/shared/api/taskGroups';
import { toast } from '@/hooks/use-toast';
import LoadingSpinner from '@/shared/ui/LoadingSpinner/LoadingSpinner';
import type { TaskGroup, Task } from '@/shared/models/TaskGroup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TaskGroupDetailPage() {
  const [taskGroup, setTaskGroup] = useState<TaskGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchTaskGroup = async () => {
      try {
        const id = params.id as string;
        const [groupData, tasksData] = await Promise.all([
          taskGroupsApi.getById(id),
          taskGroupsApi.getTasksInGroup(id),
        ]);

        setTaskGroup({
          ...groupData,
          tasks: tasksData,
        });
      } catch (error) {
        console.error('Error fetching task group:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить группу заданий',
          variant: 'destructive',
        });
        router.push('/knowledge/task-groups');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchTaskGroup();
    }
  }, [params.id, router]);

  const handleAddTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const groupId = params.id as string;
      await taskGroupsApi.deleteTaskFromGroup(groupId, taskId);
      toast({
        title: 'Успешно',
        description: 'Задание удалено',
      });
      // Refresh the task group data
      const [groupData, tasksData] = await Promise.all([
        taskGroupsApi.getById(groupId),
        taskGroupsApi.getTasksInGroup(groupId),
      ]);
      setTaskGroup({
        ...groupData,
        tasks: tasksData,
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить задание',
        variant: 'destructive',
      });
    }
  };

  const handleTaskFormSuccess = async () => {
    setShowTaskForm(false);
    setEditingTask(null);

    // Refresh the task group data
    if (params.id) {
      try {
        const groupId = params.id as string;
        const [groupData, tasksData] = await Promise.all([
          taskGroupsApi.getById(groupId),
          taskGroupsApi.getTasksInGroup(groupId),
        ]);
        setTaskGroup({
          ...groupData,
          tasks: tasksData,
        });
      } catch (error) {
        console.error('Error refreshing task group:', error);
      }
    }
  };

  const handleTaskFormCancel = () => {
    setShowTaskForm(false);
    setEditingTask(null);
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

  if (!taskGroup) {
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
          groupId={taskGroup._id}
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
            <CardTitle className="text-3xl">{taskGroup.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{taskGroup.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {taskGroup.startDate} — {taskGroup.endDate}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">⭐ {taskGroup.rewardStars}</span>
              </div>

              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-500" />
                <span className="text-sm">🧠 {taskGroup.rewardExp}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Уровень: {taskGroup.level}</span>
            </div>
          </CardContent>
        </Card>

        <TaskList
          tasks={taskGroup.tasks || []}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>
    </div>
  );
}
