'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InteractiveTaskForm } from '../../_components/InteractiveTaskForm';
import { interactiveTasksApi } from '@/shared/api/interactive-tasks';
import type { InteractiveTask } from '@/shared/models/InteractiveTask';
import { toast } from 'sonner';

interface EditInteractiveTaskPageProps {
  params: {
    id: string;
  };
}

export default function EditInteractiveTaskPage({
  params,
}: EditInteractiveTaskPageProps) {
  const router = useRouter();
  const [task, setTask] = useState<InteractiveTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await interactiveTasksApi.getById(params.id);
        setTask(data);
      } catch (error) {
        console.error('Error fetching task:', error);
        toast.error('Ошибка при загрузке задачи');
        router.push('/knowledge/interactive-tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [params.id, router]);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!task) {
    return <div>Задача не найдена</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        Редактирование интерактивной задачи
      </h1>
      <InteractiveTaskForm initialData={task} />
    </div>
  );
}
