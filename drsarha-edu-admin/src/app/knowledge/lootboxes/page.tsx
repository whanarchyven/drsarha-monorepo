'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { lootboxesApi } from '@/shared/api/lootboxes';
import type { Lootbox } from '@/shared/models/Lootbox';
import type { BaseQueryParams } from '@/shared/api/types';
import { LootboxGrid } from './_components/LootboxGrid';
import { toast } from 'sonner';

export default function LootboxesPage() {
  const [data, setData] = useState<Lootbox[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchData = async (params?: BaseQueryParams) => {
    setIsLoading(true);
    try {
      const response = await lootboxesApi.getAll({
        ...params,
        page: params?.page || 1,
        limit: params?.limit || 20,
      });
      setData(response.items);
      setPagination({
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
        hasMore: response.hasMore,
      });
    } catch (error: any) {
      console.error('Error fetching lootboxes:', error);
      toast.error('Ошибка при загрузке лутбоксов');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (params: BaseQueryParams) => {
    fetchData(params);
  };

  const handleEdit = async (id: string) => {
    router.push(`/knowledge/lootboxes/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      await lootboxesApi.delete(id);
      toast.success('Лутбокс успешно удален');
      await fetchData();
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
