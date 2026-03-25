'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Edit, Trash2, Search } from 'lucide-react';
import Image from 'next/image';
import { BrochureSkeletonGrid } from './BrochureSkeleton';
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
import { getContentUrl } from '@/shared/utils/url';
import { copyToClipboardWithToast } from '@/shared/utils/copyToClipboard';
import { api } from '@convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import type { Id } from '@convex/_generated/dataModel';

type BrochureList = FunctionReturnType<typeof api.functions.brochures.list>;
type BrochureItem = BrochureList['items'][number];

interface BrochureGridProps {
  data: BrochureItem[] | undefined;
  isLoading: boolean;
  pagination: BrochureList | undefined;
  onEdit: (id: Id<'brochures'>) => void;
  onDelete: (id: Id<'brochures'>) => void;
  onCreate: () => void;
  onSearch: (params: { search?: string; page?: number }) => void;
}

export function BrochureGrid({
  data,
  isLoading,
  pagination,
  onEdit,
  onDelete,
  onCreate,
  onSearch,
}: BrochureGridProps) {
  const [deleteId, setDeleteId] = useState<Id<'brochures'> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Эффект для поиска
  useEffect(() => {
    onSearch({ search: debouncedSearch, page: 1 });
  }, [debouncedSearch]);

  const handleDelete = async (id: Id<'brochures'>) => {
    setDeleteId(null);
    onDelete(id);
  };

  return (
    <div className="container p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Брошюры</h1>
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Создать
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск брошюр..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <BrochureSkeletonGrid />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {data?.map((brochure) => (
                <Card key={brochure._id} className="flex flex-col">
                  <CardHeader className="p-0 relative">
                    <div className="relative aspect-video w-full">
                      <Image
                        src={getContentUrl(brochure.cover_image)}
                        alt={brochure.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      <Button
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={async () =>
                          await copyToClipboardWithToast(String(brochure._id))
                        }>
                        {brochure._id}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <h2 className="font-semibold text-lg line-clamp-2">
                      {brochure.name}
                    </h2>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <a
                        href={getContentUrl(brochure.pdf_file)}
                        target="_blank"
                        rel="noopener noreferrer">
                        <FileText className="mr-2 h-4 w-4" />
                        Просмотр
                      </a>
                    </Button>
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => onEdit(brochure._id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => setDeleteId(brochure._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Всего: {pagination?.total ?? 0}
              </div>
              <Pagination
                currentPage={pagination?.page ?? 1}
                totalPages={pagination?.totalPages ?? 1}
                onPageChange={(page) => onSearch({ search: searchTerm, page })}
                disabled={isLoading}
              />
            </div>
          </>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить эту брошюру? Это действие нельзя
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
