import { Button } from './button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

function buildPageItems(
  currentPage: number,
  totalPages: number
): (number | 'ellipsis')[] {
  if (totalPages < 1) return [];
  if (totalPages === 1) return [1];
  if (totalPages <= 9) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  const add = (p: number) => {
    if (p >= 1 && p <= totalPages) pages.add(p);
  };

  add(1);
  add(totalPages);
  for (let p = currentPage - 1; p <= currentPage + 1; p++) {
    add(p);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | 'ellipsis')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i]!;
    if (i > 0 && p - sorted[i - 1]! > 1) {
      out.push('ellipsis');
    }
    out.push(p);
  }
  return out;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  /** Только стрелки без текста «Назад»/«Вперёд» — удобно в модалках */
  compact?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled,
  compact,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const items = buildPageItems(currentPage, totalPages);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-1 sm:gap-2',
        className
      )}>
      <Button
        variant="outline"
        size={compact ? 'icon' : 'sm'}
        className={cn(!compact && 'shrink-0')}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || disabled}
        aria-label="Предыдущая страница">
        <ChevronLeft className="h-4 w-4" />
        {!compact && 'Назад'}
      </Button>

      <div className="flex flex-wrap items-center justify-center gap-1">
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`e-${index}`}
              className="flex h-9 w-9 items-center justify-center text-muted-foreground"
              aria-hidden>
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <Button
              key={item}
              variant={currentPage === item ? 'default' : 'outline'}
              size="sm"
              className="min-w-9 px-2"
              onClick={() => onPageChange(item)}
              disabled={disabled}
              aria-label={`Страница ${item}`}
              aria-current={currentPage === item ? 'page' : undefined}>
              {item}
            </Button>
          )
        )}
      </div>

      <Button
        variant="outline"
        size={compact ? 'icon' : 'sm'}
        className={cn(!compact && 'shrink-0')}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disabled}
        aria-label="Следующая страница">
        {!compact && 'Вперёд'}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
