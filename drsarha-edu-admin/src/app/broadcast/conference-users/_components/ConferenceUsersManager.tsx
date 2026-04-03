'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import type { FunctionReturnType } from 'convex/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/shared/ui/pagination';
import { copyToClipboard } from '@/shared/utils/copyToClipboard';
import { Check, Copy, Loader2, Search, X } from 'lucide-react';
import { toast } from 'sonner';

type ConferenceUserItem = FunctionReturnType<
  typeof api.functions.conference_users.listConferenceUsers
>['items'][number];

type ConferenceUsersManagerProps = {
  page: number;
  search: string;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
};

const ITEMS_PER_PAGE = 15;

const EMPTY_CREATE_FORM = {
  name: '',
  phone: '',
  email: '',
  side: 'jedi' as 'jedi' | 'sith',
};

function formatDate(value: number) {
  return new Date(value).toLocaleString('ru-RU');
}

function getSideLabel(side: ConferenceUserItem['side']) {
  switch (side) {
    case 'jedi':
      return 'Jedi';
    case 'sith':
      return 'Sith';
    case 'ai':
      return 'AI';
    default:
      return side;
  }
}

function getFullStatus(user: ConferenceUserItem) {
  return user.isFullUser ? 'Полный пользователь' : 'Новый пользователь';
}

