'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ConferencePromocodesManager } from './_components/ConferencePromocodesManager';

export default function BroadcastPromocodesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Промокоды</h1>
          <p className="text-muted-foreground">
            Управление конференционными промокодами и статистикой их
            использования.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/broadcast')}>
            К настройкам трансляции
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/broadcast/interactives')}>
            К интерактивам
          </Button>
        </div>
      </div>

      <ConferencePromocodesManager />
    </div>
  );
}
