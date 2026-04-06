import Link from 'next/link';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Company } from '@/entities/company/model';

export default async function CompanyViewAnalyticsPage({
  params,
}: {
  params: { id: string };
}) {
  const convexUrl =
    process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || '';
  if (!convexUrl) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <p className="text-destructive">CONVEX_URL не задан</p>
      </div>
    );
  }

  const client = new ConvexHttpClient(convexUrl);
  const company = (await client.query(api.functions.companies.getById, {
    id: params.id,
  })) as Company | null;

  if (!company) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold">Компания не найдена</h1>
        <Button asChild variant="outline">
          <Link href="/analytics/companies">К списку компаний</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{company.name}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/analytics/companies">Назад</Link>
          </Button>
          <Button asChild>
            <Link href={`/analytics/companies/${params.id}/edit`}>
              Редактировать
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Общая информация</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-full max-w-xs aspect-square object-cover rounded-md border"
              />
            ) : null}
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Slug:</span>{' '}
              <Badge variant="outline">{company.slug}</Badge>
            </p>
            <p>
              <span className="text-muted-foreground">Создана:</span>{' '}
              {company.created_at}
            </p>
            <p>
              <span className="text-muted-foreground">Обновлена:</span>{' '}
              {company.updated_at}
            </p>
            {company.isActive !== undefined && (
              <p>
                <span className="text-muted-foreground">Активна:</span>{' '}
                {company.isActive ? 'да' : 'нет'}
              </p>
            )}
            <p className="pt-2">{company.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Дашборды и статистики</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {company.dashboards.map((dashboard, dIdx) => (
            <div key={dIdx} className="rounded-lg border p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{dashboard.name}</h3>
                <Badge variant="secondary">{dashboard.icon}</Badge>
                {dashboard.dashboardPercent != null && (
                  <span className="text-xs text-muted-foreground">
                    Доля: {(dashboard.dashboardPercent * 100).toFixed(1)}%
                  </span>
                )}
              </div>
              <ul className="space-y-2 text-sm">
                {dashboard.stats.map((stat, sIdx) => (
                  <li
                    key={sIdx}
                    className="rounded-md bg-muted/40 px-3 py-2 space-y-1">
                    <div className="font-medium">{stat.name}</div>
                    <div className="text-muted-foreground">
                      question_id:{' '}
                      <code className="text-xs">{stat.question_id}</code>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Масштабы: {stat.scales?.length ?? 0}, графики:{' '}
                      {stat.graphics?.length ?? 0}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
