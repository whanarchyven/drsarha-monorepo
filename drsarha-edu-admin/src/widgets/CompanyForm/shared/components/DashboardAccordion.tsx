'use client';

import { Dashboard, Company, Graphic, Stat } from '@/entities/company/model';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, X, ChevronUp, ChevronDown } from 'lucide-react';
import { DashboardForm } from './DashboardForm';
import { StatCard } from './StatCard';
import { QuestionStats, LoadingStats, ExpandedRealResults } from '../types';
import { canUseAdvancedDashboardTools } from '../utils/dashboard-access';

interface DashboardAccordionProps {
  company: Company;
  expandedDashboards: string[];
  onExpandedChange: (expanded: string[]) => void;
  expandedRealResults: ExpandedRealResults;
  onRealResultsExpandedChange: (key: string, expanded: boolean) => void;
  questionTitleCache: Record<string, string>;
  questionStats: QuestionStats;
  loadingStats: LoadingStats;
  role?: string;
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
    field: keyof Graphic,
    value: unknown
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
    type: 'stat' | 'dashboard',
    dashboardIndex: number,
    statIndex?: number
  ) => void;
  insightFillEnabled?: boolean;
  getQuestionText: (questionId: string) => string;
  onQuestionTitleUpdate?: (questionId: string, title: string) => void;
}

export function DashboardAccordion({
  company,
  expandedDashboards,
  onExpandedChange,
  expandedRealResults,
  onRealResultsExpandedChange,
  questionTitleCache,
  questionStats,
  loadingStats,
  role,
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
  insightFillEnabled = true,
  getQuestionText,
  onQuestionTitleUpdate,
}: DashboardAccordionProps) {
  const advanced = canUseAdvancedDashboardTools(role);

  if (company.dashboards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg">
        <p className="text-muted-foreground">Дашборды еще не добавлены</p>
      </div>
    );
  }

  return (
    <Accordion
      type="multiple"
      value={expandedDashboards}
      onValueChange={onExpandedChange}
      className="w-full">
      {company.dashboards.map((dashboard, dashboardIndex) => (
        <AccordionItem
          key={dashboardIndex}
          value={`dashboard-${dashboardIndex}`}
          className="border-2 border-purple-300 dark:border-purple-700 rounded-lg mb-4 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
          <div className="flex items-center justify-between px-4">
            <AccordionTrigger className="py-2">
              {dashboard.name || `Дашборд ${dashboardIndex + 1}`}
              {dashboard.stats.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {dashboard.stats.length} стат
                  {dashboard.stats.length !== 1 ? '' : 'истика'}
                </Badge>
              )}
            </AccordionTrigger>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDashboardMoveUp(dashboardIndex);
                }}
                disabled={dashboardIndex === 0}
                className="h-8 w-8 p-0">
                <ChevronUp className="h-4 w-4" />
                <span className="sr-only">Вверх</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDashboardMoveDown(dashboardIndex);
                }}
                disabled={dashboardIndex === company.dashboards.length - 1}
                className="h-8 w-8 p-0">
                <ChevronDown className="h-4 w-4" />
                <span className="sr-only">Вниз</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDashboardRemove(dashboardIndex);
                }}
                className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
                <span className="sr-only">Удалить</span>
              </Button>
            </div>
          </div>
          <AccordionContent>
            <DashboardForm
              dashboard={dashboard}
              dashboardIndex={dashboardIndex}
              role={role}
              onUpdate={(field, value) =>
                onDashboardUpdate(dashboardIndex, field, value)
              }
            />
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-2">
                <Label>Статистика</Label>
                <div className="flex gap-2">
                  {advanced && insightFillEnabled && (
                    <Button
                      type="button"
                      onClick={() => onFillValues('dashboard', dashboardIndex)}
                      variant="outline"
                      size="sm">
                      Залить ответы
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => onStatAdd(dashboardIndex)}
                    variant="default"
                    size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить статистику
                  </Button>
                </div>
              </div>

              {dashboard.stats.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-4 text-center border border-dashed rounded-lg">
                  <p className="text-muted-foreground text-sm">
                    Статистика еще не добавлена
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboard.stats.map((stat, statIndex) => {
                    const realResultsKey = `dashboard-${dashboardIndex}-stat-${statIndex}`;
                    return (
                      <StatCard
                        key={statIndex}
                        stat={stat}
                        dashboardIndex={dashboardIndex}
                        statIndex={statIndex}
                        role={role}
                        questionTitleCache={questionTitleCache}
                        questionStats={questionStats[stat.question_id]}
                        loadingStats={loadingStats[stat.question_id]}
                        isRealResultsExpanded={
                          expandedRealResults[realResultsKey] || false
                        }
                        onRealResultsExpandedChange={(expanded) =>
                          onRealResultsExpandedChange(realResultsKey, expanded)
                        }
                        canMoveUp={statIndex > 0}
                        canMoveDown={statIndex < dashboard.stats.length - 1}
                        onUpdate={(field, value) =>
                          onStatUpdate(dashboardIndex, statIndex, field, value)
                        }
                        onRemove={() => onStatRemove(dashboardIndex, statIndex)}
                        onMoveUp={() => onStatMoveUp(dashboardIndex, statIndex)}
                        onMoveDown={() =>
                          onStatMoveDown(dashboardIndex, statIndex)
                        }
                        onQuestionSelect={(questionId) =>
                          onQuestionSelect(
                            dashboardIndex,
                            statIndex,
                            questionId
                          )
                        }
                        onAddGraphic={() =>
                          onGraphicAdd(dashboardIndex, statIndex)
                        }
                        onUpdateGraphic={(graphicIndex, field, value) =>
                          onGraphicUpdate(
                            dashboardIndex,
                            statIndex,
                            graphicIndex,
                            field,
                            value
                          )
                        }
                        onRemoveGraphic={(graphicIndex) =>
                          onGraphicRemove(
                            dashboardIndex,
                            statIndex,
                            graphicIndex
                          )
                        }
                        onAddScale={() => onScaleAdd(dashboardIndex, statIndex)}
                        onUpdateScale={(scaleIndex, field, value) =>
                          onScaleUpdate(
                            dashboardIndex,
                            statIndex,
                            scaleIndex,
                            field,
                            value
                          )
                        }
                        onRemoveScale={(scaleIndex) =>
                          onScaleRemove(dashboardIndex, statIndex, scaleIndex)
                        }
                        onAddScaleFromVariant={(variantValue) =>
                          onScaleAddFromVariant(
                            dashboardIndex,
                            statIndex,
                            variantValue
                          )
                        }
                        onDefaultDistribution={
                          questionStats[stat.question_id]?.length > 0
                            ? () =>
                                onDefaultDistribution(dashboardIndex, statIndex)
                            : undefined
                        }
                        onFillValues={
                          insightFillEnabled
                            ? () =>
                                onFillValues(
                                  'stat',
                                  dashboardIndex,
                                  statIndex
                                )
                            : undefined
                        }
                        getQuestionText={getQuestionText}
                        onQuestionTitleUpdate={onQuestionTitleUpdate}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
