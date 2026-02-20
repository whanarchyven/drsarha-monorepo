'use client';

import { LootboxForm } from '../../_components/LootboxForm';
import LoadingSpinner from '@/shared/ui/LoadingSpinner/LoadingSpinner';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

export default function EditLootboxPage({
  params,
}: {
  params: { id: string };
}) {
  const lootbox = useQuery(api.functions.lootboxes.getById, {
    id: params.id as Id<'lootboxes'>,
  });
  const isLoading = lootbox === undefined;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!lootbox) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Лутбокс не найден</h2>
          <p className="text-muted-foreground">
            Запрашиваемый лутбокс не существует или был удален.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Редактирование лутбокса</h1>
      <LootboxForm initialData={lootbox} />
    </div>
  );
}
