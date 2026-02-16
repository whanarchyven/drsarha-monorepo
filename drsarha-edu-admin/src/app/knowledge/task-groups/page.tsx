'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TaskGroupGrid } from './_components/TaskGroupGrid';
import { TaskGroupsByDate } from './_components/TaskGroupsByDate';
import { taskGroupsApi } from '@/shared/api/taskGroups';
import { toast } from '@/hooks/use-toast';
import type {
  TaskGroup,
  TaskGroupsByDateResponse,
} from '@/shared/models/TaskGroup';

export default function TaskGroupsPage() {
  const [taskGroupsByDate, setTaskGroupsByDate] =
    useState<TaskGroupsByDateResponse>({
      daily: [],
      weekly: [],
      level: [],
    });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDate =
    searchParams.get('date') || new Date().toISOString().split('T')[0];

  const fetchTaskGroupsByDate = async (date: string) => {
    try {
      setIsLoading(true);
      const data = await taskGroupsApi.getByDate(date);
      setTaskGroupsByDate(data);
    } catch (error) {
      console.error('Error fetching task groups by date:', error);
      // Fallback to getAll if getByDate is not available
      try {
        const allGroups = await taskGroupsApi.getAll();
        // Group them manually by timeType
        const grouped = {
          daily: allGroups.filter((g) => g.timeType === 'daily'),
          weekly: allGroups.filter((g) => g.timeType === 'weekly'),
          level: allGroups.filter((g) => g.timeType === 'level'),
        };
        setTaskGroupsByDate(grouped);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить группы заданий',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskGroupsByDate(selectedDate);
  }, [selectedDate]);

  const handleEdit = (id: string) => {
    router.push(`/knowledge/task-groups/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      await taskGroupsApi.delete(id);
      toast({
        title: 'Успешно',
        description: 'Группа заданий удалена',
      });
      // Refresh data after deletion
      fetchTaskGroupsByDate(selectedDate);
    } catch (error) {
      console.error('Error deleting task group:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить группу заданий',
        variant: 'destructive',
      });
    }
  };

  const handleCreate = () => {
    router.push('/knowledge/task-groups/create');
  };

  const handleView = (id: string) => {
    router.push(`/knowledge/task-groups/${id}`);
  };

  return (
    <TaskGroupsByDate
      data={taskGroupsByDate}
      isLoading={isLoading}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
      onView={handleView}
    />
  );
}
