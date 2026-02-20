'use client';

import { useRouter } from 'next/navigation';
import { InteractiveTaskForm } from '../../_components/InteractiveTaskForm';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

interface EditInteractiveTaskPageProps {
  params: {
    id: string;
  };
}

export default function EditInteractiveTaskPage({
  params,
}: EditInteractiveTaskPageProps) {
  const router = useRouter();
  const task = useQuery(api.functions.interactive_tasks.getById, {
    id: params.id as Id<'interactive_tasks'>,
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
        Редактирование интерактивной задачи
      </h1>
      <InteractiveTaskForm initialData={task} />
    </div>
  );
}
