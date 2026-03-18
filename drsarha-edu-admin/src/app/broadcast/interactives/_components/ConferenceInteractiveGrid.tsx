'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteDialog } from '@/shared/ui/DeleteDialog/DeleteDialog';
import { Pagination } from '@/shared/ui/pagination';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import type { FunctionReturnType } from 'convex/server';

type ConferenceInteractiveItem = FunctionReturnType<
  typeof api.functions.conference_interactives.listInteractives
>['items'][number];

interface ConferenceInteractiveGridProps {
  data: ConferenceInteractiveItem[] | undefined;
  isLoading: boolean;
  pagination:
    | FunctionReturnType<typeof api.functions.conference_interactives.listInteractives>
    | undefined;
  onPageChange: (page: number) => void;
  onDelete: (id: Id<'conference_interactives'>) => Promise<unknown>;
  onToggleDisplayed: (
    id: Id<'conference_interactives'>,
    isDisplayed: boolean
  ) => Promise<unknown>;
}

export function ConferenceInteractiveGrid({
  data,
  isLoading,
  pagination,
  onPageChange,
  onDelete,
  onToggleDisplayed,
}: ConferenceInteractiveGridProps) {
  const router = useRouter();
  const [interactiveToDelete, setInteractiveToDelete] =
    useState<Id<'conference_interactives'> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [busyInteractiveId, setBusyInteractiveId] =
    useState<Id<'conference_interactives'> | null>(null);

  const handleDelete = async () => {
    if (!interactiveToDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(interactiveToDelete);
      toast.success('Интерактив удалён');
      setInteractiveToDelete(null);
    } catch (error) {
      console.error('Error deleting conference interactive:', error);
      toast.error('Не удалось удалить интерактив');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleDisplayed = async (
    id: Id<'conference_interactives'>,
    nextValue: boolean
  ) => {
    try {
      setBusyInteractiveId(id);
      await onToggleDisplayed(id, nextValue);
      toast.success(
        nextValue
          ? 'Интерактив опубликован в трансляции'
          : 'Интерактив скрыт из трансляции'
      );
    } catch (error) {
      console.error('Error toggling interactive visibility:', error);
      toast.error('Не удалось изменить статус интерактива');
    } finally {
      setBusyInteractiveId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-5 space-y-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Интерактивы ещё не созданы.
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((interactive) => (
            <Card key={interactive._id} className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{interactive.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {interactive.kind === 'quiz' ? 'Тест' : 'Опрос'}
                    </Badge>
                    {interactive.isDisplayed && (
                      <Badge className="bg-green-600 hover:bg-green-600">
                        В трансляции
                      </Badge>
                    )}
                    {interactive.showResults && (
                      <Badge variant="outline">Показывает результаты</Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/broadcast/interactives/${interactive._id}/edit`
                      )
                    }>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setInteractiveToDelete(interactive._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Вопросов: {interactive.questions.length}</p>
                <p>
                  Последнее обновление:{' '}
                  {new Date(interactive.updatedAt).toLocaleString('ru-RU')}
                </p>
              </div>

              <div className="rounded-lg border p-3 space-y-2">
                <p className="text-sm font-medium">Быстрые действия</p>
                <Button
                  className="w-full"
                  variant={interactive.isDisplayed ? 'outline' : 'default'}
                  disabled={busyInteractiveId === interactive._id}
                  onClick={() =>
                    handleToggleDisplayed(
                      interactive._id,
                      !interactive.isDisplayed
                    )
                  }>
                  {interactive.isDisplayed
                    ? 'Скрыть из трансляции'
                    : 'Показать в трансляции'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {!!pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center pt-2">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>

      <DeleteDialog
        isOpen={interactiveToDelete !== null}
        onClose={() => setInteractiveToDelete(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}>
        Вы уверены, что хотите удалить этот интерактив?
      </DeleteDialog>
    </>
  );
}
