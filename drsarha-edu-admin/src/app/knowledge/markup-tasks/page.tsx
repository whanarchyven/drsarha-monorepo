'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MarkupTaskGrid } from './_components/MarkupTaskGrid';

export default function MarkupTasksPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const queryArgs = useMemo(() => {
    const page = searchParams.get('page');
    const adminId = process.env.NEXT_PUBLIC_ADMIN_ID || undefined;
    return {
      search: searchQuery || undefined,
      page: page ? Number(page) : 1,
      limit: 12,
      admin_id: adminId,
    };
  }, [searchParams, searchQuery]);

  const response = useQuery(api.functions.markup_tasks.list, queryArgs);
  const removeTask = useMutation(api.functions.markup_tasks.remove);
  const isLoading = response === undefined;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Задачи на разметку</h1>
        <Button onClick={() => router.push('/knowledge/markup-tasks/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Создать задачу
        </Button>
      </div>

      <Input
        placeholder="Поиск задач на разметку..."
        value={searchQuery}
        onChange={(event) => {
          const nextParams = new URLSearchParams(searchParams);
          if (event.target.value) {
            nextParams.set('search', event.target.value);
          } else {
            nextParams.delete('search');
          }
          nextParams.delete('page');
          router.push(`${pathname}?${nextParams.toString()}`);
        }}
      />

      <MarkupTaskGrid
        data={response?.items}
        isLoading={isLoading}
        pagination={response}
        onPageChange={(page) => {
          const nextParams = new URLSearchParams(searchParams);
          nextParams.set('page', String(page));
          router.push(`${pathname}?${nextParams.toString()}`);
        }}
        onDelete={(id: Id<'markup_tasks'>) => removeTask({ id })}
      />
    </div>
  );
}
