'use client';

import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import type { Prize } from '@/shared/models/Prize';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { Pagination } from '@/shared/ui/pagination';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { PrizeCard } from '@/entities/prize/ui/PrizeCard';
import LoadingSpinner from '@/shared/ui/LoadingSpinner/LoadingSpinner';

interface PrizeGridProps {
  data: Prize[];
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
  onSearch: (params: {
    search?: string;
    page?: number;
    level?: number;
  }) => void;
}

export function PrizeGrid({
  data,
  isLoading,
  pagination,
  onEdit,
  onDelete,
  onCreate,
  onSearch,
}: PrizeGridProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Эффект для поиска
  useEffect(() => {
    onSearch({
      search: debouncedSearch,
      page: 1,
      level: levelFilter ? Number(levelFilter) : undefined,
    });
  }, [debouncedSearch, levelFilter]);

  const handleDelete = async (id: string) => {
    setDeleteId(null);
    onDelete(id);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLevelFilter('');
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
          <h1 className="text-3xl font-bold">Призы</h1>
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Создать приз
          </Button>
        </div>

        {/* Поиск и фильтры */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск призов..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Фильтр по уровню" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Уровень 1</SelectItem>
                <SelectItem value="2">Уровень 2</SelectItem>
                <SelectItem value="3">Уровень 3</SelectItem>
                <SelectItem value="4">Уровень 4</SelectItem>
                <SelectItem value="5">Уровень 5</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || levelFilter) && (
              <Button variant="outline" onClick={clearFilters}>
                Сбросить
              </Button>
            )}
          </div>
        </div>

        {data.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground mb-4">
              {searchTerm || levelFilter
                ? 'Призы не найдены'
                : 'Призы еще не созданы'}
            </div>
            {!searchTerm && !levelFilter && (
              <Button onClick={onCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Создать первый приз
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.map((prize) => (
                <PrizeCard
                  key={prize._id}
                  prize={prize}
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
                    onSearch({
                      search: searchTerm,
                      page,
                      level: levelFilter ? Number(levelFilter) : undefined,
                    })
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
              Вы уверены, что хотите удалить этот приз? Это действие нельзя
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
