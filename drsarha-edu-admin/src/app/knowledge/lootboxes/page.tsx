'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LootboxGrid } from './_components/LootboxGrid';
import { toast } from 'sonner';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

export default function LootboxesPage() {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const limit = 20;
  const router = useRouter();
  const response = useQuery(api.functions.lootboxes.list, {
    search,
    page,
    limit,
  });
  const removeLootbox = useMutation(api.functions.lootboxes.remove);
  const isLoading = response === undefined;
  const data = useMemo(() => response?.items ?? [], [response]);
  const pagination = useMemo(
    () =>
      response ?? {
        total: 0,
        page: 1,
        totalPages: 1,
        hasMore: false,
      },
    [response]
  );

  const handleSearch = (params: { search?: string; page?: number }) => {
    setSearch(params.search || undefined);
    setPage(params.page || 1);
  };

  const handleEdit = async (id: string) => {
    router.push(`/knowledge/lootboxes/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      await removeLootbox({ id: id as Id<'lootboxes'> });
      toast.success('Лутбокс успешно удален');
    } catch (error: any) {
      console.error('Error deleting lootbox:', error);
      toast.error('Ошибка при удалении лутбокса');
    }
  };

  const handleCreate = () => {
    router.push('/knowledge/lootboxes/create');
  };

  return (
    <LootboxGrid
      data={data}
      isLoading={isLoading}
      pagination={pagination}
      onSearch={handleSearch}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
    />
  );
}
