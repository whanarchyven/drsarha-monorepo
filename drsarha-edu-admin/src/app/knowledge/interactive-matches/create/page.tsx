'use client';

import { useEffect } from 'react';

import { useNozologiesStore } from '@/shared/store/nozologiesStore';
import { InteractiveMatchForm } from '../_components/InteractiveMatchForm';

export default function CreateInteractiveMatchPage() {
  const { fetchNozologies } = useNozologiesStore();

  useEffect(() => {
    fetchNozologies();
  }, [fetchNozologies]);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">
        Создание интерактивного соединения
      </h1>
      <InteractiveMatchForm />
    </div>
  );
}
