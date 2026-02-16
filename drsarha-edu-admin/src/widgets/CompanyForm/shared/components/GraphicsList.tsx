'use client';

import { Graphic, DashboardType } from '@/entities/company/model';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, X } from 'lucide-react';

interface GraphicsListProps {
  graphics: Graphic[];
  dashboardIndex: number;
  statIndex: number;
  onAdd: () => void;
  onUpdate: (graphicIndex: number, field: keyof Graphic, value: any) => void;
  onRemove: (graphicIndex: number) => void;
}

export function GraphicsList({
  graphics,
  dashboardIndex,
  statIndex,
  onAdd,
  onUpdate,
  onRemove,
}: GraphicsListProps) {
  return (
    <div className="space-y-2 border-t-2 border-orange-300 dark:border-orange-700 pt-4 bg-orange-50/50 dark:bg-orange-950/20 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold text-orange-900 dark:text-orange-100">
          Графики
        </Label>
        <Button
          type="button"
          onClick={onAdd}
          variant="outline"
          size="sm"
          className="border-orange-300 dark:border-orange-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          Добавить график
        </Button>
      </div>

      {graphics.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-4 text-center border border-dashed rounded-lg">
          <p className="text-muted-foreground text-sm">
            Графики еще не добавлены
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {graphics.map((graphic, graphicIndex) => (
            <div
              key={graphicIndex}
              className="flex items-start gap-2 p-3 border rounded-md relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                <div className="space-y-1">
                  <Label
                    htmlFor={`graphic-type-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                    className="text-xs">
                    Тип графика
                  </Label>
                  <Select
                    value={graphic.type}
                    onValueChange={(value) =>
                      onUpdate(graphicIndex, 'type', value as DashboardType)
                    }>
                    <SelectTrigger
                      id={`graphic-type-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                      className="h-8">
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DashboardType.LINE}>
                        Линейный
                      </SelectItem>
                      <SelectItem value={DashboardType.BAR}>
                        Столбчатый
                      </SelectItem>
                      <SelectItem value={DashboardType.PIE}>
                        Круговой
                      </SelectItem>
                      <SelectItem value={DashboardType.AREA}>
                        Область
                      </SelectItem>
                      <SelectItem value={DashboardType.TABLE}>
                        Таблица
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`graphic-cols-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                    className="text-xs">
                    Занимаемые ячейки
                  </Label>
                  <Input
                    id={`graphic-cols-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                    type="number"
                    value={graphic.cols || 1}
                    onChange={(e) =>
                      onUpdate(
                        graphicIndex,
                        'cols',
                        Number.parseInt(e.target.value) || 1
                      )
                    }
                    placeholder="Количество ячеек"
                    className="h-8"
                    min="1"
                    max="12"
                    step="1"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(graphicIndex)}
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
