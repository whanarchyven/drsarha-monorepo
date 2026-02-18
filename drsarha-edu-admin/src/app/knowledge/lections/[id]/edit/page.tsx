'use client';

import { useParams } from 'next/navigation';
import { LectionForm } from '../../_components/LectionForm';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

export default function EditLectionPage() {
  const { id } = useParams();
  const lectionId = id as Id<'lections'>;
  const lection = useQuery(api.functions.lections.getById, {
    id: lectionId,
  });
  const isLoading = lection === undefined;

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!lection) {
    return <div>Лекция не найдена</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Редактирование лекции</h1>
      <LectionForm initialData={lection} />
    </div>
  );
}
