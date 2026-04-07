'use client';

import { Scale } from '@/entities/company/model';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, X } from 'lucide-react';

interface ScalesListProps {
  scales: Scale[];
  dashboardIndex: number;
  statIndex: number;
  questionStats?: { value: string | number; count: number }[];
  onAdd: () => void;
  onUpdate: (scaleIndex: number, field: keyof Scale, value: any) => void;
  onRemove: (scaleIndex: number) => void;
  onDefaultDistribution?: () => void;
}

export function ScalesList({
  scales,
  dashboardIndex,
  statIndex,
  questionStats,
  onAdd,
  onUpdate,
  onRemove,
  onDefaultDistribution,
}: ScalesListProps) {
  return (
    <div className="space-y-2 border-t-2 border-indigo-300 dark:border-indigo-700 pt-4 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-lg">
      <div className="flex items-center justify-between sticky top-0 bg-card z-10 py-2">
        <div>
          <Label className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
            Варианты заливки
          </Label>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Используются только при «Залить ответы»: имя — значение ответа в
            инсайте, доля — как распределить объём заливки между вариантами.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {questionStats &&
            questionStats.length > 0 &&
            onDefaultDistribution && (
              <Button
                type="button"
                onClick={onDefaultDistribution}
                variant="outline"
                size="sm"
                className="border-indigo-300 dark:border-indigo-700">
                Распределение по умолчанию
              </Button>
            )}
          <Button
            type="button"
            onClick={onAdd}
            variant="default"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить
          </Button>
        </div>
      </div>

      {scales.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-4 text-center border border-dashed rounded-lg">
          <p className="text-muted-foreground text-sm">
            Добавьте варианты для заливки ответов
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scales.map((scale, scaleIndex) => (
            <div
              key={scaleIndex}
              className="flex items-start gap-2 p-3 border rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                <div className="space-y-1">
                  <Label
                    htmlFor={`scale-name-${dashboardIndex}-${statIndex}-${scaleIndex}`}
                    className="text-xs">
                    Название (текст ответа)
                  </Label>
                  <Input
                    id={`scale-name-${dashboardIndex}-${statIndex}-${scaleIndex}`}
                    value={scale.name}
                    onChange={(e) =>
                      onUpdate(scaleIndex, 'name', e.target.value)
                    }
                    placeholder="Как в инсайте"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`scale-distribution-${dashboardIndex}-${statIndex}-${scaleIndex}`}
                    className="text-xs">
                    Доля заливки (%)
                  </Label>
                  <Input
                    id={`scale-distribution-${dashboardIndex}-${statIndex}-${scaleIndex}`}
                    type="number"
                    value={
                      scale.scaleDistribution !== undefined
                        ? (scale.scaleDistribution * 100).toFixed(2)
                        : ''
                    }
                    onChange={(e) =>
                      onUpdate(
                        scaleIndex,
                        'scaleDistribution',
                        e.target.value
                          ? Number.parseFloat(e.target.value) / 100
                          : undefined
                      )
                    }
                    placeholder="%"
                    className="h-8"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(scaleIndex)}
                className="h-8 w-8 p-0 mt-5">
                <X className="h-4 w-4" />
                <span className="sr-only">Удалить</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
