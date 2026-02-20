'use client';

import { useRouter } from 'next/navigation';
import { InteractiveQuizForm } from '../../_components/InteractiveQuizForm';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

interface EditInteractiveQuizPageProps {
  params: {
    id: string;
  };
}

export default function EditInteractiveQuizPage({
  params,
}: EditInteractiveQuizPageProps) {
  const router = useRouter();
  const quiz = useQuery(api.functions.interactive_quizzes.getById, {
    id: params.id as Id<'interactive_quizzes'>,
  });

  if (quiz === undefined) {
    return <div>Загрузка...</div>;
  }

  if (!quiz) {
    return <div>Викторина не найдена</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        Редактирование интерактивной викторины
      </h1>
      <InteractiveQuizForm initialData={quiz} />
    </div>
  );
}
