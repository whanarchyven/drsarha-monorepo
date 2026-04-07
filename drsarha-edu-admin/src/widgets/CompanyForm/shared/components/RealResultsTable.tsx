'use client';

import { Stat } from '@/entities/company/model';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Loader2 } from 'lucide-react';

interface RealResultsTableProps {
  stat: Stat;
  dashboardIndex: number;
  statIndex: number;
  questionStats?: { value: string | number; count: number }[];
  loading: boolean;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onAddScale: (variantValue: string) => void;
}

export function RealResultsTable({
  stat,
  dashboardIndex,
  statIndex,
  questionStats,
  loading,
  isExpanded,
  onExpandedChange,
  onAddScale,
}: RealResultsTableProps) {
  if (!stat.question_id) {
    return null;
  }

  const accordionValue = `real-results-${dashboardIndex}-${statIndex}`;
  const hasData = questionStats && questionStats.length > 0;
  const total = questionStats
    ? questionStats.reduce((sum, item) => sum + item.count, 0)
    : 0;

  // Создаем Set для нестрогого сравнения (приводим к строкам для сравнения)
  const existingScaleNames = new Set(
    stat.scales.map((s) => String(s.name).trim())
  );

  // Функция для нормализации значения (удаляет постфикс "(*)" и пробелы)
  const normalizeValue = (val: string): string => {
    return String(val)
      .replace(/\s*\(\*\)\s*$/, '') // Удаляем постфикс "(*)" в конце
      .trim();
  };

  // Функция для нестрогого сравнения значений
  const isValueInScales = (value: string | number): boolean => {
    const normalizedValue = normalizeValue(String(value));

    // Проверяем точное совпадение после нормализации
    if (existingScaleNames.has(normalizedValue)) {
      return true;
    }

    // Проверяем совпадение с нормализованными значениями из масштабов
    const normalizedScaleNames =
      Array.from(existingScaleNames).map(normalizeValue);
    if (normalizedScaleNames.includes(normalizedValue)) {
      return true;
    }

    // Проверяем числовое совпадение (если оба значения можно преобразовать в числа)
    const numValue = Number.parseFloat(normalizedValue);
    if (!isNaN(numValue)) {
      return normalizedScaleNames.some((scaleName) => {
        const numScale = Number.parseFloat(scaleName);
        return !isNaN(numScale) && numValue === numScale;
      });
    }

    return false;
  };

  return (
    <div className="border-t-2 border-blue-300 dark:border-blue-700 pt-4">
      <Accordion
        type="single"
        collapsible
        value={isExpanded ? accordionValue : undefined}
        onValueChange={(value) => onExpandedChange(value === accordionValue)}>
        <AccordionItem value={accordionValue} className="border-none">
          <AccordionTrigger className="py-2 px-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg hover:no-underline">
            <span className="text-xl font-bold text-blue-900 dark:text-blue-100">
              Реальные результаты
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">
                  Загрузка статистики...
                </span>
              </div>
            ) : !hasData ? (
              <div className="flex items-center justify-center p-8">
                <span className="text-sm text-muted-foreground">
                  Нет данных для отображения
                </span>
              </div>
            ) : (
              <div className="rounded-md border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Вариант</TableHead>
                      <TableHead>Количество ответов</TableHead>
                      <TableHead>Процент</TableHead>
                      <TableHead className="w-[150px]">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questionStats!.map((item) => {
                      const percentage =
                        total > 0
                          ? ((item.count / total) * 100).toFixed(2)
                          : '0.00';
                      const isInScales = isValueInScales(item.value);
                      return (
                        <TableRow
                          key={String(item.value)}
                          className={
                            isInScales ? 'bg-green-50 dark:bg-green-950/20' : ''
                          }>
                          <TableCell>{item.value}</TableCell>
                          <TableCell>{item.count}</TableCell>
                          <TableCell>{percentage}%</TableCell>
                          <TableCell>
                            {isInScales ? (
                              <Badge
                                variant="outline"
                                className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                Уже в масштабах
                              </Badge>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onAddScale(String(item.value))}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Добавить в масштаб
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
