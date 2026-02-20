'use client';

import { useRouter } from 'next/navigation';
import { InteractiveMatchForm } from '../../_components/InteractiveMatchForm';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

interface EditInteractiveMatchPageProps {
  params: {
    id: string;
  };
}

export default function EditInteractiveMatchPage({
  params,
}: EditInteractiveMatchPageProps) {
  const router = useRouter();
  const match = useQuery(api.functions.interactive_matches.getById, {
    id: params.id as Id<'interactive_matches'>,
  });

  if (match === undefined) {
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
