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
import { Pagination } from '@/shared/ui/pagination';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { NozologyCard } from '@/entities/nozology/ui/NozologyCard';
import { api } from '@convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import type { Id } from '@convex/_generated/dataModel';

type NozologyItem = FunctionReturnType<
  typeof api.functions.nozologies.list
>[number];
type NozologyView = NozologyItem & {
  categoryName?: string;
  materials_count?: { total: number };
};
interface NozologyGridProps {
  data: NozologyView[] | undefined;
  isLoading: boolean;
  onEdit: (id: Id<'nozologies'>) => void;
  onDelete: (id: Id<'nozologies'>) => void;
  onCreate: () => void;
  onSearch: (params: { search?: string; page?: number }) => void;
}

export function NozologyGrid({
  data,
  isLoading,
  onEdit,
  onDelete,
  onCreate,
  onSearch,
}: NozologyGridProps) {
  const [deleteId, setDeleteId] = useState<Id<'nozologies'> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Эффект для поиска
  useEffect(() => {
    onSearch({ search: debouncedSearch, page: 1 });
  }, [debouncedSearch]);

  const handleDelete = async (id: Id<'nozologies'>) => {
    setDeleteId(null);
    onDelete(id);
  };

  return (
    <div className="container p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Нозологии</h1>

          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Создать
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск нозологий..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {data?.map((nozology) => (
              <NozologyCard
                key={nozology._id}
                nozology={nozology}
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
              Вы уверены, что хотите удалить эту нозологию? Это действие нельзя
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