export function ConferenceUsersManager({
  page,
  search,
  onPageChange,
  onSearchChange,
}: ConferenceUsersManagerProps) {
  const response = useQuery(api.functions.conference_users.listConferenceUsers, {
    page,
    limit: ITEMS_PER_PAGE,
    search: search || undefined,
  });
  const approveConferenceUser = useMutation(
    api.functions.conference_users.approveConferenceUserAdmin
  );
  const registerConferenceUser = useMutation(
    api.functions.conference_users.registerConferenceUser
  );

  const [searchValue, setSearchValue] = useState(search);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<Id<'conference_users'> | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  const items: ConferenceUserItem[] = response?.items ?? [];

  const totals = useMemo(() => {
    return items.reduce(
      (acc: { paid: number; approved: number }, user: ConferenceUserItem) => {
        if (user.isPaid) {
          acc.paid += 1;
        }
        if (user.isApproved) {
          acc.approved += 1;
        }
        return acc;
      },
      {
        paid: 0,
        approved: 0,
      }
    );
  }, [items]);

  const handleCopy = async (value: string | null, key: string, label: string) => {
    if (!value) {
      toast.error(`У пользователя ещё нет ${label.toLowerCase()}`);
      return;
    }

    try {
      await copyToClipboard(value);
      setCopiedKey(key);
      toast.success(`${label} скопирован`);
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 1500);
    } catch (error) {
      console.error(`Failed to copy ${label}:`, error);
      toast.error(`Не удалось скопировать ${label.toLowerCase()}`);
    }
  };

  const handleApprove = async (user: ConferenceUserItem) => {
    try {
      setApprovingId(user._id);
      await approveConferenceUser({ id: user._id as Id<'conference_users'> });
      toast.success('Пользователь аппрувнут, пароль сгенерирован');
    } catch (error) {
      console.error('Error approving conference user:', error);
      toast.error('Не удалось аппрувнуть пользователя');
    } finally {
      setApprovingId(null);
    }
  };

  const handleSearchSubmit = () => {
    onSearchChange(searchValue.trim());
  };

  const handleSearchReset = () => {
    setSearchValue('');
    onSearchChange('');
  };

  const closeCreateDialog = () => {
    if (isCreating) {
      return;
    }

    setIsCreateDialogOpen(false);
    setCreateForm(EMPTY_CREATE_FORM);
  };

  const handleCreateUser = async () => {
    const name = createForm.name.trim();
    const phone = createForm.phone.trim();
    const email = createForm.email.trim().toLowerCase();

    if (!name || !phone || !email) {
      toast.error('Заполните имя, телефон и email');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Введите корректный email');
      return;
    }

    try {
      setIsCreating(true);
      await registerConferenceUser({
        name,
        phone,
        email,
        side: createForm.side,
      });
      toast.success('Пользователь зарегистрирован');
      setIsCreateDialogOpen(false);
      setCreateForm(EMPTY_CREATE_FORM);
      onSearchChange('');
      setSearchValue('');
    } catch (error) {
      console.error('Error registering conference user:', error);
      toast.error('Не удалось зарегистрировать пользователя');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Всего найдено</CardDescription>
            <CardTitle className="text-3xl">{response?.total ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Оплачено на странице</CardDescription>
            <CardTitle className="text-3xl">{totals.paid}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Аппрувнуто на странице</CardDescription>
            <CardTitle className="text-3xl">{totals.approved}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>Пользователи конференции</CardTitle>
            <CardDescription>
              Поиск по email, просмотр статусов и ручной аппрув с генерацией
              пароля.
            </CardDescription>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
            <div className="flex w-full gap-2 md:w-[420px]">
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSearchSubmit();
                  }
                }}
                placeholder="Поиск по email"
              />
              <Button variant="outline" onClick={handleSearchSubmit}>
                <Search className="mr-2 h-4 w-4" />
                Найти
              </Button>
              <Button
                variant="ghost"
                onClick={handleSearchReset}
                disabled={!search && !searchValue}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Зарегистрировать
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {response === undefined ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              Пользователи не найдены.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Пароль</TableHead>
                    <TableHead>Статусы</TableHead>
                    <TableHead>Сторона</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((user: ConferenceUserItem) => {
                    const isFullyApproved =
                      user.isApproved && user.isPaid && Boolean(user.password);

                    return (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{user.name || 'Без имени'}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.phone || 'Телефон не указан'}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="max-w-[220px] truncate">{user.email}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleCopy(
                                  user.email,
                                  `email:${user._id}`,
                                  'Email'
                                )
                              }>
                              {copiedKey === `email:${user._id}` ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="max-w-[180px] truncate">
                              {user.password || 'Не сгенерирован'}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={!user.password}
                              onClick={() =>
                                handleCopy(
                                  user.password,
                                  `password:${user._id}`,
                                  'Пароль'
                                )
                              }>
                              {copiedKey === `password:${user._id}` ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={user.isPaid ? 'success' : 'secondary'}>
                              {user.isPaid ? 'Оплачен' : 'Не оплачен'}
                            </Badge>
                            <Badge
                              variant={user.isApproved ? 'success' : 'secondary'}>
                              {user.isApproved ? 'Аппрувнут' : 'Не аппрувнут'}
                            </Badge>
                            <Badge variant="outline">{getFullStatus(user)}</Badge>
                          </div>
                        </TableCell>

                        <TableCell>{getSideLabel(user.side)}</TableCell>

                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(user._creationTime)}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            disabled={isFullyApproved || approvingId === user._id}
                            onClick={() => handleApprove(user)}>
                            {approvingId === user._id && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isFullyApproved ? 'Аппрувнут' : 'Аппрув'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Всего найдено: {response.total}
                </p>

                {response.totalPages > 1 && (
                  <Pagination
                    currentPage={response.page}
                    totalPages={response.totalPages}
                    onPageChange={onPageChange}
                  />
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeCreateDialog();
            return;
          }

          setIsCreateDialogOpen(true);
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ручная регистрация пользователя</DialogTitle>
            <DialogDescription>
              Создайте участника конференции вручную. После этого его можно будет
              аппрувнуть из таблицы.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conference-user-name">Имя</Label>
              <Input
                id="conference-user-name"
                value={createForm.name}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                placeholder="Например, Иван Иванов"
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conference-user-phone">Телефон</Label>
              <Input
                id="conference-user-phone"
                value={createForm.phone}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    phone: event.target.value,
                  }))
                }
                placeholder="+7 999 123-45-67"
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conference-user-email">Email</Label>
              <Input
                id="conference-user-email"
                type="email"
                value={createForm.email}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                placeholder="user@example.com"
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label>Сторона</Label>
              <Select
                value={createForm.side}
                onValueChange={(value: 'jedi' | 'sith') =>
                  setCreateForm((prev) => ({
                    ...prev,
                    side: value,
                  }))
                }
                disabled={isCreating}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите сторону" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jedi">Jedi</SelectItem>
                  <SelectItem value="sith">Sith</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeCreateDialog}
              disabled={isCreating}>
              Отмена
            </Button>
            <Button onClick={handleCreateUser} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
