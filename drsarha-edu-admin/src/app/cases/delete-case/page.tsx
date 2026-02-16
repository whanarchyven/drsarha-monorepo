'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function DeleteCaseEntryPage() {
  const [pinId, setPinId] = useState('');
  const router = useRouter();

  const submit = () => {
    const id = pinId.trim();
    if (!id) return;
    router.push(`/cases/delete-case/${encodeURIComponent(id)}`);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Удалить кейс</h1>
      <div className="flex items-center gap-2">
        <Input
          placeholder="ID пина"
          value={pinId}
          onChange={(e) => setPinId(e.target.value)}
        />
        <Button onClick={submit} disabled={!pinId.trim()}>
          Перейти
        </Button>
      </div>
    </div>
  );
}
