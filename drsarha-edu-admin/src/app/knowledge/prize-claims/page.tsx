'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import LoadingSpinner from '@/shared/ui/LoadingSpinner/LoadingSpinner';
import { Pagination } from '@/components/pagination';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import type { Id } from '@convex/_generated/dataModel';

type PrizeClaim = FunctionReturnType<
  typeof api.functions.prize_claims.listWithDetails
>['items'][number];

const statusLabels = {
  pending: { label: 'Ожидает рассмотрения', variant: 'secondary' as const },
  claimed: { label: 'Получено', variant: 'default' as const },
  backlog: { label: 'В очереди', variant: 'outline' as const },
  refund: { label: 'Возврат (запрошен)', variant: 'destructive' as const },
  canceled: { label: 'Отменено', variant: 'secondary' as const },
};

export default function PrizeClaimsPage() {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const response = useQuery(api.functions.prize_claims.listWithDetails, {
    page: currentPage,
    limit: itemsPerPage,
  });
  const updateStatusMutation = useMutation(
    api.functions.prize_claims.updateStatus
  );
  const approveRefundMutation = useMutation(
    api.functions.prize_claims.approveRefund
  );
  const isLoading = response === undefined;
  const claims = response?.items ?? [];
  const totalPages = response?.totalPages ?? 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const updateStatus = async (
    claimId: Id<'prize_claims'>,
    newStatus: 'pending' | 'claimed' | 'backlog' | 'refund' | 'canceled'
  ) => {
    try {
      setUpdatingStatus(claimId);
      await updateStatusMutation({ id: claimId, status: newStatus });
      toast.success('Статус заявки обновлен');
    } catch (error) {
      console.error('Error updating claim status:', error);
      toast.error('Не удалось обновить статус заявки');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="container p-6">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner className="h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6">
      <Card>
        <CardHeader>
          <CardTitle>Заявки на призы</CardTitle>
        </CardHeader>
        <CardContent>
          {claims.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Заявки на призы отсутствуют
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Контактная информация</TableHead>
                  <TableHead>Приз</TableHead>
                  <TableHead>Дата заявки</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{claim.userInfo.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {claim.userInfo.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          ⭐ {claim.userInfo.stars} звезд
                        </div>
                        <div className="text-sm">
                          📈 {claim.userInfo.exp} опыта
                        </div>
                        <div className="text-sm">
                          🎯 Уровень {claim.userInfo.level}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{claim.prizeInfo.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {claim.prizeInfo.price} звезд
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(claim.claimedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusLabels[claim.status].variant}>
                        {statusLabels[claim.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={claim.status}
                          onValueChange={(value) =>
                            updateStatus(
                              claim._id as Id<'prize_claims'>,
                              value as
                                | 'pending'
                                | 'claimed'
                                | 'backlog'
                                | 'refund'
                                | 'canceled'
                            )
                          }
                          disabled={updatingStatus === claim._id}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Ожидает</SelectItem>
                            <SelectItem value="claimed">Получено</SelectItem>
                            <SelectItem value="backlog">В очереди</SelectItem>
                            <SelectItem value="refund">Возврат</SelectItem>
                            <SelectItem value="canceled">Отменено</SelectItem>
                          </SelectContent>
                        </Select>
                        {claim.status === 'refund' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                setUpdatingStatus(claim._id);
                                const res = await approveRefundMutation({
                                  id: claim._id as Id<'prize_claims'>,
                                });
                                toast.success(
                                  `Возврат подтвержден. Вернули ${res.restoredStars} звёзд`
                                );
                              } catch (e) {
                                toast.error('Не удалось подтвердить возврат');
                              } finally {
                                setUpdatingStatus(null);
                              }
                            }}
                            disabled={updatingStatus === claim._id}>
                            Подтвердить возврат
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {claims.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
