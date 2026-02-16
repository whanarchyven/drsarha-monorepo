'use client';

import { useEffect, useState } from 'react';
import { TagForm } from '../../_components/TagForm';
import { tagsApi } from '@/shared/api/tags';
import type { Tag } from '@/shared/models/Tag';
import LoadingSpinner from '@/shared/ui/LoadingSpinner/LoadingSpinner';
import { toast } from 'sonner';

export default function EditTagPage({ params }: { params: { id: string } }) {
  const [tag, setTag] = useState<Tag | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const data = await tagsApi.getById(params.id);
        setTag(data);
      } catch (error: any) {
        console.error('Error fetching tag:', error);
        toast.error('Ошибка при загрузке тега');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTag();
  }, [params.id]);

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
