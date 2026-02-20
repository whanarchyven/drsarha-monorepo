'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { InteractiveMatchGrid } from './_components/InteractiveMatchGrid';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

export default function InteractiveMatchesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nozologyId = searchParams.get('nozologyId') || undefined;
  const pathname = usePathname();
  const searchQuery = searchParams.get('search') || '';

  const queryArgs = useMemo(() => {
    const page = searchParams.get('page');
    const adminId = process.env.NEXT_PUBLIC_ADMIN_ID || undefined;
    return {
      nozology: nozologyId,
      search: searchQuery || undefined,
      page: page ? Number(page) : 1,
      limit: 12,
      admin_id: adminId,
    };
  }, [nozologyId, searchQuery, searchParams]);

  const response = useQuery(api.functions.interactive_matches.list, queryArgs);
  const removeInteractiveMatch = useMutation(api.functions.interactive_matches.remove);
  const data = response?.items;
  const isLoading = response === undefined;

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

      <InteractiveMatchGrid
        data={data}
        isLoading={isLoading}
        pagination={response}
        onPageChange={(page) => {
          const nextParams = new URLSearchParams(searchParams);
          nextParams.set('page', String(page));
          router.push(`${pathname}?${nextParams.toString()}`);
        }}
        onDelete={async (id: Id<'interactive_matches'>) => {
          await removeInteractiveMatch({ id });
        }}
      />
    </div>
  );
}
