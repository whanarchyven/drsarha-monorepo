'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { interactiveMatchesApi } from '@/shared/api/interactive-matches';
import type { InteractiveMatch } from '@/shared/models/InteractiveMatch';
import type { BaseQueryParams } from '@/shared/api/types';
import { useSearchParams } from 'next/navigation';
import { InteractiveMatchGrid } from './_components/InteractiveMatchGrid';

export default function InteractiveMatchesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nozologyId = searchParams.get('nozologyId') || undefined;

  const [data, setData] = useState<InteractiveMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false,
  });

  const fetchData = async (params?: BaseQueryParams) => {
    setIsLoading(true);
    try {
      const response = await interactiveMatchesApi.getAll({
        ...params,
        nozologyId,
        search: searchQuery,
      });

      setData(response.items);
      setPagination({
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
        hasMore: response.hasMore,
      });
    } catch (error) {
      console.error('Error fetching interactive matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [nozologyId]);

  const handleSearch = () => {
    fetchData();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Интерактивные соединения</h1>
        <Button
          onClick={() => router.push('/knowledge/interactive-matches/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Создать интерактивное соединение
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Поиск интерактивных соединений..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full"
        />
        <Button onClick={handleSearch}>Поиск</Button>
      </div>

      <InteractiveMatchGrid
        data={data}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={(page) => fetchData({ page })}
      />
    </div>
  );
}
