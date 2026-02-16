'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TaskGroupForm } from '../../_components/TaskGroupForm';
import { taskGroupsApi } from '@/shared/api/taskGroups';
import { toast } from '@/hooks/use-toast';
import LoadingSpinner from '@/shared/ui/LoadingSpinner/LoadingSpinner';
import type { TaskGroup } from '@/shared/models/TaskGroup';

export default function EditTaskGroupPage() {
  const [taskGroup, setTaskGroup] = useState<TaskGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchTaskGroup = async () => {
      try {
        const id = params.id as string;
        const data = await taskGroupsApi.getById(id);
        setTaskGroup(data);
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

  return <TaskGroupForm initialData={taskGroup} isEditing />;
}
