'use client';

import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { ConferenceInteractiveForm } from '../../_components/ConferenceInteractiveForm';

interface EditConferenceInteractivePageProps {
  params: {
    id: string;
  };
}

export default function EditConferenceInteractivePage({
  params,
}: EditConferenceInteractivePageProps) {
  const interactive = useQuery(api.functions.conference_interactives.getInteractiveById, {
    id: params.id as Id<'conference_interactives'>,
  });

  if (interactive === undefined) {
    return <div>Загрузка...</div>;
  }

  if (!interactive) {
    return <div>Интерактив не найден</div>;
  }

  return (
    <div className="mx-auto max-w-5xl py-8">
      <h1 className="mb-8 text-2xl font-bold">Редактирование интерактива</h1>
      <ConferenceInteractiveForm initialData={interactive} />
    </div>
  );
}
