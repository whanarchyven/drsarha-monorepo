'use client';

import { Company } from '@/entities/company/model';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { DashboardAccordion } from './DashboardAccordion';
import { Dashboard, Stat } from '@/entities/company/model';
import { QuestionStats, LoadingStats, ExpandedRealResults } from '../types';

interface DashboardsCardProps {
  company: Company;
  expandedDashboards: string[];
  onExpandedChange: (expanded: string[]) => void;
  expandedRealResults: ExpandedRealResults;
  onRealResultsExpandedChange: (key: string, expanded: boolean) => void;
  questionTitleCache: Record<string, string>;
  questionStats: QuestionStats;
  loadingStats: LoadingStats;
  role?: string;
  onDashboardAdd: () => void;
  onDashboardUpdate: (
    index: number,
    field: keyof Dashboard,
    value: any
  ) => void;
  onDashboardRemove: (index: number) => void;
  onDashboardMoveUp: (index: number) => void;
  onDashboardMoveDown: (index: number) => void;
  onStatAdd: (dashboardIndex: number) => void;
  onStatUpdate: (
    dashboardIndex: number,
    statIndex: number,
    field: keyof Stat,
    value: any
  ) => void;
  onStatRemove: (dashboardIndex: number, statIndex: number) => void;
  onStatMoveUp: (dashboardIndex: number, statIndex: number) => void;
  onStatMoveDown: (dashboardIndex: number, statIndex: number) => void;
  onQuestionSelect: (
    dashboardIndex: number,
    statIndex: number,
    questionId: string
  ) => void;
  onGraphicAdd: (dashboardIndex: number, statIndex: number) => void;
  onGraphicUpdate: (
    dashboardIndex: number,
    statIndex: number,
    graphicIndex: number,
    field: 'type' | 'cols',
    value: any
  ) => void;
  onGraphicRemove: (
    dashboardIndex: number,
    statIndex: number,
    graphicIndex: number
  ) => void;
  onScaleAdd: (dashboardIndex: number, statIndex: number) => void;
  onScaleUpdate: (
    dashboardIndex: number,
    statIndex: number,
    scaleIndex: number,
    field: string,
    value: any
  ) => void;
  onScaleRemove: (
    dashboardIndex: number,
    statIndex: number,
    scaleIndex: number
  ) => void;
  onScaleAddFromVariant: (
    dashboardIndex: number,
    statIndex: number,
    variantValue: string
  ) => void;
  onDefaultDistribution: (dashboardIndex: number, statIndex: number) => void;
  onFillValues: (
    type: 'stat' | 'dashboard' | 'all',
    dashboardIndex: number,
    statIndex?: number
  ) => void;
  getQuestionText: (questionId: string) => string;
  onQuestionTitleUpdate?: (questionId: string, title: string) => void;
}

export function DashboardsCard({
  company,
  expandedDashboards,
  onExpandedChange,
  expandedRealResults,
  onRealResultsExpandedChange,
  questionTitleCache,
  questionStats,
  loadingStats,
  role,
  onDashboardAdd,
  onDashboardUpdate,
  onDashboardRemove,
  onDashboardMoveUp,
  onDashboardMoveDown,
  onStatAdd,
  onStatUpdate,
  onStatRemove,
  onStatMoveUp,
  onStatMoveDown,
  onQuestionSelect,
  onGraphicAdd,
  onGraphicUpdate,
  onGraphicRemove,
  onScaleAdd,
  onScaleUpdate,
  onScaleRemove,
  onScaleAddFromVariant,
  onDefaultDistribution,
  onFillValues,
  getQuestionText,
  onQuestionTitleUpdate,
}: DashboardsCardProps) {
  return (
    <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
      <CardHeader className="flex flex-row items-center justify-between bg-card z-10 border-b border-purple-200 dark:border-purple-800">
        <div>
          <CardTitle className="text-purple-900 dark:text-purple-100">
            Дашборды
          </CardTitle>
          <CardDescription>
            {company._id
              ? 'Управляйте дашбордами для этой компании'
              : 'Создайте и управляйте дашбордами для этой компании'}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {role === 'admin' && (
            <Button
              type="button"
              onClick={() => onFillValues('all', -1)}
              variant="outline"
              size="sm">
              Залить ответы
            </Button>
          )}
          <Button
            type="button"
            onClick={onDashboardAdd}
            variant="default"
            size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить дашборд
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {company.dashboards.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Дашборды еще не добавлены</p>
            <Button
              type="button"
              onClick={onDashboardAdd}
              variant="outline"
              size="sm"
              className="mt-4">
              Добавить первый дашборд
            </Button>
          </div>
        ) : (
          <DashboardAccordion
            company={company}
            expandedDashboards={expandedDashboards}
            onExpandedChange={onExpandedChange}
            expandedRealResults={expandedRealResults}
            onRealResultsExpandedChange={onRealResultsExpandedChange}
            questionTitleCache={questionTitleCache}
            questionStats={questionStats}
            loadingStats={loadingStats}
            role={role}
            onDashboardUpdate={onDashboardUpdate}
            onDashboardRemove={onDashboardRemove}
            onDashboardMoveUp={onDashboardMoveUp}
            onDashboardMoveDown={onDashboardMoveDown}
            onStatAdd={onStatAdd}
            onStatUpdate={onStatUpdate}
            onStatRemove={onStatRemove}
            onStatMoveUp={onStatMoveUp}
            onStatMoveDown={onStatMoveDown}
            onQuestionSelect={onQuestionSelect}
            onGraphicAdd={onGraphicAdd}
            onGraphicUpdate={onGraphicUpdate}
            onGraphicRemove={onGraphicRemove}
            onScaleAdd={onScaleAdd}
            onScaleUpdate={onScaleUpdate}
            onScaleRemove={onScaleRemove}
            onScaleAddFromVariant={onScaleAddFromVariant}
            onDefaultDistribution={onDefaultDistribution}
            onFillValues={onFillValues}
            getQuestionText={getQuestionText}
            onQuestionTitleUpdate={onQuestionTitleUpdate}
          />
        )}
      </CardContent>
    </Card>
  );
}
