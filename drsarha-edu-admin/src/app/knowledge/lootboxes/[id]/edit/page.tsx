'use client';

import { useEffect, useState } from 'react';
import { LootboxForm } from '../../_components/LootboxForm';
import { lootboxesApi } from '@/shared/api/lootboxes';
import type { Lootbox } from '@/shared/models/Lootbox';
import LoadingSpinner from '@/shared/ui/LoadingSpinner/LoadingSpinner';
import { toast } from 'sonner';

export default function EditLootboxPage({
  params,
}: {
  params: { id: string };
}) {
  const [lootbox, setLootbox] = useState<Lootbox | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLootbox = async () => {
      try {
        const data = await lootboxesApi.getById(params.id);
        setLootbox(data);
      } catch (error: any) {
        console.error('Error fetching lootbox:', error);
        toast.error('Ошибка при загрузке лутбокса');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLootbox();
  }, [params.id]);

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
