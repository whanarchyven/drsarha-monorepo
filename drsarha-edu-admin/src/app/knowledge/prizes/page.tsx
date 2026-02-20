'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrizeGrid } from './_components/PrizeGrid';
import { toast } from 'sonner';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

export default function PrizesPage() {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState<number | undefined>(undefined);
  const limit = 20;
  const router = useRouter();
  const response = useQuery(api.functions.prizes.list, {
    search,
    page,
    limit,
    level,
  });
  const removePrize = useMutation(api.functions.prizes.remove);
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

  const handleSearch = (params: {
    search?: string;
    page?: number;
    level?: number;
  }) => {
    setSearch(params.search || undefined);
    setPage(params.page || 1);
    setLevel(params.level);
  };

  const handleEdit = async (id: string) => {
    router.push(`/knowledge/prizes/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      await removePrize({ id: id as Id<'prizes'> });
      toast.success('Приз успешно удален');
    } catch (error: any) {
      console.error('Error deleting prize:', error);
      toast.error('Ошибка при удалении приза');
    }
  };

  const handleCreate = () => {
    router.push('/knowledge/prizes/create');
  };

  return (
    <PrizeGrid
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
