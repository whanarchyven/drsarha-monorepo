'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InteractiveQuizForm } from '../../_components/InteractiveQuizForm';
import { interactiveQuizzesApi } from '@/shared/api/interactive-quizzes';
import type { InteractiveQuiz } from '@/shared/models/InteractiveQuiz';
import { toast } from 'sonner';

interface EditInteractiveQuizPageProps {
  params: {
    id: string;
  };
}

export default function EditInteractiveQuizPage({
  params,
}: EditInteractiveQuizPageProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<InteractiveQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await interactiveQuizzesApi.getById(params.id);
        setQuiz(data);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error('Ошибка при загрузке викторины');
        router.push('/knowledge/interactive-quizzes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [params.id, router]);

  if (isLoading) {
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
