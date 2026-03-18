'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function BroadcastSettingsForm() {
  const config = useQuery(api.functions.conference_broadcast.getBroadcastConfig, {});
  const displayedInteractive = useQuery(
    api.functions.conference_interactives.getDisplayedInteractive,
    {}
  );
  const upsertBroadcastConfig = useMutation(
    api.functions.conference_broadcast.upsertBroadcastConfig
  );

  const [title, setTitle] = useState('');
  const [iframeUrl, setIframeUrl] = useState('');
  const [isDisplayed, setIsDisplayed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (config === undefined) {
      return;
    }

    setTitle(config?.title ?? '');
    setIframeUrl(config?.iframeUrl ?? '');
    setIsDisplayed(config?.isDisplayed ?? false);
  }, [config]);

  const handleSubmit = async () => {
    const trimmedIframeUrl = iframeUrl.trim();
    if (!trimmedIframeUrl) {
      toast.error('Ссылка на iframe обязательна');
      return;
    }

    try {
      setIsSubmitting(true);
      const promise = upsertBroadcastConfig({
        title: title.trim() || undefined,
        iframeUrl: trimmedIframeUrl,
        isDisplayed,
      });

      toast.promise(promise, {
        loading: 'Сохраняем настройки трансляции...',
        success: 'Настройки трансляции сохранены',
        error: 'Не удалось сохранить настройки трансляции',
      });

      await promise;
    } catch (error) {
      console.error('Error saving broadcast config:', error);
      toast.error('Не удалось сохранить настройки трансляции');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Настройки трансляции</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="broadcast-title">Название трансляции</Label>
            <Input
              id="broadcast-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Например, Ежегодная конференция"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="broadcast-iframe-url">Ссылка на iframe</Label>
            <Textarea
              id="broadcast-iframe-url"
              value={iframeUrl}
              onChange={(event) => setIframeUrl(event.target.value)}
              placeholder="https://..."
              className="min-h-[140px]"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <p className="font-medium">Показывать трансляцию</p>
              <p className="text-sm text-muted-foreground">
                Если выключено, на клиенте будет отображаться заглушка.
              </p>
            </div>
            <Switch
              checked={isDisplayed}
              onCheckedChange={setIsDisplayed}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить настройки
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Текущий статус</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Трансляция</p>
            <p className="font-medium">
              {config === undefined
                ? 'Загрузка...'
                : config?.isDisplayed
                  ? 'Включена'
                  : 'Выключена'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-muted-foreground">Заголовок</p>
            <p className="font-medium">{config?.title || 'Не задан'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-muted-foreground">Активный интерактив</p>
            <p className="font-medium">
              {displayedInteractive === undefined
                ? 'Загрузка...'
                : displayedInteractive?.title || 'Не выбран'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-muted-foreground">Тип интерактива</p>
            <p className="font-medium">
              {displayedInteractive?.kind === 'quiz'
                ? 'Тест'
                : displayedInteractive?.kind === 'poll'
                  ? 'Опрос'
                  : 'Не выбран'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
