'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tagsApi } from '@/shared/api/tags';
import type { Tag } from '@/shared/models/Tag';
import type { BaseQueryParams } from '@/shared/api/types';
import { TagGrid } from './_components/TagGrid';
import { toast } from 'sonner';

export default function TagsPage() {
  const [data, setData] = useState<Tag[]>([]);
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
      const response = await tagsApi.getAll({
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
      console.error('Error fetching tags:', error);
      toast.error('Ошибка при загрузке тегов');
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
    router.push(`/knowledge/tags/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      await tagsApi.delete(id);
      toast.success('Тег успешно удален');
      await fetchData(); // Перезагружаем данные после удаления
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
