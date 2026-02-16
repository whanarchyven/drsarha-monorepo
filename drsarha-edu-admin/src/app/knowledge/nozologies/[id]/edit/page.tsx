'use client';

import { NozologyForm } from '../../_components/NozologyForm';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

export default function EditNozologyPage({
  params,
}: {
  params: { id: string };
}) {
  const nozologyId = params.id as Id<'nozologies'>;
  const nozology = useQuery(api.functions.nozologies.getById, {
    id: nozologyId,
  });
  const isLoading = nozology === undefined;

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!nozology) {
    return <div>Нозология не найдена</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Редактирование нозологии</h1>
      <NozologyForm initialData={nozology} />
    </div>
  );
}
