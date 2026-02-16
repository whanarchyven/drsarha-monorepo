'use client';

import { Stat } from '@/entities/company/model';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { QuestionSelector } from './QuestionSelector';
import { RealResultsTable } from './RealResultsTable';
import { GraphicsList } from './GraphicsList';
import { ScalesList } from './ScalesList';

interface StatCardProps {
  stat: Stat;
  dashboardIndex: number;
  statIndex: number;
  role?: string;
  questionTitleCache: Record<string, string>;
  questionStats?: { value: string; count: number }[];
  loadingStats?: boolean;
  isRealResultsExpanded: boolean;
  onRealResultsExpandedChange: (expanded: boolean) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onUpdate: (field: keyof Stat, value: any) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onQuestionSelect: (questionId: string) => void;
  onAddGraphic: () => void;
  onUpdateGraphic: (
    graphicIndex: number,
    field: 'type' | 'cols',
    value: any
  ) => void;
  onRemoveGraphic: (graphicIndex: number) => void;
  onAddScale: () => void;
  onUpdateScale: (scaleIndex: number, field: string, value: any) => void;
  onRemoveScale: (scaleIndex: number) => void;
  onAddScaleFromVariant: (variantValue: string) => void;
  onDefaultDistribution?: () => void;
  onFillValues?: () => void;
  getQuestionText: (questionId: string) => string;
  onQuestionTitleUpdate?: (questionId: string, title: string) => void;
}

export function StatCard({
  stat,
  dashboardIndex,
  statIndex,
  role,
  questionTitleCache,
  questionStats,
  loadingStats,
  isRealResultsExpanded,
  onRealResultsExpandedChange,
  canMoveUp,
  canMoveDown,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onQuestionSelect,
  onAddGraphic,
  onUpdateGraphic,
  onRemoveGraphic,
  onAddScale,
  onUpdateScale,
  onRemoveScale,
  onAddScaleFromVariant,
  onDefaultDistribution,
  onFillValues,
  getQuestionText,
  onQuestionTitleUpdate,
}: StatCardProps) {
  return (
    <Card className="relative border-2 border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20">
      <div className="absolute right-2 top-2 flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="h-8 w-8 p-0">
          <ChevronUp className="h-4 w-4" />
          <span className="sr-only">Вверх</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="h-8 w-8 p-0">
          <ChevronDown className="h-4 w-4" />
          <span className="sr-only">Вниз</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
          <span className="sr-only">Удалить</span>
        </Button>
      </div>
      <CardHeader className="pb-2 border-b border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-green-900 dark:text-green-100">
            {stat.name || `Статистика ${statIndex + 1}`}
          </CardTitle>
          {role === 'admin' && onFillValues && (
            <Button
              type="button"
              onClick={onFillValues}
              variant="outline"
              size="sm"
              className="border-green-300 dark:border-green-700">
              Залить ответы
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-2 pt-4">
        <div className="space-y-2">
          <Label htmlFor={`stat-name-${dashboardIndex}-${statIndex}`}>
            Название статистики
          </Label>
          <Input
            id={`stat-name-${dashboardIndex}-${statIndex}`}
            value={stat.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="Введите название статистики"
          />
        </div>

        <div className="space-y-2">
          <Label>Вопрос</Label>
          <QuestionSelector
            questionId={stat.question_id}
            questionTitleCache={questionTitleCache}
            onSelect={onQuestionSelect}
            getQuestionText={getQuestionText}
            onQuestionTitleUpdate={onQuestionTitleUpdate}
          />
        </div>

        {role === 'admin' && (
          <div className="space-y-2">
            <Label htmlFor={`scale-all-${dashboardIndex}-${statIndex}`}>
              Общий масштаб
            </Label>
            <Input
              id={`scale-all-${dashboardIndex}-${statIndex}`}
              type="number"
              value={stat.scaleAll}
              onChange={(e) =>
                onUpdate('scaleAll', Number.parseFloat(e.target.value) || 1)
              }
              min="0"
              step="0.1"
            />
          </div>
        )}

        <GraphicsList
          graphics={stat.graphics}
          dashboardIndex={dashboardIndex}
          statIndex={statIndex}
          onAdd={onAddGraphic}
          onUpdate={onUpdateGraphic}
          onRemove={onRemoveGraphic}
        />

        {stat.question_id && role == 'admin' && (
          <RealResultsTable
            stat={stat}
            dashboardIndex={dashboardIndex}
            statIndex={statIndex}
            questionStats={questionStats}
            loading={loadingStats || false}
            isExpanded={isRealResultsExpanded}
            onExpandedChange={onRealResultsExpandedChange}
            onAddScale={onAddScaleFromVariant}
          />
        )}

        {role === 'admin' && (
          <ScalesList
            scales={stat.scales}
            dashboardIndex={dashboardIndex}
            statIndex={statIndex}
            questionStats={questionStats}
            onAdd={onAddScale}
            onUpdate={onUpdateScale}
            onRemove={onRemoveScale}
            onDefaultDistribution={onDefaultDistribution}
          />
        )}
      </CardContent>
    </Card>
  );
}
