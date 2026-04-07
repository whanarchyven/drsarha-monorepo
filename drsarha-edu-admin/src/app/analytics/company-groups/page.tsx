'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';

export default function CompanyGroupsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const groups = useQuery(api.functions.company_groups.list, { page, limit });
  const isLoading = groups === undefined;
  const totalPages = useMemo(() => {
    if (!groups?.total) return 1;
    return Math.max(1, Math.ceil(groups.total / limit));
  }, [groups?.total, limit]);

  if (isLoading) {
    return <div>Загрузка групп...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Группы компаний</h1>
        <Link href="/analytics/company-groups/create">
          <Button>Создать группу</Button>
        </Link>
      </div>
      <p className="text-muted-foreground text-sm mt-2 max-w-2xl">
        Общие реквизиты группы и пароль. В составе у каждой компании можно задать
        подпись (title для API). Публичные данные:{' '}
        <code className="text-xs bg-muted px-1 rounded">
          GET /company-groups/by-slug?group_slug=...
        </code>{' '}
        — в ответе массив{' '}
        <code className="text-xs bg-muted px-1 rounded">companies: {'{'} title, slug {'}'}</code>
        . Проверка пароля группы:{' '}
        <code className="text-xs bg-muted px-1 rounded">
          POST /company-groups/verify-password
        </code>{' '}
        с{' '}
        <code className="text-xs bg-muted px-1 rounded">
          group_slug (или slug) + password
        </code>
        .
      </p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.items.map((g) => (
          <Card key={g._id}>
            <CardHeader>
              <CardTitle>{g.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {g.logo ? (
                <img
                  src={g.logo}
                  alt=""
                  className="w-24 h-24 object-cover rounded-md border"
                />
              ) : null}
              <Badge variant="outline">slug: {g.slug}</Badge>
              <div className="flex gap-2">
                <Link href={`/analytics/company-groups/${g._id}/edit`}>
                  <Button variant="default">Редактировать и состав</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}>
          Назад
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (page < totalPages) setPage((p) => p + 1);
          }}
          disabled={page >= totalPages || isLoading}>
          Вперёд
        </Button>
      </div>
    </div>
  );
}
