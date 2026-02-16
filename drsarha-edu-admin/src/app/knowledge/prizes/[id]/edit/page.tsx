'use client';

import { useEffect, useState } from 'react';
import { PrizeForm } from '../../_components/PrizeForm';
import { prizesApi } from '@/shared/api/prizes';
import type { Prize } from '@/shared/models/Prize';
import LoadingSpinner from '@/shared/ui/LoadingSpinner/LoadingSpinner';
import { toast } from 'sonner';

export default function EditPrizePage({ params }: { params: { id: string } }) {
  const [prize, setPrize] = useState<Prize | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrize = async () => {
      try {
        const data = await prizesApi.getById(params.id);
        setPrize(data);
      } catch (error: any) {
        console.error('Error fetching prize:', error);
        toast.error('Ошибка при загрузке приза');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrize();
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
