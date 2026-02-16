'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DefaultDistributionDialogState } from '../types';

interface DefaultDistributionDialogProps {
  dialog: DefaultDistributionDialogState;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DefaultDistributionDialog({
  dialog,
  onOpenChange,
  onConfirm,
}: DefaultDistributionDialogProps) {
  return (
    <AlertDialog
      open={dialog.open}
      onOpenChange={(open) => {
        onOpenChange(open);
      }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
          <AlertDialogDescription>
            Распределение для существующих масштабов будет обновлено в
            соответствии с реальными процентами ответов. Это действие нельзя
            отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Применить</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
