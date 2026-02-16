'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InteractiveMatchForm } from '../../_components/InteractiveMatchForm';
import { interactiveMatchesApi } from '@/shared/api/interactive-matches';
import type { InteractiveMatch } from '@/shared/models/InteractiveMatch';
import { toast } from 'sonner';
import { useNozologiesStore } from '@/shared/store/nozologiesStore';

interface EditInteractiveMatchPageProps {
  params: {
    id: string;
  };
}

export default function EditInteractiveMatchPage({
  params,
}: EditInteractiveMatchPageProps) {
  const router = useRouter();
  const [match, setMatch] = useState<InteractiveMatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchNozologies } = useNozologiesStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchData] = await Promise.all([
          interactiveMatchesApi.getById(params.id),
          fetchNozologies(),
        ]);
        setMatch(matchData);
      } catch (error) {
        console.error('Error fetching match:', error);
        toast.error('Ошибка при загрузке интерактивного соединения');
        router.push('/knowledge/interactive-matches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, router, fetchNozologies]);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!match) {
    return <div>Интерактивное соединение не найдено</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">
        Редактирование интерактивного соединения
      </h1>
      <InteractiveMatchForm initialData={match} />
    </div>
  );
}
