'use client';

import { PrizeForm } from '../../_components/PrizeForm';
import LoadingSpinner from '@/shared/ui/LoadingSpinner/LoadingSpinner';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

export default function EditPrizePage({ params }: { params: { id: string } }) {
  const prize = useQuery(api.functions.prizes.getById, {
    id: params.id as Id<'prizes'>,
  });
  const isLoading = prize === undefined;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!prize) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Приз не найден</h2>
          <p className="text-muted-foreground">
            Запрашиваемый приз не существует или был удален.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Редактирование приза</h1>
      <PrizeForm initialData={prize} />
    </div>
  );
}
