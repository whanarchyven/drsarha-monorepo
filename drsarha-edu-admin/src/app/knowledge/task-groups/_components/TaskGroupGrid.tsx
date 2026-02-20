'use client';

import { Button } from '@/components/ui/button';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { api } from '@convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState, useEffect } from 'react';
import { Pagination } from '@/shared/ui/pagination';
import { useDebounce } from '@/shared/hooks/useDebounce';
import LoadingSpinner from '@/shared/ui/LoadingSpinner/LoadingSpinner';

interface TaskGroupGridProps {
  data: FunctionReturnType<typeof api.functions.task_groups.getAll>;
  isLoading: boolean;
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onView: (id: string) => void;
  onSearch: (params: { search?: string; page?: number }) => void;
}

export function TaskGroupGrid({
  data,
  isLoading,
  pagination,
  onEdit,
  onDelete,
  onCreate,
  onView,
  onSearch,
}: TaskGroupGridProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const getRewardTotals = (
    group: FunctionReturnType<typeof api.functions.task_groups.getAll>[number]
  ) => {
    const items = group.reward?.items ?? [];
    return items.reduce(
      (acc, item) => {
        if (item.type === 'stars') acc.stars += item.amount || 0;
        if (item.type === 'exp') acc.exp += item.amount || 0;
        return acc;
      },
      { stars: 0, exp: 0 }
    );
  };

  useEffect(() => {
    onSearch({ search: debouncedSearch, page: 1 });
  }, [debouncedSearch]);

  const handleDelete = async (id: string) => {
    setDeleteId(null);
    onDelete(id);
  };

  if (isLoading && data.length === 0) {
    return (
      <div className="container p-6">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Группы заданий</h1>
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Создать группу
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск групп..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {data.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground mb-4">
              {searchTerm ? 'Группы не найдены' : 'Группы еще не созданы'}
            </div>
            {!searchTerm && (
              <Button onClick={onCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Создать первую группу
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {data.map((group) => {
                const rewardTotals = getRewardTotals(group);
                return (
                  <div
                    key={group._id}
                    className="border rounded-lg p-4 bg-card flex flex-col gap-2 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onView(group._id)}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {group.name}
                        </h3>
                        <div className="text-xs text-muted-foreground mb-1">
                          {group.startDate} — {group.endDate}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2 mb-1">
                          {group.description}
                        </div>
                        <div className="flex gap-2 text-xs mt-2">
                          <span>⭐ {rewardTotals.stars}</span>
                          <span>🧠 {rewardTotals.exp}</span>
                          <span>Уровень: {group.level || 'Не указан'}</span>
                        </div>
                      </div>
                      <div
                        className="flex flex-col gap-2 items-end"
                        onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit(group._id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteId(group._id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Всего: {pagination.total}
                </div>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) =>
                    onSearch({ search: searchTerm, page })
                  }
                  disabled={isLoading}
                />
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить эту группу? Это действие нельзя
              отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
