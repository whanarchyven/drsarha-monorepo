'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/shared/ui/pagination';
import Image from 'next/image';
import { getContentUrl } from '@/shared/utils/url';
import { Badge } from '@/components/ui/badge';

import InteractiveQuizCard from '@/entities/interactive-quiz/ui/InteractiveQuizCard';
import { InteractiveQuiz } from '@/shared/models/InteractiveQuiz';
import { interactiveQuizzesApi } from '@/shared/api/interactive-quizzes';
import { DeleteDialog } from '@/shared/ui/DeleteDialog/DeleteDialog';
import { copyToClipboardWithToast } from '@/shared/utils/copyToClipboard';

interface InteractiveQuizGridProps {
  data: InteractiveQuiz[];
  isLoading: boolean;
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
  onPageChange: (page: number) => void;
}

export function InteractiveQuizGrid({
  data,
  isLoading,
  pagination,
  onPageChange,
}: InteractiveQuizGridProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!quizToDelete) return;

    try {
      setIsDeleting(true);
      await interactiveQuizzesApi.delete(quizToDelete);
      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error deleting interactive quiz:', error);
    } finally {
      setIsDeleting(false);
      setQuizToDelete(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setQuizToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {data.map((quiz) => (
            <Card key={quiz._id} className="p-4 relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{quiz.name}</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/knowledge/interactive-quizzes/${quiz._id}/edit`
                      )
                    }>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(quiz._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="relative w-full h-96 mb-4 border rounded-md overflow-hidden">
                <Image
                  src={getContentUrl(quiz.cover_image)}
                  alt={quiz.name}
                  fill
                  className="object-cover"
                />
                <Button
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={async () =>
                    await copyToClipboardWithToast(quiz._id as string)
                  }>
                  {quiz._id}
                </Button>
              </div>
              <div className="text-sm mb-2">
                <strong>Доступно ошибок:</strong> {quiz.available_errors}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Вопросов: {quiz.questions.length}
                </span>
                <span className="text-sm text-gray-500">
                  Звёзды: {quiz.stars}
                </span>
              </div>
            </Card>
          ))}
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}>
        Вы уверены, что хотите удалить интерактивную викторину?
      </DeleteDialog>
    </>
  );
}
