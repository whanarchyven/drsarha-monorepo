'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Company,
  Dashboard,
  Stat,
  Scale,
  Graphic,
} from '@/entities/company/model';
import {
  addDashboard,
  updateDashboard,
  removeDashboard,
  moveDashboardUp,
  moveDashboardDown,
  addStat,
  updateStat,
  removeStat,
  moveStatUp,
  moveStatDown,
  selectQuestion,
  addGraphic,
  updateGraphic,
  removeGraphic,
  addScale,
  updateScale,
  removeScale,
  addScaleFromVariant,
  applyDefaultDistribution,
} from '../utils';
import {
  migrateCompanyData,
  prepareCompanyForSubmit,
} from '../utils/data-migration';
import {
  FillDialogState,
  DefaultDistributionDialogState,
  QuestionStats,
  LoadingStats,
  ExpandedRealResults,
} from '../types';
import { toast } from 'sonner';
import { getConvexHttpClient } from '@/shared/lib/convex';
import { api } from '@convex/_generated/api';

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultFillDateRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 0, 0);
  return { start: toDatetimeLocalValue(start), end: toDatetimeLocalValue(end) };
}

export function useCompanyForm(initialCompany: Company | null) {
  const convexClient = getConvexHttpClient();
  const [company, setCompany] = useState<Company | null>(() =>
    initialCompany ? migrateCompanyData(initialCompany) : null
  );

  const editRevision = useMemo(() => {
    if (!initialCompany?._id) return '';
    const id = String(initialCompany._id).trim();
    if (!id) return '';
    return `${id}:${initialCompany.updated_at ?? ''}`;
  }, [initialCompany?._id, initialCompany?.updated_at]);
  const [expandedDashboards, setExpandedDashboards] = useState<string[]>([]);
  const [expandedRealResults, setExpandedRealResults] =
    useState<ExpandedRealResults>({});
  const [questionStats, setQuestionStats] = useState<QuestionStats>({});
  const [loadingStats, setLoadingStats] = useState<LoadingStats>({});
  const [questionTitleCache, setQuestionTitleCache] = useState<
    Record<string, string>
  >({});
  const loadingTitlesRef = useRef<Set<string>>(new Set());
  const questionTitleCacheRef = useRef<Record<string, string>>({});
  const [defaultDistributionDialog, setDefaultDistributionDialog] =
    useState<DefaultDistributionDialogState>({
      open: false,
      dashboardIndex: -1,
      statIndex: -1,
    });
  const [fillDialog, setFillDialog] = useState<FillDialogState>({
    open: false,
    type: 'stat',
  });
  const [fillValue, setFillValue] = useState<string>('');
  const [fillDateStart, setFillDateStart] = useState(
    () => defaultFillDateRange().start
  );
  const [fillDateEnd, setFillDateEnd] = useState(
    () => defaultFillDateRange().end
  );
  const [isApplyingInsightFill, setIsApplyingInsightFill] = useState(false);

  // RSC → клиент иногда отдаёт неполный объект (пустые поля). Редактирование: полная копия через Convex.
  useEffect(() => {
    if (!initialCompany) {
      setCompany(null);
      return;
    }

    const idStr = String(initialCompany._id ?? '').trim();

    if (!idStr) {
      setCompany(migrateCompanyData(initialCompany));
      return;
    }

    let cancelled = false;
    void convexClient
      .query(api.functions.companies.getById, { id: idStr })
      .then((doc) => {
        if (cancelled || !doc) return;
        setCompany(migrateCompanyData(doc as Company));
      })
      .catch((err) => {
        console.error('[useCompanyForm] getById (client):', err);
        setCompany(migrateCompanyData(initialCompany));
      });

    return () => {
      cancelled = true;
    };
    // initialCompany только внутри эффекта (null / create / catch); перезапуск по id+updated_at, не при новой ссылке на проп
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editRevision, convexClient]);

  // Загружаем статистику только при открытии аккордеона реальных результатов
  useEffect(() => {
    if (!company) return;

    Object.keys(expandedRealResults).forEach((key) => {
      if (expandedRealResults[key]) {
        // Парсим ключ формата "dashboard-${dashboardIndex}-stat-${statIndex}"
        const match = key.match(/^dashboard-(\d+)-stat-(\d+)$/);
        if (match) {
          const dashboardIndex = Number.parseInt(match[1]);
          const statIndex = Number.parseInt(match[2]);
          const stat = company.dashboards[dashboardIndex]?.stats[statIndex];

          if (
            stat?.question_id &&
            !questionStats[stat.question_id] &&
            !loadingStats[stat.question_id]
          ) {
            loadQuestionStats(dashboardIndex, statIndex, stat.question_id);
          }
        }
      }
    });
  }, [expandedRealResults, company]);

  const loadQuestionStats = async (
    dashboardIndex: number,
    statIndex: number,
    questionId: string
  ) => {
    if (!questionId || questionStats[questionId] || loadingStats[questionId]) {
      return;
    }

    setLoadingStats((prev) => ({ ...prev, [questionId]: true }));
    try {
      const response = await convexClient.query(
        api.functions.analytic_insights.summaryByQuestion,
        {
          question_id: questionId as any,
        }
      );
      const results = response?.results;
      const stats: { value: string | number; count: number }[] = Array.isArray(
        results
      )
        ? results
        : [];
      setQuestionStats((prev) => ({
        ...prev,
        [questionId]: stats,
      }));
    } catch (error) {
      console.error('Error loading question stats:', error);
      toast.error('Ошибка при загрузке статистики');
    } finally {
      setLoadingStats((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const getQuestionText = (questionId: string) => {
    if (!questionId) return 'Выберите вопрос';
    return questionTitleCache[questionId] || `ID: ${questionId}`;
  };

  // Синхронизируем ref с state
  useEffect(() => {
    questionTitleCacheRef.current = questionTitleCache;
  }, [questionTitleCache]);

  // Функция для обновления кэша текста вопроса
  const updateQuestionTitleCache = (questionId: string, title: string) => {
    if (!questionId || !title) return;
    setQuestionTitleCache((prev) => {
      if (prev[questionId] === title) return prev; // Уже есть такое же значение
      const updated = { ...prev, [questionId]: title };
      questionTitleCacheRef.current = updated;
      return updated;
    });
  };

  // Функция для загрузки текста вопроса
  const loadQuestionTitle = async (questionId: string) => {
    if (!questionId) return;

    // Проверяем через ref, чтобы избежать замыкания
    if (questionTitleCacheRef.current[questionId]) {
      return; // Уже загружен
    }

    if (loadingTitlesRef.current.has(questionId)) {
      return; // Уже загружается
    }

    // Добавляем в список загружаемых
    loadingTitlesRef.current.add(questionId);

    try {
      const question = await convexClient.query(
        api.functions.analytic_questions.getById,
        {
          id: questionId,
        }
      );
      const title = question?.text;
      if (title) {
        updateQuestionTitleCache(questionId, String(title));
      }
    } catch (error) {
      console.error('Error fetching question title:', error);
    } finally {
      loadingTitlesRef.current.delete(questionId);
    }
  };

  // После getById данные в company; RSC-проп может быть пустым — опираемся на company
  useEffect(() => {
    if (!company?.dashboards?.length) return;

    const allIds = new Set<string>();
    company.dashboards.forEach((d) =>
      d.stats.forEach((s) => s.question_id && allIds.add(s.question_id))
    );

    const missingIds = Array.from(allIds).filter(
      (id) =>
        !questionTitleCacheRef.current[id] && !loadingTitlesRef.current.has(id)
    );

    if (missingIds.length > 0) {
      missingIds.forEach((id) => {
        loadQuestionTitle(id).catch((error) => {
          console.error(`Error loading question title ${id}:`, error);
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- кэш/ref сами гардят повторы
  }, [company]);

  // Обновление компании
  const updateCompany = (updates: Partial<Company>) => {
    if (!company) return;
    setCompany({ ...company, ...updates });
  };

  // Дашборды
  const handleAddDashboard = () => {
    if (!company) return;
    const updated = addDashboard(company);
    setCompany(updated);
    const newDashboardIndex = updated.dashboards.length - 1;
    setExpandedDashboards([
      ...expandedDashboards,
      `dashboard-${newDashboardIndex}`,
    ]);
  };

  const handleUpdateDashboard = (
    index: number,
    field: keyof Dashboard,
    value: any
  ) => {
    if (!company) return;
    setCompany(updateDashboard(company, index, field, value));
  };

  const handleRemoveDashboard = (index: number) => {
    if (!company) return;
    setCompany(removeDashboard(company, index));
    setExpandedDashboards(
      expandedDashboards
        .filter((id) => id !== `dashboard-${index}`)
        .map((id) => {
          const idParts = id.split('-');
          const idx = Number.parseInt(idParts[1]);
          if (idx > index) {
            return `dashboard-${idx - 1}`;
          }
          return id;
        })
    );
  };

  const handleMoveDashboardUp = (index: number) => {
    if (!company) return;
    const updated = moveDashboardUp(company, index);
    setCompany(updated);
    setExpandedDashboards(
      expandedDashboards.map((id) => {
        if (id === `dashboard-${index}`) {
          return `dashboard-${index - 1}`;
        }
        if (id === `dashboard-${index - 1}`) {
          return `dashboard-${index}`;
        }
        return id;
      })
    );
  };

  const handleMoveDashboardDown = (index: number) => {
    if (!company) return;
    const updated = moveDashboardDown(company, index);
    setCompany(updated);
    setExpandedDashboards(
      expandedDashboards.map((id) => {
        if (id === `dashboard-${index}`) {
          return `dashboard-${index + 1}`;
        }
        if (id === `dashboard-${index + 1}`) {
          return `dashboard-${index}`;
        }
        return id;
      })
    );
  };

  // Статистики
  const handleAddStat = (dashboardIndex: number) => {
    if (!company) return;
    setCompany(addStat(company, dashboardIndex));
  };

  const handleUpdateStat = (
    dashboardIndex: number,
    statIndex: number,
    field: keyof Stat,
    value: any
  ) => {
    if (!company) return;
    setCompany(updateStat(company, dashboardIndex, statIndex, field, value));
  };

  const handleRemoveStat = (dashboardIndex: number, statIndex: number) => {
    if (!company) return;
    setCompany(removeStat(company, dashboardIndex, statIndex));
  };

  const handleMoveStatUp = (dashboardIndex: number, statIndex: number) => {
    if (!company) return;
    setCompany(moveStatUp(company, dashboardIndex, statIndex));
  };

  const handleMoveStatDown = (dashboardIndex: number, statIndex: number) => {
    if (!company) return;
    setCompany(moveStatDown(company, dashboardIndex, statIndex));
  };

  const handleQuestionSelect = async (
    dashboardIndex: number,
    statIndex: number,
    questionId: string
  ) => {
    if (!company) return;
    const updated = selectQuestion(
      company,
      dashboardIndex,
      statIndex,
      questionId
    );
    setCompany(updated);

    // Загружаем текст вопроса сразу при выборе, если его еще нет в кэше
    if (questionId) {
      await loadQuestionTitle(questionId);
    }
    // Статистика будет загружена только при открытии аккордеона реальных результатов
  };

  // Графики
  const handleAddGraphic = (dashboardIndex: number, statIndex: number) => {
    if (!company) return;
    setCompany(addGraphic(company, dashboardIndex, statIndex));
  };

  const handleUpdateGraphic = (
    dashboardIndex: number,
    statIndex: number,
    graphicIndex: number,
    field: keyof Graphic,
    value: unknown
  ) => {
    if (!company) return;
    setCompany(
      updateGraphic(
        company,
        dashboardIndex,
        statIndex,
        graphicIndex,
        field,
        value
      )
    );
  };

  const handleRemoveGraphic = (
    dashboardIndex: number,
    statIndex: number,
    graphicIndex: number
  ) => {
    if (!company) return;
    setCompany(removeGraphic(company, dashboardIndex, statIndex, graphicIndex));
  };

  // Масштабы
  const handleAddScale = (dashboardIndex: number, statIndex: number) => {
    if (!company) return;
    setCompany(addScale(company, dashboardIndex, statIndex));
  };

  const handleUpdateScale = (
    dashboardIndex: number,
    statIndex: number,
    scaleIndex: number,
    field: string,
    value: any
  ) => {
    if (!company) return;
    setCompany(
      updateScale(
        company,
        dashboardIndex,
        statIndex,
        scaleIndex,
        field as keyof Scale,
        value
      )
    );
  };

  const handleRemoveScale = (
    dashboardIndex: number,
    statIndex: number,
    scaleIndex: number
  ) => {
    if (!company) return;
    setCompany(removeScale(company, dashboardIndex, statIndex, scaleIndex));
  };

  const handleAddScaleFromVariant = (
    dashboardIndex: number,
    statIndex: number,
    variantValue: string
  ) => {
    if (!company) return;
    const updated = addScaleFromVariant(
      company,
      dashboardIndex,
      statIndex,
      variantValue
    );
    setCompany(updated);
    toast.success('Масштаб добавлен');
  };

  const handleApplyDefaultDistribution = (
    dashboardIndex: number,
    statIndex: number
  ) => {
    if (!company) return;
    const stat = company.dashboards[dashboardIndex].stats[statIndex];
    const stats = questionStats[stat.question_id];

    if (!stats || stats.length === 0) {
      toast.error('Нет данных для распределения');
      return;
    }

    const updated = applyDefaultDistribution(
      company,
      dashboardIndex,
      statIndex,
      stats
    );
    setCompany(updated);
    setDefaultDistributionDialog({
      open: false,
      dashboardIndex: -1,
      statIndex: -1,
    });
    toast.success('Распределение по умолчанию применено');
  };

  const handleApplyInsightFill = async (value: number) => {
    const cid = company?._id?.trim();
    if (!cid) {
      toast.error('Сохраните компанию, чтобы создавать инсайты');
      return;
    }

    const startMs = new Date(fillDateStart).getTime();
    const endMs = new Date(fillDateEnd).getTime();
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
      toast.error('Укажите корректный интервал дат');
      return;
    }
    if (endMs < startMs) {
      toast.error('Конец периода не может быть раньше начала');
      return;
    }

    let scope:
      | 'all'
      | { kind: 'dashboard'; dashboardIndex: number }
      | { kind: 'stat'; dashboardIndex: number; statIndex: number };

    if (fillDialog.type === 'all') {
      scope = 'all';
    } else if (fillDialog.type === 'dashboard') {
      const di = fillDialog.dashboardIndex;
      if (di === undefined || di < 0) {
        toast.error('Не выбран дашборд');
        return;
      }
      scope = { kind: 'dashboard', dashboardIndex: di };
    } else {
      const di = fillDialog.dashboardIndex;
      const si = fillDialog.statIndex;
      if (di === undefined || si === undefined || di < 0 || si < 0) {
        toast.error('Не выбрана статистика');
        return;
      }
      scope = { kind: 'stat', dashboardIndex: di, statIndex: si };
    }

    setIsApplyingInsightFill(true);
    try {
      const { createdInsights } = await convexClient.mutation(
        api.functions.companies.fillInsightsForCompany,
        {
          companyId: cid as any,
          fillValue: Math.floor(value),
          startDate: startMs,
          endDate: endMs,
          scope,
        }
      );
      toast.success(
        createdInsights > 0
          ? `Создано инсайтов: ${createdInsights}`
          : 'Ни одного инсайта не создано (проверьте вопросы и распределения масштабов)'
      );
      setFillDialog({ open: false, type: 'stat' });
      setFillValue('');
    } catch (e) {
      console.error('[useCompanyForm] fillInsightsForCompany', e);
      toast.error(
        e instanceof Error ? e.message : 'Ошибка при создании инсайтов'
      );
    } finally {
      setIsApplyingInsightFill(false);
    }
  };

  const handleFillDialogOpen = (
    type: 'stat' | 'dashboard' | 'all',
    dashboardIndex?: number,
    statIndex?: number
  ) => {
    const d = defaultFillDateRange();
    setFillDateStart(d.start);
    setFillDateEnd(d.end);
    setFillDialog({
      open: true,
      type,
      dashboardIndex,
      statIndex,
    });
  };

  const handleRealResultsExpandedChange = (key: string, expanded: boolean) => {
    setExpandedRealResults((prev) => ({
      ...prev,
      [key]: expanded,
    }));
  };

  const prepareForSubmit = (): Company => {
    if (!company) throw new Error('Company is null');
    return prepareCompanyForSubmit(company);
  };

  return {
    company,
    setCompany,
    expandedDashboards,
    setExpandedDashboards,
    expandedRealResults,
    onRealResultsExpandedChange: handleRealResultsExpandedChange,
    questionStats,
    loadingStats,
    questionTitleCache,
    defaultDistributionDialog,
    setDefaultDistributionDialog,
    fillDialog,
    setFillDialog,
    fillValue,
    setFillValue,
    fillDateStart,
    setFillDateStart,
    fillDateEnd,
    setFillDateEnd,
    isApplyingInsightFill,
    updateCompany,
    handleAddDashboard,
    handleUpdateDashboard,
    handleRemoveDashboard,
    handleMoveDashboardUp,
    handleMoveDashboardDown,
    handleAddStat,
    handleUpdateStat,
    handleRemoveStat,
    handleMoveStatUp,
    handleMoveStatDown,
    handleQuestionSelect,
    handleAddGraphic,
    handleUpdateGraphic,
    handleRemoveGraphic,
    handleAddScale,
    handleUpdateScale,
    handleRemoveScale,
    handleAddScaleFromVariant,
    handleApplyDefaultDistribution,
    handleApplyInsightFill,
    handleFillDialogOpen,
    getQuestionText,
    updateQuestionTitleCache,
    prepareForSubmit,
  };
}
