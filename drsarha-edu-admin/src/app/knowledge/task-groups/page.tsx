'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TaskGroupsByDate } from './_components/TaskGroupsByDate';
import { toast } from 'sonner';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

export default function TaskGroupsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDate =
    searchParams.get('date') || new Date().toISOString().split('T')[0];
  const response = useQuery(api.functions.task_groups.getByDate, {
    date: selectedDate,
  });
  const removeGroup = useMutation(api.functions.task_groups.remove);
  const isLoading = response === undefined;
  const taskGroupsByDate = useMemo(
    () =>
      response ?? {
        daily: [],
        weekly: [],
        level: [],
      },
    [response]
  );

  const handleEdit = (id: string) => {
    router.push(`/knowledge/task-groups/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      await removeGroup({ id: id as Id<'task_groups'> });
      toast.success('Группа заданий удалена');
    } catch (error) {
      console.error('Error deleting task group:', error);
      toast.error('Не удалось удалить группу заданий');
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
