'use client';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  pinReportsApi,
  type PinReport,
  type PinReportStatus,
} from '@/shared/api/pin-reports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getContentUrl } from '@/shared/utils/url';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function PinReportsPage({ adminId }: { adminId: string }) {
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
  const status = (searchParams.get('status') as PinReportStatus | null) || null;

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PinReport[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [fine, setFine] = useState<number | undefined>();
  const [reward, setReward] = useState<number | undefined>();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await pinReportsApi.getReports({
        page,
        limit,
        search: search || undefined,
        status: status ?? undefined,
      });
      setItems(data.items);
      setHasMore(data.hasMore);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status]);

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

  const openApprove = (id: string) => {
    setActiveId(id);
    setAdminComment('');
    setFine(undefined);
    setReward(undefined);
    setApproveOpen(true);
  };
  const openReject = (id: string) => {
    setActiveId(id);
    setAdminComment('');
    setRejectOpen(true);
  };

  const submitApprove = async () => {
    if (!activeId) return;
    await pinReportsApi.approve(
      activeId,
      { adminComment, fine, reward },
      adminId
    );
    setApproveOpen(false);
    fetchData();
  };

  const submitReject = async () => {
    if (!activeId) return;
    await pinReportsApi.reject(activeId, { adminComment }, adminId);
    setRejectOpen(false);
    fetchData();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Жалобы на пины</h1>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Поиск"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={status ?? 'all'}
          onValueChange={(v) =>
            updateParams({ status: v === 'all' ? null : v, page: 1 })
          }>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="new">Новые</SelectItem>
            <SelectItem value="approved">Аппрувнутые</SelectItem>
            <SelectItem value="rejected">Отклоненные</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() =>
            updateParams({
              page: 1,
              limit,
              status: status ?? undefined,
              search: search || null,
            })
          }
          disabled={loading}>
          Применить
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((r) => (
          <div
            key={r._id}
            className="border rounded-md bg-white p-4 grid grid-cols-4  gap-6 items-start">
            <div className="w-full bg-slate-100 col-span-1 rounded overflow-hidden">
              {r.embed?.pin?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getContentUrl(r.embed.pin.image)}
                  alt={r.embed.pin.title || ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  no image
                </div>
              )}
            </div>
            <div className="text-sm space-y-3 col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div className="font-semibold text-base line-clamp-2">
                  {r.embed?.pin?.title || r.pinId}
                </div>
                <Badge variant="secondary" className="shrink-0 capitalize">
                  {r.status}
                </Badge>
              </div>

              {r.comment ? (
                <div className="text-muted-foreground">
                  <span className="font-medium">Жалоба:</span> {r.comment}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-4 items-center text-muted-foreground">
                <div className="flex items-center gap-2 min-w-[220px]">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={r.embed?.reporter?.avatar || undefined} />
                    <AvatarFallback>
                      {(r.embed?.reporter?.email || 'U')
                        .slice(0, 1)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="truncate">
                    Репортер: {r.embed?.reporter?.email || r.reporter}
                  </div>
                </div>
                <div className="flex items-center gap-2 min-w-[220px]">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={r.embed?.pinAuthor?.avatar || undefined}
                    />
                    <AvatarFallback>
                      {(r.embed?.pinAuthor?.email || 'A')
                        .slice(0, 1)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="truncate">
                    Автор пина: {r.embed?.pinAuthor?.email || r.pinAuthor}
                  </div>
                </div>
                <div className="truncate">
                  Тип: {r.embed?.type?.name || r.type}
                </div>
                <div className="text-xs">
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 justify-start">
              <Button
                variant="outline"
                onClick={() => openApprove(r._id)}
                disabled={loading}>
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => openReject(r._id)}
                disabled={loading}>
                Reject
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

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve report</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Комментарий"
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
            />
            <Input
              placeholder="Штраф (fine)"
              type="number"
              value={fine ?? ''}
              onChange={(e) =>
                setFine(e.target.value ? Number(e.target.value) : undefined)
              }
            />
            <Input
              placeholder="Награда (reward)"
              type="number"
              value={reward ?? ''}
              onChange={(e) =>
                setReward(e.target.value ? Number(e.target.value) : undefined)
              }
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setApproveOpen(false)}>
                Отмена
              </Button>
              <Button
                onClick={submitApprove}
                disabled={!activeId || !adminComment.trim() || loading}>
                Подтвердить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject report</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Комментарий"
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectOpen(false)}>
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={submitReject}
                disabled={!activeId || !adminComment.trim() || loading}>
                Отклонить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
