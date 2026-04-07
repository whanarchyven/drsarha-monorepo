'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CreateCompanyGroupPage() {
  const router = useRouter();
  const insert = useMutation(api.functions.company_groups.insert);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const doc = await insert({
        name: name.trim(),
        slug: slug.trim(),
        logo: logo.trim(),
        password,
        created_at: now,
        updated_at: now,
      });
      toast.success('Группа создана');
      router.push(`/analytics/company-groups/${doc._id}/edit`);
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : 'Не удалось создать группу',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Link href="/analytics/company-groups">
          <Button variant="outline" type="button">
            ← К списку
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Новая группа</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="cg-name">Название</Label>
          <Input
            id="cg-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="cg-slug">Slug (уникальный)</Label>
          <Input
            id="cg-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            placeholder="my-group"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="cg-logo">URL логотипа</Label>
          <Input
            id="cg-logo"
            type="url"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="cg-password">Пароль группы</Label>
          <Input
            id="cg-password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? 'Сохранение…' : 'Создать и перейти к составу'}
        </Button>
      </form>
    </div>
  );
}
