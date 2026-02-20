'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TagGrid } from './_components/TagGrid';
import { toast } from 'sonner';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

export default function TagsPage() {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const limit = 20;
  const router = useRouter();
  const response = useQuery(api.functions.pin_tags.list, {
    search,
    page,
    limit,
  });
  const removeTag = useMutation(api.functions.pin_tags.remove);
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
    router.push(`/knowledge/tags/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      await removeTag({ id: id as Id<'pin_tags'> });
      toast.success('Тег успешно удален');
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      toast.error('Ошибка при удалении тега');
    }
  };

  const handleCreate = () => {
    router.push('/knowledge/tags/create');
  };

  return (
    <TagGrid
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
