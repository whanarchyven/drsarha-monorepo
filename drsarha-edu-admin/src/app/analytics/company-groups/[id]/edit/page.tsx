'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type GroupMemberDraft = { companyId: string; title: string };

function SortableMemberRow({
  id,
  name,
  slug,
  title,
  onTitleChange,
}: {
  id: string;
  name: string;
  slug: string;
  title: string;
  onTitleChange: (value: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-wrap items-center gap-2 p-2 border rounded-md bg-background"
      {...attributes}>
      <button
        type="button"
        className="cursor-grab touch-none p-1 rounded hover:bg-muted shrink-0"
        aria-label="Перетащить"
        {...listeners}>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <span className="text-sm font-medium truncate">{name}</span>
        <span className="text-sm text-muted-foreground truncate">{slug}</span>
        <Input
          className="h-8 max-w-xs text-sm"
          placeholder="Подпись в группе (пусто = название компании)"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}

export default function EditCompanyGroupPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as Id<'company_groups'>;

  const group = useQuery(api.functions.company_groups.getById, { id });
  const members = useQuery(api.functions.company_groups.listCompaniesInGroup, {
    group_id: id,
  });
  const companies = useQuery(api.functions.companies.listBriefForGroupPicker, {
    limit: 5000,
  });

  const updateGroup = useMutation(api.functions.company_groups.update);
  const setMembers = useMutation(api.functions.company_groups.setGroupMembers);
  const removeGroup = useMutation(api.functions.company_groups.remove);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [password, setPassword] = useState('');
  /** Порядок и подписи участников (как в публичном API: title + slug). */
  const [orderedMembers, setOrderedMembers] = useState<GroupMemberDraft[]>([]);
  const [filter, setFilter] = useState('');
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const companyById = useMemo(() => {
    const m = new Map<string, { name: string; slug: string }>();
    companies?.forEach((c) =>
      m.set(String(c._id), { name: c.name, slug: c.slug }),
    );
    members?.forEach((x) =>
      m.set(String(x._id), { name: x.name, slug: x.slug }),
    );
    return m;
  }, [companies, members]);

  useEffect(() => {
    if (!group) return;
    setName(group.name);
    setSlug(group.slug);
    setLogo(group.logo);
    setPassword(group.password);
  }, [group]);

  useEffect(() => {
    if (!members) return;
    setOrderedMembers(
      members.map((m) => ({
        companyId: String(m._id),
        title: m.member_title ?? '',
      })),
    );
  }, [members]);

  const selectedSet = useMemo(
    () => new Set(orderedMembers.map((m) => m.companyId)),
    [orderedMembers],
  );

  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    const f = filter.trim().toLowerCase();
    if (!f) return companies;
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(f) || c.slug.toLowerCase().includes(f),
    );
  }, [companies, filter]);

  const toggle = (companyId: string, checked: boolean) => {
    setOrderedMembers((prev) => {
      if (checked) {
        if (prev.some((x) => x.companyId === companyId)) return prev;
        return [...prev, { companyId, title: '' }];
      }
      return prev.filter((x) => x.companyId !== companyId);
    });
  };

  const updateMemberTitle = (companyId: string, title: string) => {
    setOrderedMembers((prev) =>
      prev.map((m) => (m.companyId === companyId ? { ...m, title } : m)),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedMembers((items) => {
      const oldIndex = items.findIndex((x) => x.companyId === String(active.id));
      const newIndex = items.findIndex((x) => x.companyId === String(over.id));
      if (oldIndex < 0 || newIndex < 0) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateGroup({
        id,
        data: {
          name: name.trim(),
          slug: slug.trim(),
          logo: logo.trim(),
          password,
        },
      });
      toast.success('Данные группы сохранены');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMembers = async () => {
    setSaving(true);
    try {
      await setMembers({
        group_id: id,
        members: orderedMembers.map((m) => ({
          company_id: m.companyId as Id<'companies'>,
          title: m.title.trim() === '' ? undefined : m.title.trim(),
        })),
      });
      toast.success('Состав и порядок сохранены');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Ошибка состава');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Удалить группу? Компании останутся без привязки к группе.',
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      await removeGroup({ id });
      toast.success('Группа удалена');
      router.push('/analytics/company-groups');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Ошибка удаления');
    } finally {
      setSaving(false);
    }
  };

  if (group === undefined || members === undefined) {
    return <div>Загрузка…</div>;
  }

  if (group === null) {
    return (
      <div>
        <p>Группа не найдена</p>
        <Link href="/analytics/company-groups">К списку</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/analytics/company-groups">
          <Button variant="outline" type="button">
            ← К списку
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Группа: {group.name}</h1>
      </div>

      <form onSubmit={handleSaveMeta} className="space-y-4 border rounded-lg p-4">
        <h2 className="font-semibold">Реквизиты</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="eg-name">Название</Label>
            <Input
              id="eg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="eg-slug">Slug</Label>
            <Input
              id="eg-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="eg-logo">URL логотипа</Label>
            <Input
              id="eg-logo"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="eg-password">Пароль</Label>
            <Input
              id="eg-password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
        <Button type="submit" disabled={saving}>
          Сохранить реквизиты
        </Button>
      </form>

      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Порядок компаний в группе</h2>
          <Button
            type="button"
            onClick={handleSaveMembers}
            disabled={saving || companies === undefined}>
            Сохранить состав и порядок
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Перетаскивайте строки за иконку ⋮⋮. Порядок и подписи уходят в публичный
          ответ{' '}
          <code className="text-xs bg-muted px-1 rounded">
            companies: {'{'} title, slug {'}'}
          </code>
          .
        </p>
        {orderedMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            Пока ни одной компании — отметьте их в списке ниже.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}>
            <SortableContext
              items={orderedMembers.map((m) => m.companyId)}
              strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {orderedMembers.map(({ companyId: cid, title }) => {
                  const meta = companyById.get(cid);
                  return (
                    <SortableMemberRow
                      key={cid}
                      id={cid}
                      name={meta?.name ?? cid}
                      slug={meta?.slug ?? ''}
                      title={title}
                      onTitleChange={(v) => updateMemberTitle(cid, v)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">Добавить / убрать компании</h2>
        <p className="text-sm text-muted-foreground">
          Новые отмеченные компании попадают в конец списка порядка. Снятие
          галочки убирает из группы.
        </p>
        <Input
          placeholder="Поиск по названию или slug…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-md"
        />
        <div className="max-h-[420px] overflow-y-auto border rounded-md divide-y">
          {companies === undefined ? (
            <p className="p-4 text-sm text-muted-foreground">
              Загрузка списка компаний…
            </p>
          ) : filteredCompanies.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Нет совпадений</p>
          ) : (
            filteredCompanies.map((c) => {
              const cid = String(c._id);
              const inOther =
                c.group_id != null && String(c.group_id) !== String(id);
              return (
                <label
                  key={cid}
                  className="flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    checked={selectedSet.has(cid)}
                    onCheckedChange={(v) => toggle(cid, v === true)}
                  />
                  <span className="flex-1 text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {c.slug}
                    </span>
                    {inOther ? (
                      <span className="block text-xs text-amber-600 mt-0.5">
                        сейчас в другой группе — при включении сюда будет
                        перенесена
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>

      <div>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={saving}>
          Удалить группу
        </Button>
      </div>
    </div>
  );
}
