'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ConferenceUsersManager } from './_components/ConferenceUsersManager';

export default function BroadcastConferenceUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryState = useMemo(() => {
    const pageValue = Number(searchParams.get('page') ?? '1');
    const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;

    return {
      page,
      search: searchParams.get('search')?.trim() ?? '',
    };
  }, [searchParams]);

  const updateParams = (nextPage: number, nextSearch: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPage > 1) {
      params.set('page', String(nextPage));
    } else {
      params.delete('page');
    }

    if (nextSearch) {
      params.set('search', nextSearch);
    } else {
      params.delete('search');
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Пользователи конференции</h1>
          <p className="text-muted-foreground">
            Таблица участников конференции с поиском, статусами и ручным
            аппрувом.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/broadcast')}>
            К настройкам трансляции
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/broadcast/promocodes')}>
            К промокодам
          </Button>
        </div>
      </div>

      <ConferenceUsersManager
        page={queryState.page}
        search={queryState.search}
        onPageChange={(page) => updateParams(page, queryState.search)}
        onSearchChange={(search) => updateParams(1, search)}
      />
    </div>
  );
}
