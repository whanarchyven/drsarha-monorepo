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

interface FillDialogProps {
  dialog: FillDialogState;
  fillValue: string;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  onApply: (value: number) => void;
}

export function FillDialog({
  dialog,
  fillValue,
  onOpenChange,
  onValueChange,
  onApply,
}: FillDialogProps) {
  const handleApply = () => {
    const value = Number.parseFloat(fillValue);
    if (!isNaN(value)) {
      onApply(value);
    } else {
      toast.error('Введите корректное число');
    }
  };

  return (
    <Dialog open={dialog.open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Залить ответы</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fill-value">Введите значение для заливки</Label>
            <Input
              id="fill-value"
              type="number"
              value={fillValue}
              onChange={(e) => onValueChange(e.target.value)}
              placeholder="Введите число"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = Number.parseFloat(fillValue);
                  if (!isNaN(value)) {
                    onApply(value);
                  }
                }
              }}
            />
            <p className="text-sm text-muted-foreground">
              {dialog.type === 'stat' &&
                'Значение будет умножено на распределение каждого масштаба и прибавлено к текущему значению.'}
              {dialog.type === 'dashboard' &&
                'Значение будет залито во все статистики этого дашборда в соответствии с их распределениями.'}
              {dialog.type === 'all' &&
                'Значение будет умножено на процент каждого дашборда, затем залито в статистики в соответствии с их распределениями.'}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onValueChange('');
            }}>
            Отмена
          </Button>
          <Button onClick={handleApply}>Применить</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
