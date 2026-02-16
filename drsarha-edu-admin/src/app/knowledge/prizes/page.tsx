'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { prizesApi } from '@/shared/api/prizes';
import type { Prize } from '@/shared/models/Prize';
import type { BaseQueryParams } from '@/shared/api/types';
import { PrizeGrid } from './_components/PrizeGrid';
import { toast } from 'sonner';

interface PrizeSearchParams extends BaseQueryParams {
  level?: number;
}

export default function PrizesPage() {
  const [data, setData] = useState<Prize[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchData = async (params?: PrizeSearchParams) => {
    setIsLoading(true);
    try {
      const response = await prizesApi.getAll({
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
      console.error('Error fetching prizes:', error);
      toast.error('Ошибка при загрузке призов');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (params: {
    search?: string;
    page?: number;
    level?: number;
  }) => {
    const searchParams: PrizeSearchParams = {};

    if (params.search) {
      searchParams.search = params.search;
    }
    if (params.page) {
      searchParams.page = params.page;
    }
    if (params.level) {
      searchParams.level = params.level;
    }

    fetchData(searchParams);
  };

  const handleEdit = async (id: string) => {
    router.push(`/knowledge/prizes/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      await prizesApi.delete(id);
      toast.success('Приз успешно удален');
      await fetchData(); // Перезагружаем данные после удаления
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
