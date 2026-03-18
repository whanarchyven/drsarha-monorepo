'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { ConferenceInteractiveGrid } from './_components/ConferenceInteractiveGrid';

export default function BroadcastInteractivesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryArgs = useMemo(() => {
    const page = searchParams.get('page');
    return {
      page: page ? Number(page) : 1,
      limit: 12,
    };
  }, [searchParams]);

  const response = useQuery(
    api.functions.conference_interactives.listInteractives,
    queryArgs
  );
  const deleteInteractive = useMutation(
    api.functions.conference_interactives.deleteInteractive
  );
  const setDisplayedInteractive = useMutation(
    api.functions.conference_interactives.setDisplayedInteractive
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Интерактивы трансляции</h1>
          <p className="text-muted-foreground">
            Создание, редактирование и публикация тестов и опросов.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/broadcast')}>
            К настройкам трансляции
          </Button>
          <Button onClick={() => router.push('/broadcast/interactives/create')}>
            Создать интерактив
          </Button>
        </div>
      </div>

      <ConferenceInteractiveGrid
        data={response?.items}
        isLoading={response === undefined}
        pagination={response}
        onPageChange={(page) => {
          const nextParams = new URLSearchParams(searchParams);
          nextParams.set('page', String(page));
          router.push(`${pathname}?${nextParams.toString()}`);
        }}
        onDelete={async (id: Id<'conference_interactives'>) => {
          await deleteInteractive({ id });
        }}
        onToggleDisplayed={async (
          id: Id<'conference_interactives'>,
          isDisplayed: boolean
        ) => {
          await setDisplayedInteractive({ id, isDisplayed });
        }}
      />
    </div>
  );
}
