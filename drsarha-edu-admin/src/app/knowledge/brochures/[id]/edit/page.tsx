'use client';

import { BrochureForm } from '../../_components/BrochureForm';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

export default function EditBrochurePage({
  params,
}: {
  params: { id: string };
}) {
  const brochureId = params.id as Id<'brochures'>;
  const brochure = useQuery(api.functions.brochures.getById, {
    id: brochureId,
  });
  const isLoading = brochure === undefined;

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!brochure) {
    return <div>Брошюра не найдена</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Редактирование брошюры</h1>
      <BrochureForm initialData={brochure} />
    </div>
  );
}
