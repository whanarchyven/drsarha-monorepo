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
import { InteractiveMatch } from '@/shared/models/InteractiveMatch';
import { interactiveMatchesApi } from '@/shared/api/interactive-matches';
import { DeleteDialog } from '@/shared/ui/DeleteDialog/DeleteDialog';
import { copyToClipboardWithToast } from '@/shared/utils/copyToClipboard';

interface InteractiveMatchGridProps {
  data: InteractiveMatch[];
  isLoading: boolean;
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
  onPageChange: (page: number) => void;
}

export function InteractiveMatchGrid({
  data,
  isLoading,
  pagination,
  onPageChange,
}: InteractiveMatchGridProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!matchToDelete) return;

    try {
      setIsDeleting(true);
      await interactiveMatchesApi.delete(matchToDelete);
      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error deleting interactive match:', error);
    } finally {
      setIsDeleting(false);
      setMatchToDelete(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setMatchToDelete(id);
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
          {data.map((match) => (
            <Card key={match._id} className="p-4 relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{match.name}</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/knowledge/interactive-matches/${match._id}/edit`
                      )
                    }>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(match._id!)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="relative w-full h-96 mb-4 border rounded-md overflow-hidden">
                <Image
                  src={getContentUrl(match.cover_image)}
                  alt={match.name}
                  fill
                  className="object-cover"
                />
                <Button
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={async () =>
                    await copyToClipboardWithToast(match._id as string)
                  }>
                  {match._id}
                </Button>
              </div>
              <div className="text-sm mb-2">
                <strong>Доступно ошибок:</strong> {match.available_errors}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Ответов: {match.answers.length}
                </span>
                <span className="text-sm text-gray-500">
                  Звёзды: {match.stars}
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
        Вы уверены, что хотите удалить интерактивное соединение?
      </DeleteDialog>
    </>
  );
}
