'use client';

import { TagForm } from '../../_components/TagForm';
import LoadingSpinner from '@/shared/ui/LoadingSpinner/LoadingSpinner';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

export default function EditTagPage({ params }: { params: { id: string } }) {
  const tag = useQuery(api.functions.pin_tags.getById, {
    id: params.id as Id<'pin_tags'>,
  });
  const isLoading = tag === undefined;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Тег не найден</h2>
          <p className="text-muted-foreground">
            Запрашиваемый тег не существует или был удален.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Редактирование тега</h1>
      <TagForm initialData={tag} />
    </div>
  );
}
