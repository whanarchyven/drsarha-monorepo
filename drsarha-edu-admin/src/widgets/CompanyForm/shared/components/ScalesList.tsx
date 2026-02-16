'use client';

import { Scale } from '@/entities/company/model';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, X, Plus } from 'lucide-react';

interface ScalesListProps {
  scales: Scale[];
  dashboardIndex: number;
  statIndex: number;
  questionStats?: { value: string; count: number }[];
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
        <Label className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
          Масштабы
        </Label>
        <div className="flex gap-2">
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
            Добавить масштаб
          </Button>
        </div>
      </div>

      {scales.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-4 text-center border border-dashed rounded-lg">
          <p className="text-muted-foreground text-sm">
            Масштабы еще не добавлены
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scales.map((scale, scaleIndex) => (
            <div key={scaleIndex} className="p-3 border rounded-md space-y-3">
              <div className="flex items-start gap-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                  <div className="space-y-1">
                    <Label
                      htmlFor={`scale-name-${dashboardIndex}-${statIndex}-${scaleIndex}`}
                      className="text-xs">
                      Название
                    </Label>
                    <Input
                      id={`scale-name-${dashboardIndex}-${statIndex}-${scaleIndex}`}
                      value={scale.name}
                      onChange={(e) =>
                        onUpdate(scaleIndex, 'name', e.target.value)
                      }
                      placeholder="Название масштаба"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor={`scale-value-${dashboardIndex}-${statIndex}-${scaleIndex}`}
                      className="text-xs">
                      Значение
                    </Label>
                    <Input
                      id={`scale-value-${dashboardIndex}-${statIndex}-${scaleIndex}`}
                      type="number"
                      value={Math.round(scale.value)}
                      onChange={(e) =>
                        onUpdate(
                          scaleIndex,
                          'value',
                          Math.round(Number.parseFloat(e.target.value) || 0)
                        )
                      }
                      placeholder="Значение"
                      className="h-8"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Тип</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={
                          scale.type === 'linear' ? 'default' : 'outline'
                        }
                        size="sm"
                        className="flex-1 h-8"
                        onClick={() => onUpdate(scaleIndex, 'type', 'linear')}>
                        <Plus className="h-4 w-4 mr-1" />
                        Линейный
                      </Button>
                      <Button
                        type="button"
                        variant={
                          scale.type === 'multiple' ? 'default' : 'outline'
                        }
                        size="sm"
                        className="flex-1 h-8"
                        onClick={() =>
                          onUpdate(scaleIndex, 'type', 'multiple')
                        }>
                        <X className="h-4 w-4 mr-1" />
                        Множественный
                      </Button>
                    </div>
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

              {/* Поле распределения масштаба */}
              <div className="border-t pt-3">
                <div className="space-y-2">
                  <Label
                    htmlFor={`scale-distribution-${dashboardIndex}-${statIndex}-${scaleIndex}`}
                    className="text-xs">
                    Распределение масштаба (%)
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
                    placeholder="Распределение масштаба (%)"
                    className="h-8"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
