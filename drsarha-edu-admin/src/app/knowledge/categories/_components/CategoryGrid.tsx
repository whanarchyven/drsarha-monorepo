'use client';

import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
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
import { useDebounce } from '@/shared/hooks/useDebounce';
import { CategoryCard } from '@/entities/category/ui/CategoryCard';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import type { FunctionReturnType } from 'convex/server';

type CategoryItem = FunctionReturnType<
  typeof api.functions.categories.list
>[number];
interface CategoryGridProps {
  data: CategoryItem[] | undefined;
  isLoading: boolean;

  onEdit: (id: Id<'categories'>) => void;
  onDelete: (id: Id<'categories'>) => void;
  onCreate: () => void;
  onSearch: (params: { search?: string; page?: number }) => void;
}

export function CategoryGrid({
  data,
  isLoading,
  onEdit,
  onDelete,
  onCreate,
  onSearch,
}: CategoryGridProps) {
  const [deleteId, setDeleteId] = useState<Id<'categories'> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Эффект для поиска
  useEffect(() => {
    onSearch({ search: debouncedSearch, page: 1 });
  }, [debouncedSearch]);

  const handleDelete = async (id: Id<'categories'>) => {
    setDeleteId(null);
    onDelete(id);
  };

  return (
    <div className="container p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Категории</h1>
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Создать
          </Button>
        </div>

        {/* <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск категорий..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div> */}

        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {data?.map((category) => (
              <CategoryCard
                key={category._id}
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить эту категорию? Это действие нельзя
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
