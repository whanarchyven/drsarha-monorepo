'use client';

import { useMemo, useState } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { DeleteDialog } from '@/shared/ui/DeleteDialog/DeleteDialog';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type ConferencePromocodeItem = FunctionReturnType<
  typeof api.functions.conference_promocodes.listConferencePromocodes
>[number];

type FormState = {
  code: string;
  amount: string;
  isActive: boolean;
  maxUsageCount: string;
};

const EMPTY_FORM: FormState = {
  code: '',
  amount: '',
  isActive: true,
  maxUsageCount: '',
};

function formatLimit(value: number | null | undefined) {
  if (typeof value !== 'number') {
    return 'Без лимита';
  }

  return String(value);
}

function formatDate(value: number) {
  return new Date(value).toLocaleString('ru-RU');
}

function formatAmount(value: number | null | undefined) {
  return (typeof value === 'number' ? value : 0).toFixed(2);
}

export function ConferencePromocodesManager() {
  const promocodes = useQuery(
    api.functions.conference_promocodes.listConferencePromocodes,
    {}
  );
  const createPromocode = useMutation(
    api.functions.conference_promocodes.createConferencePromocode
  );
  const updatePromocode = useMutation(
    api.functions.conference_promocodes.updateConferencePromocode
  );
  const deletePromocode = useMutation(
    api.functions.conference_promocodes.deleteConferencePromocode
  );

  const [formState, setFormState] = useState<FormState>(EMPTY_FORM);
  const [editingPromocode, setEditingPromocode] =
    useState<ConferencePromocodeItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [promocodeToDelete, setPromocodeToDelete] =
    useState<ConferencePromocodeItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const sortedPromocodes = useMemo(
    () =>
      [...(promocodes ?? [])].sort((a, b) =>
        a.code.localeCompare(b.code, 'ru')
      ),
    [promocodes]
  );

  const stats = useMemo(() => {
    const items = sortedPromocodes;
    return {
      total: items.length,
      active: items.filter((item) => item.isActive).length,
      usageCount: items.reduce((sum, item) => sum + (item.usage_count ?? 0), 0),
      payedCount: items.reduce((sum, item) => sum + (item.payed_count ?? 0), 0),
    };
  }, [sortedPromocodes]);

  const openCreateDialog = () => {
    setEditingPromocode(null);
    setFormState(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const openEditDialog = (promocode: ConferencePromocodeItem) => {
    setEditingPromocode(promocode);
    setFormState({
      code: promocode.code,
      amount:
        typeof promocode.amount === 'number' ? String(promocode.amount) : '',
      isActive: promocode.isActive,
      maxUsageCount:
        typeof promocode.max_usage_count === 'number'
          ? String(promocode.max_usage_count)
          : '',
    });
    setIsDialogOpen(true);
  };

  const closeDialog = (force = false) => {
    if (isSubmitting && !force) {
      return;
    }

    setIsDialogOpen(false);
    setEditingPromocode(null);
    setFormState(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    const code = formState.code.trim();
    if (!code) {
      toast.error('Введите промокод');
      return;
    }

    const amountRaw = formState.amount.trim();
    const amount = Number.parseFloat(amountRaw);
    if (
      amountRaw === '' ||
      !Number.isFinite(amount) ||
      Number.isNaN(amount) ||
      amount < 0
    ) {
      toast.error('Сумма скидки должна быть неотрицательным числом');
      return;
    }

    const maxUsageCountRaw = formState.maxUsageCount.trim();
    const maxUsageCount =
      maxUsageCountRaw === '' ? null : Number.parseInt(maxUsageCountRaw, 10);

    if (
      maxUsageCountRaw !== '' &&
      (!Number.isFinite(maxUsageCount) ||
        Number.isNaN(maxUsageCount) ||
        maxUsageCount < 0)
    ) {
      toast.error('Лимит использований должен быть неотрицательным числом');
      return;
    }

    try {
      setIsSubmitting(true);

      const promise = editingPromocode
        ? updatePromocode({
            id: editingPromocode._id,
            patch: {
              code,
              amount,
              isActive: formState.isActive,
              max_usage_count: maxUsageCount,
            },
          })
        : createPromocode({
            code,
            amount,
            isActive: formState.isActive,
            max_usage_count: maxUsageCount,
          });

      toast.promise(promise, {
        loading: editingPromocode
          ? 'Сохраняем промокод...'
          : 'Создаём промокод...',
        success: editingPromocode ? 'Промокод обновлён' : 'Промокод создан',
        error: 'Не удалось сохранить промокод',
      });

      await promise;
      closeDialog(true);
    } catch (error) {
      console.error('Error saving conference promocode:', error);
      toast.error('Не удалось сохранить промокод');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!promocodeToDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await deletePromocode({
        id: promocodeToDelete._id as Id<'conference_promocodes'>,
      });
      toast.success('Промокод удалён');
      setPromocodeToDelete(null);
    } catch (error) {
      console.error('Error deleting conference promocode:', error);
      toast.error('Не удалось удалить промокод');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Всего промокодов</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Активных</CardDescription>
            <CardTitle className="text-3xl">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Использований</CardDescription>
            <CardTitle className="text-3xl">{stats.usageCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Оплаченных использований</CardDescription>
            <CardTitle className="text-3xl">{stats.payedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>Список промокодов</CardTitle>
            <CardDescription>
              Создавайте и редактируйте конференционные промокоды, следите за
              `usage_count` и `payed_count`.
            </CardDescription>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Создать промокод
          </Button>
        </CardHeader>
        <CardContent>
          {promocodes === undefined ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="p-5 space-y-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-20 w-full" />
                </Card>
              ))}
            </div>
          ) : sortedPromocodes.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              Промокоды ещё не созданы.
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sortedPromocodes.map((promocode) => {
                const isLimited = typeof promocode.max_usage_count === 'number';
                const isExhausted =
                  isLimited &&
                  promocode.usage_count >= promocode.max_usage_count;

                return (
                  <Card key={promocode._id} className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">
                          {promocode.code}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={
                              promocode.isActive ? 'success' : 'secondary'
                            }>
                            {promocode.isActive ? 'Активен' : 'Выключен'}
                          </Badge>
                          <Badge
                            variant={isExhausted ? 'destructive' : 'outline'}>
                            {isExhausted ? 'Лимит исчерпан' : 'Доступен'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => openEditDialog(promocode)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setPromocodeToDelete(promocode)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg border p-3">
                        <p className="text-muted-foreground">Скидка</p>
                        <p className="mt-1 text-2xl font-semibold">
                          {formatAmount(promocode.amount)}
                        </p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-muted-foreground">Использований</p>
                        <p className="mt-1 text-2xl font-semibold">
                          {promocode.usage_count}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="rounded-lg border p-3">
                        <p className="text-muted-foreground">Оплачено</p>
                        <p className="mt-1 text-2xl font-semibold">
                          {promocode.payed_count}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        Лимит использований:{' '}
                        {formatLimit(promocode.max_usage_count)}
                      </p>
                      <p>Обновлён: {formatDate(promocode.updatedAt)}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => (open ? setIsDialogOpen(true) : closeDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPromocode ? 'Редактировать промокод' : 'Создать промокод'}
            </DialogTitle>
            <DialogDescription>
              Код автоматически нормализуется на бэкенде. Пустой лимит означает
              неограниченное количество использований.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="conference-promocode-code">Промокод</Label>
              <Input
                id="conference-promocode-code"
                value={formState.code}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    code: event.target.value,
                  }))
                }
                placeholder="Например, CONF2026"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conference-promocode-amount">Сумма скидки</Label>
              <Input
                id="conference-promocode-amount"
                type="number"
                min="0"
                step="0.01"
                value={formState.amount}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    amount: event.target.value,
                  }))
                }
                placeholder="Например, 999.00"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conference-promocode-max-usage">
                Лимит использований
              </Label>
              <Input
                id="conference-promocode-max-usage"
                type="number"
                min="0"
                value={formState.maxUsageCount}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    maxUsageCount: event.target.value,
                  }))
                }
                placeholder="Оставьте пустым для безлимита"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <p className="font-medium">Промокод активен</p>
                <p className="text-sm text-muted-foreground">
                  Неактивный промокод не пройдёт проверку в `validate`.
                </p>
              </div>
              <Switch
                checked={formState.isActive}
                onCheckedChange={(checked) =>
                  setFormState((prev) => ({ ...prev, isActive: checked }))
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isSubmitting}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingPromocode ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        isOpen={promocodeToDelete !== null}
        onClose={() => setPromocodeToDelete(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}>
        Вы уверены, что хотите удалить промокод `{promocodeToDelete?.code}`?
      </DeleteDialog>
    </div>
  );
}
