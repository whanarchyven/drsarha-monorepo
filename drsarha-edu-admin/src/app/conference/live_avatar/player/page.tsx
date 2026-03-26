'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString('ru-RU');
}

export default function LiveAvatarPlayerPage() {
  const latestAudio = useQuery(
    api.functions.conference_generated_audio.getLatestConferenceGeneratedAudio,
    {}
  );

  const isLoading = latestAudio === undefined;
  const isEmpty = latestAudio === null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Live Avatar Player</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Здесь воспроизводится последнее аудио, сохранённое в Convex.
          </p>
        </div>

        <Link href="/conference/live_avatar">
          <Button variant="outline">Назад к генерации</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последнее аудио</CardTitle>
          <CardDescription>
            Источник: Convex Storage. Генерация может выполняться из другого
            доступного окружения.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-6 w-52" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {isEmpty && (
            <p className="text-sm text-neutral-500">
              В Convex пока нет сохранённого аудио. Сначала сгенерируйте его на
              странице `Live Avatar`.
            </p>
          )}

          {!isLoading && !isEmpty && latestAudio && (
            <>
              <div className="grid gap-2 text-sm text-neutral-600">
                <p>
                  <span className="font-medium text-neutral-900">Файл:</span>{' '}
                  {latestAudio.fileName}
                </p>
                <p>
                  <span className="font-medium text-neutral-900">Провайдер:</span>{' '}
                  {latestAudio.provider}
                </p>
                <p>
                  <span className="font-medium text-neutral-900">Модель:</span>{' '}
                  {latestAudio.modelId || 'не указана'}
                </p>
                <p>
                  <span className="font-medium text-neutral-900">
                    Обновлено:
                  </span>{' '}
                  {formatDate(latestAudio.updatedAt)}
                </p>
              </div>

              {latestAudio.audioUrl ? (
                <>
                  <audio className="w-full" controls src={latestAudio.audioUrl}>
                    Ваш браузер не поддерживает проигрывание аудио.
                  </audio>

                  <a href={latestAudio.audioUrl} download={latestAudio.fileName}>
                    <Button variant="outline" size="sm">
                      Скачать последнее аудио
                    </Button>
                  </a>
                </>
              ) : (
                <p className="text-sm text-red-600">
                  Не удалось получить публичный URL аудио из Convex Storage.
                </p>
              )}

              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
                <h2 className="text-sm font-medium">Текст озвучки</h2>
                <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-700">
                  {latestAudio.text}
                </pre>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
