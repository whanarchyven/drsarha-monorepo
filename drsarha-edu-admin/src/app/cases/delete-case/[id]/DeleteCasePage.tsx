'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';

export default function DeleteCaseClientPage({ adminId }: { adminId: string }) {
  const params = useParams();
  const router = useRouter();
  const pinId = String(params?.id ?? '');
  const adminDeletePin = useMutation(api.functions.pin_reports.adminDeletePin);

  const [adminComment, setAdminComment] = useState('');
  const [fine, setFine] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!pinId || !adminComment.trim()) return;
    setLoading(true);
    try {
      const promise = adminDeletePin({
        pinId,
        adminComment: adminComment.trim(),
        fine,
        adminId,
      });
      toast.promise(promise, {
        loading: 'Удаляем кейс...',
        success: 'Кейс удалён',
        error: 'Не удалось удалить кейс',
      });
      await promise;
      router.push('/cases/reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Удаление кейса {pinId}</h1>
      <div className="space-y-3 max-w-md">
        <Input
          placeholder="Комментарий администратора"
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={!adminComment.trim() || loading}>
            Удалить
          </Button>
        </div>
      </div>
    </div>
  );
}
