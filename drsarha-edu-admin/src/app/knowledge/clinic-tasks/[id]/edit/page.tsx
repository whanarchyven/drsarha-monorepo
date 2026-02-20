'use client';

import { useRouter } from 'next/navigation';
import { ClinicTaskForm } from '../../_components/ClinicTaskForm';
import { toast } from 'sonner';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

interface EditClinicTaskPageProps {
  params: {
    id: string;
  };
}

export default function EditClinicTaskPage({
  params,
}: EditClinicTaskPageProps) {
  const router = useRouter();
  const task = useQuery(api.functions.clinic_tasks.getById, {
    id: params.id as Id<'clinic_tasks'>,
  });

  if (task === undefined) {
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
