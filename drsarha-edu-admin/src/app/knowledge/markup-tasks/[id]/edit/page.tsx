'use client';

import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { MarkupTaskForm } from '../../_components/MarkupTaskForm';

interface EditMarkupTaskPageProps {
  params: {
    id: string;
  };
}

export default function EditMarkupTaskPage({
  params,
}: EditMarkupTaskPageProps) {
  const task = useQuery(api.functions.markup_tasks.getFullById, {
    id: params.id as Id<'markup_tasks'>,
  });

  if (task === undefined) {
    return <div>Загрузка...</div>;
  }

  if (!task) {
    return <div>Задача не найдена</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">
        Редактирование задачи на разметку
      </h1>
      <MarkupTaskForm initialData={task} />
    </div>
  );
}
