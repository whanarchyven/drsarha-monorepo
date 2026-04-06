'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getConvexHttpClient } from '@/shared/lib/convex';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

export interface Stat {
  value: string;
  count: number;
}

function normKey(s: string) {
  return s.trim().toLowerCase();
}

export default function MergeTable({
  initialStats,
  questionId,
  predefinedVariants,
  onRewritesSaved,
}: {
  initialStats: Stat[];
  questionId: string;
  predefinedVariants: string[];
  onRewritesSaved?: () => void | Promise<void>;
}) {
  const convexClient = getConvexHttpClient();
  const [stats, setStats] = useState<Stat[]>(initialStats);

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  const predefinedNormSet = new Set(
    predefinedVariants.map((v) => normKey(v)).filter(Boolean)
  );

  const isPredefinedValue = (value: string) =>
    predefinedNormSet.has(normKey(value));

  const [rewriteForValue, setRewriteForValue] = useState<string | null>(null);
  const [selectedTargetVariant, setSelectedTargetVariant] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rewritesList, setRewritesList] = useState<
    Array<{
      _id: Id<'analytic_rewrites'>;
      rewrite_value: string;
      rewrite_target: string;
    }>
  >([]);
  const [rewritesLoading, setRewritesLoading] = useState(false);
  const [deletingRewriteId, setDeletingRewriteId] =
    useState<Id<'analytic_rewrites'> | null>(null);

  const fetchRewrites = useCallback(async () => {
    const list = await convexClient.query(
      api.functions.analytic_rewrites.listByQuestion,
      { question_id: questionId as Id<'analytic_questions'> }
    );
    setRewritesList(list);
  }, [convexClient, questionId]);

  useEffect(() => {
    if (!questionId) return;
    setRewritesLoading(true);
    void fetchRewrites()
      .catch((err) => {
        console.error(err);
        toast.error('Не удалось загрузить реврайты');
      })
      .finally(() => setRewritesLoading(false));
  }, [questionId, fetchRewrites]);

  const openRewriteDialog = (value: string) => {
    setRewriteForValue(value);
    const firstTarget =
      predefinedVariants.find((v) => normKey(v) !== normKey(value)) ??
      predefinedVariants[0] ??
      '';
    setSelectedTargetVariant(firstTarget);
  };

  const closeDialog = () => {
    setRewriteForValue(null);
    setSelectedTargetVariant('');
  };

  const saveRewrite = async () => {
    if (!rewriteForValue || !selectedTargetVariant.trim()) {
      toast.error('Выберите предустановленный вариант');
      return;
    }

    if (normKey(rewriteForValue) === normKey(selectedTargetVariant)) {
      toast.error('Нельзя реврайтить в тот же вариант');
      return;
    }

    setIsLoading(true);

    try {
      const existingRewrites = await convexClient.query(
        api.functions.analytic_rewrites.listByQuestion,
        {
          question_id: questionId as any,
        }
      );

      const existingRewrite = existingRewrites.find(
        (r) => normKey(r.rewrite_value) === normKey(rewriteForValue)
      );

      if (existingRewrite) {
        await convexClient.mutation(api.functions.analytic_rewrites.update, {
          id: existingRewrite._id,
          data: {
            rewrite_value: rewriteForValue,
            rewrite_target: selectedTargetVariant.trim(),
          },
        });
      } else {
        await convexClient.mutation(api.functions.analytic_rewrites.insert, {
          question_id: questionId as any,
          rewrite_value: rewriteForValue,
          rewrite_target: selectedTargetVariant.trim(),
        });
      }

      await fetchRewrites();
      await onRewritesSaved?.();
      toast.success('Реврайт сохранён');
      closeDialog();
    } catch (error) {
      console.error(error);
      toast.error('Не удалось сохранить реврайт');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRewrite = async (rewriteId: Id<'analytic_rewrites'>) => {
    setDeletingRewriteId(rewriteId);
    try {
      await convexClient.mutation(api.functions.analytic_rewrites.remove, {
        id: rewriteId,
      });
      await fetchRewrites();
      await onRewritesSaved?.();
      toast.success('Реврайт удалён');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось удалить реврайт');
    } finally {
      setDeletingRewriteId(null);
    }
  };

  const canRewrite = predefinedVariants.length > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Вариант ответа</TableHead>
              <TableHead>Количество ответов</TableHead>
              <TableHead className="w-[120px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((stat) => (
              <TableRow key={`${normKey(stat.value)}-${stat.value}`}>
                <TableCell>{stat.value}</TableCell>
                <TableCell>{stat.count}</TableCell>
                <TableCell>
                  {canRewrite && !isPredefinedValue(stat.value) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRewriteDialog(stat.value)}>
                      Реврайт
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Реврайты</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Исходное значение</TableHead>
                <TableHead>Реврайт в</TableHead>
                <TableHead className="w-[140px] text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewritesLoading ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Загрузка реврайтов…
                    </div>
                  </TableCell>
                </TableRow>
              ) : rewritesList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-sm text-muted-foreground">
                    Нет реврайтов для этого вопроса.
                  </TableCell>
                </TableRow>
              ) : (
                rewritesList.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-medium">{r.rewrite_value}</TableCell>
                    <TableCell>{r.rewrite_target}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={deletingRewriteId === r._id}
                        onClick={() => void handleDeleteRewrite(r._id)}>
                        {deletingRewriteId === r._id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Удалить'
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={rewriteForValue !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Реврайт ответа</DialogTitle>
            <DialogDescription>
              Выберите предустановленный вариант, в который будут сопоставляться
              ответы со значением ниже.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Исходное значение в статистике</Label>
              <p className="text-sm rounded-md border bg-muted/40 px-3 py-2">
                {rewriteForValue ?? ''}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rewrite-target">Предустановленный вариант</Label>
              <Select
                value={selectedTargetVariant}
                onValueChange={setSelectedTargetVariant}>
                <SelectTrigger id="rewrite-target">
                  <SelectValue placeholder="Выберите вариант" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedVariants.map((v) => (
                    <SelectItem
                      key={v}
                      value={v}
                      disabled={
                        rewriteForValue !== null &&
                        normKey(v) === normKey(rewriteForValue)
                      }>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={closeDialog}
              variant="outline"
              disabled={isLoading}>
              Отмена
            </Button>
            <Button
              onClick={() => void saveRewrite()}
              disabled={
                isLoading ||
                !selectedTargetVariant.trim() ||
                (rewriteForValue !== null &&
                  normKey(selectedTargetVariant) === normKey(rewriteForValue))
              }>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Сохранение…
                </>
              ) : (
                'Сохранить'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
