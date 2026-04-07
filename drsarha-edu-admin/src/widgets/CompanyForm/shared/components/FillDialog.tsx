'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FillDialogState } from '../types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface FillDialogProps {
  dialog: FillDialogState;
  fillValue: string;
  fillDateStart: string;
  fillDateEnd: string;
  isApplying: boolean;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  onDateStartChange: (value: string) => void;
  onDateEndChange: (value: string) => void;
  onApply: (value: number) => void | Promise<void>;
}

export function FillDialog({
  dialog,
  fillValue,
  fillDateStart,
  fillDateEnd,
  isApplying,
  onOpenChange,
  onValueChange,
  onDateStartChange,
  onDateEndChange,
  onApply,
}: FillDialogProps) {
  const handleApply = async () => {
    const value = Number.parseFloat(fillValue);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Введите корректное положительное число');
      return;
    }
    await onApply(value);
  };

  return (
    <Dialog open={dialog.open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Залить ответы</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fill-value">Объём заливки (количество ответов)</Label>
            <Input
              id="fill-value"
              type="number"
              min={1}
              step={1}
              value={fillValue}
              onChange={(e) => onValueChange(e.target.value)}
              placeholder="Например, 100"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isApplying) {
                  void handleApply();
                }
              }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fill-start">Начало периода (timestamp инсайтов)</Label>
              <Input
                id="fill-start"
                type="datetime-local"
                value={fillDateStart}
                onChange={(e) => onDateStartChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fill-end">Конец периода</Label>
              <Input
                id="fill-end"
                type="datetime-local"
                value={fillDateEnd}
                onChange={(e) => onDateEndChange(e.target.value)}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Создаются записи в аналитике (инсайты) с ответами по распределению
            масштабов; время каждого ответа выбирается случайно в указанном
            интервале.
            {dialog.type === 'stat' &&
              ' Заливка только для выбранной статистики.'}
            {dialog.type === 'dashboard' &&
              ' Заливка для всех статистик этого дашборда (одинаковый объём на каждую).'}
            {dialog.type === 'all' &&
              ' Объём умножается на процент дашборда (dashboardPercent), затем распределяется по статистикам.'}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={isApplying}
            onClick={() => {
              onOpenChange(false);
              onValueChange('');
            }}>
            Отмена
          </Button>
          <Button onClick={() => void handleApply()} disabled={isApplying}>
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Создание…
              </>
            ) : (
              'Создать инсайты'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
