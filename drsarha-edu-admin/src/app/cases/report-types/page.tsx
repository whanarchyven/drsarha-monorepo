'use client';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { pinReportsApi, type PinReportType } from '@/shared/api/pin-reports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ReportTypesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = useMemo(
    () => Number(searchParams.get('page') || '1'),
    [searchParams]
  );
  const limit = useMemo(
    () => Number(searchParams.get('limit') || '20'),
    [searchParams]
  );

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PinReportType[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await pinReportsApi.getReportTypes({ page, limit });
      setItems(data.items);
      setHasMore(data.hasMore);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const updateParams = (
    next: Record<string, string | number | undefined | null>
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') params.delete(k);
      else params.set(k, String(v));
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const submit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (editId) {
        await pinReportsApi.updateReportType(editId, { name: name.trim() });
      } else {
        await pinReportsApi.createReportType({ name: name.trim() });
      }
      setName('');
      setEditId(null);
      fetchData();
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (t: PinReportType) => {
    setEditId(t._id);
    setName(t.name);
  };

  const onDelete = async (id: string) => {
    setLoading(true);
    try {
      await pinReportsApi.deleteReportType(id);
      fetchData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Типы жалоб</h1>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Название типа"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button onClick={submit} disabled={loading || !name.trim()}>
          {editId ? 'Сохранить' : 'Добавить'}
        </Button>
        {editId && (
          <Button
            variant="outline"
            onClick={() => {
              setEditId(null);
              setName('');
            }}
            disabled={loading}>
            Отмена
          </Button>
        )}
      </div>

      <div className="bg-white rounded-md p-4 divide-y">
        {items.map((t) => (
          <div key={t._id} className="py-3 flex items-center justify-between">
            <div>{t.name}</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onEdit(t)}
                disabled={loading}>
                Редактировать
              </Button>
              <Button
                variant="destructive"
                onClick={() => onDelete(t._id)}
                disabled={loading}>
                Удалить
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground">Нет данных</div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateParams({ page: Math.max(1, page - 1), limit })}
          disabled={page === 1 || loading}>
          Назад
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => hasMore && updateParams({ page: page + 1, limit })}
          disabled={!hasMore || loading}>
          Вперед
        </Button>
      </div>
    </div>
  );
}
