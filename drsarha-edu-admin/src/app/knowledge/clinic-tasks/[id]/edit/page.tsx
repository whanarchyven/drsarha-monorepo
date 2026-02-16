'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClinicTaskForm } from '../../_components/ClinicTaskForm';
import { clinicTasksApi } from '@/shared/api/clinic-tasks';
import type { ClinicTask } from '@/shared/models/ClinicTask';
import { toast } from 'sonner';

interface EditClinicTaskPageProps {
  params: {
    id: string;
  };
}

export default function EditClinicTaskPage({
  params,
}: EditClinicTaskPageProps) {
  const router = useRouter();
  const [task, setTask] = useState<ClinicTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await clinicTasksApi.getById(params.id);
        setTask(data);
      } catch (error) {
        console.error('Error fetching task:', error);
        toast.error('Ошибка при загрузке задачи');
        router.push('/knowledge/clinic-tasks');
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
        Редактирование клинической задачи
      </h1>
      <ClinicTaskForm initialData={task} />
    </div>
  );
}
