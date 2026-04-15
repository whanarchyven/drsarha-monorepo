'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteDialog } from '@/shared/ui/DeleteDialog/DeleteDialog';
import { Pagination } from '@/shared/ui/pagination';
import { getContentUrl } from '@/shared/utils/url';
import { Pencil, Trash2 } from 'lucide-react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import type { FunctionReturnType } from 'convex/server';

type MarkupTaskItem = FunctionReturnType<
  typeof api.functions.markup_tasks.list
>['items'][number];

interface MarkupTaskGridProps {
  data: MarkupTaskItem[] | undefined;
  isLoading: boolean;
  pagination:
    | FunctionReturnType<typeof api.functions.markup_tasks.list>
    | undefined;
  onPageChange: (page: number) => void;
  onDelete: (id: Id<'markup_tasks'>) => Promise<void>;
}

export function MarkupTaskGrid({
  data,
  isLoading,
  pagination,
  onPageChange,
  onDelete,
}: MarkupTaskGridProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Id<'markup_tasks'> | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(taskToDelete);
      setIsDeleteDialogOpen(false);
      router.refresh();
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="p-4">
            <Skeleton className="mb-3 h-6 w-1/2" />
            <Skeleton className="mb-3 h-64 w-full" />
            <Skeleton className="h-4 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {data?.map((task) => (
            <Card key={task._id} className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{task.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(`/knowledge/markup-tasks/${task._id}/edit`)
                    }>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setTaskToDelete(task._id as Id<'markup_tasks'>);
                      setIsDeleteDialogOpen(true);
                    }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-md border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getContentUrl(task.cover_image)}
                  alt={task.name}
                  className="h-72 w-full object-cover"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={task.app_visible ? 'default' : 'secondary'}>
                  {task.app_visible ? 'Видима в приложении' : 'Скрыта'}
                </Badge>
                {task.idx !== undefined && (
                  <Badge variant="outline">idx: {task.idx}</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>

        {!!pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center">
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
        Вы уверены, что хотите удалить задачу на разметку?
      </DeleteDialog>
    </>
  );
}
