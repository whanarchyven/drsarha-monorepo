'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BroadcastSettingsForm } from './_components/BroadcastSettingsForm';

export default function BroadcastPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Трансляция</h1>
          <p className="text-muted-foreground">
            Управление iframe трансляции и конференционными интерактивами.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/broadcast/interactives')}>
            Все интерактивы
          </Button>
          <Button onClick={() => router.push('/broadcast/interactives/create')}>
            Создать интерактив
          </Button>
        </div>
      </div>

      <BroadcastSettingsForm />

      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
          <CardDescription>
            Используйте отдельный раздел для создания, редактирования и публикации интерактивов.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push('/broadcast/interactives')}>
            Перейти к интерактивам
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/broadcast/interactives/create')}>
            Создать новый интерактив
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
