'use client';

import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import type { Lootbox } from '@/shared/models/Lootbox';
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
import { LootboxCard } from '@/entities/lootbox/ui/LootboxCard';
import LoadingSpinner from '@/shared/ui/LoadingSpinner/LoadingSpinner';

interface LootboxGridProps {
  data: Lootbox[];
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
  onSearch: (params: { search?: string; page?: number }) => void;
}

export function LootboxGrid({
  data,
  isLoading,
  pagination,
  onEdit,
  onDelete,
  onCreate,
  onSearch,
}: LootboxGridProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Эффект для поиска
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
          <h1 className="text-3xl font-bold">Лутбоксы</h1>
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Создать лутбокс
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск лутбоксов..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {data.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground mb-4">
              {searchTerm ? 'Лутбоксы не найдены' : 'Лутбоксы еще не созданы'}
            </div>
            {!searchTerm && (
              <Button onClick={onCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Создать первый лутбокс
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.map((lootbox) => (
                <LootboxCard
                  key={lootbox._id}
                  lootbox={lootbox}
                  onEdit={onEdit}
                  onDelete={setDeleteId}
                />
              ))}
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
              Вы уверены, что хотите удалить этот лутбокс? Это действие нельзя
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
