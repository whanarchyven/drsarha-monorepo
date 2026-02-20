'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InteractiveTaskGrid } from './_components/InteractiveTaskGrid';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

export default function ClinicAtlasesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentNozologyId = searchParams.get('nozologyId') || undefined;
  const searchQuery = searchParams.get('search') || '';

  const queryArgs = useMemo(() => {
    const page = searchParams.get('page');
    const adminId = process.env.NEXT_PUBLIC_ADMIN_ID || undefined;
    return {
      nozology: currentNozologyId,
      search: searchQuery || undefined,
      page: page ? Number(page) : 1,
      limit: 12,
      admin_id: adminId,
    };
  }, [currentNozologyId, searchQuery, searchParams]);

  const response = useQuery(api.functions.interactive_tasks.list, queryArgs);
  const removeInteractiveTask = useMutation(api.functions.interactive_tasks.remove);
  const data = response?.items;
  const isLoading = response === undefined;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Интерактивные задачи</h1>
        <Button
          onClick={() => router.push('/knowledge/interactive-tasks/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Создать интерактивную задачу
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Поиск интерактивных задач..."
          value={searchQuery}
          onChange={(e) => {
            const nextParams = new URLSearchParams(searchParams);
            if (e.target.value) {
              nextParams.set('search', e.target.value);
            } else {
              nextParams.delete('search');
            }
            nextParams.delete('page');
            router.push(`${pathname}?${nextParams.toString()}`);
          }}
          className="w-full"
        />
      </div>

      <InteractiveTaskGrid
        data={data}
        isLoading={isLoading}
        pagination={response}
        onPageChange={(page) => {
          const nextParams = new URLSearchParams(searchParams);
          nextParams.set('page', String(page));
          router.push(`${pathname}?${nextParams.toString()}`);
        }}
        onDelete={async (id: Id<'interactive_tasks'>) => {
          await removeInteractiveTask({ id });
        }}
      />
    </div>
  );
}
