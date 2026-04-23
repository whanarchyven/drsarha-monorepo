'use client';

import {
  Graphic,
  DashboardType,
  StatTabMode,
  StatUnit,
  SpecialityDistributionEntry,
} from '@/entities/company/model';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

/** Значение селекта Radix: «не задано» → null в данных */
const STAT_UNIT_SELECT_NONE = '__stat_unit_none__';

interface GraphicsListProps {
  graphics: Graphic[];
  dashboardIndex: number;
  statIndex: number;
  questionStats?: {
    value: string | number;
    count: number;
    speciality_distribution?: Array<{ specialty: string; percent: number }>;
  }[];
  onAdd: () => void;
  onUpdate: (
    graphicIndex: number,
    field: keyof Graphic,
    value: unknown
  ) => void;
  onRemove: (graphicIndex: number) => void;
}

const SPECIALITY_DISTRIBUTION_MODE_AUTO = 'auto';
const SPECIALITY_DISTRIBUTION_MODE_DIRECT = 'direct';

function roundPercent(value: number) {
  return Math.round(value * 100) / 100;
}

function normalizeDistribution(
  entries: SpecialityDistributionEntry[]
): SpecialityDistributionEntry[] {
  const cleaned = entries
    .map((entry) => ({
      specialty: String(entry.specialty ?? '').trim(),
      percent: Number(entry.percent),
    }))
    .filter((entry) => Number.isFinite(entry.percent))
    .map((entry) => ({
      ...entry,
      percent: Math.max(0, entry.percent),
    }));

  if (cleaned.length === 0) {
    return [];
  }

  const sum = cleaned.reduce((acc, entry) => acc + entry.percent, 0);
  if (sum <= 0) {
    const equal = roundPercent(100 / cleaned.length);
    return cleaned.map((entry, index) => ({
      ...entry,
      percent:
        index === cleaned.length - 1
          ? roundPercent(100 - equal * (cleaned.length - 1))
          : equal,
    }));
  }

  const normalized = cleaned.map((entry) => ({
    ...entry,
    percent: roundPercent((entry.percent / sum) * 100),
  }));
  const normalizedSum = normalized.reduce((acc, entry) => acc + entry.percent, 0);
  const delta = roundPercent(100 - normalizedSum);
  normalized[normalized.length - 1].percent = roundPercent(
    normalized[normalized.length - 1].percent + delta
  );
  return normalized;
}

function updateDistributionPercent(
  entries: SpecialityDistributionEntry[],
  index: number,
  nextPercent: number
) {
  const current = entries.map((entry) => ({ ...entry }));
  if (!current[index]) {
    return normalizeDistribution(current);
  }

  let clamped = Math.max(0, Math.min(100, Number.isFinite(nextPercent) ? nextPercent : 0));
  const othersSum = current.reduce(
    (acc, entry, currentIndex) =>
      currentIndex === index ? acc : acc + Math.max(0, entry.percent),
    0
  );
  const newSum = othersSum + clamped;

  if (newSum > 100) {
    const excess = newSum - 100;
    if (othersSum > 0) {
      current.forEach((entry, currentIndex) => {
        if (currentIndex === index) {
          return;
        }
        const proportion = Math.max(0, entry.percent) / othersSum;
        entry.percent = Math.max(0, entry.percent - excess * proportion);
      });
    } else {
      clamped = 100;
    }
  } else if (newSum < 100 && othersSum > 0) {
    const deficit = 100 - newSum;
    current.forEach((entry, currentIndex) => {
      if (currentIndex === index) {
        return;
      }
      const proportion = Math.max(0, entry.percent) / othersSum;
      entry.percent = entry.percent + deficit * proportion;
    });
  }

  current[index] = { ...current[index], percent: clamped };
  return normalizeDistribution(current);
}

function addDistributionEntry(entries: SpecialityDistributionEntry[]) {
  if (entries.length === 0) {
    return [{ specialty: '', percent: 100 }];
  }

  const normalized = normalizeDistribution(entries);
  const newPercent = Math.min(10, 100);
  const reduced = normalized.map((entry) => ({
    ...entry,
    percent: entry.percent * ((100 - newPercent) / 100),
  }));

  return normalizeDistribution([
    ...reduced,
    { specialty: '', percent: newPercent },
  ]);
}

function removeDistributionEntry(
  entries: SpecialityDistributionEntry[],
  index: number
) {
  const next = entries.filter((_, currentIndex) => currentIndex !== index);
  return normalizeDistribution(next);
}

function buildDefaultDirectDistribution(
  questionStats?: {
    value: string | number;
    count: number;
    speciality_distribution?: Array<{ specialty: string; percent: number }>;
  }[]
) {
  if (!questionStats || questionStats.length === 0) {
    return [] as SpecialityDistributionEntry[];
  }

  const weightedCounts = new Map<string, number>();
  for (const row of questionStats) {
    const rowCount = Number(row.count) || 0;
    for (const item of row.speciality_distribution ?? []) {
      const specialty = String(item.specialty ?? '').trim();
      const percent = Number(item.percent);
      if (!specialty || !Number.isFinite(percent) || rowCount <= 0) {
        continue;
      }
      weightedCounts.set(
        specialty,
        (weightedCounts.get(specialty) ?? 0) + (rowCount * percent) / 100
      );
    }
  }

  return normalizeDistribution(
    Array.from(weightedCounts.entries()).map(([specialty, count]) => ({
      specialty,
      percent: count,
    }))
  );
}

export function GraphicsList({
  graphics,
  dashboardIndex,
  statIndex,
  questionStats,
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
              {(() => {
                const directDistribution = normalizeDistribution(
                  graphic.speciality_distribution_direct ?? []
                );
                const defaultDirectDistribution =
                  buildDefaultDirectDistribution(questionStats);
                return (
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
                      <SelectItem value={DashboardType.TAB}>
                        Вкладка (tab)
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
                {graphic.type === DashboardType.BAR ? (
                  <div className="md:col-span-2 space-y-3 pt-1">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`graphic-show-spec-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                        checked={graphic.show_speciality_distribution === true}
                        onCheckedChange={(checked) =>
                          onUpdate(
                            graphicIndex,
                            'show_speciality_distribution',
                            checked === true
                          )
                        }
                      />
                      <Label
                        htmlFor={`graphic-show-spec-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                        className="text-xs font-normal cursor-pointer leading-none">
                        Показывать распределение по специальностям
                        (show_speciality_distribution)
                      </Label>
                    </div>

                    {graphic.show_speciality_distribution === true ? (
                      <div className="space-y-3 rounded-md border border-orange-200/80 dark:border-orange-800/80 p-3">
                        <div className="space-y-1">
                          <Label
                            htmlFor={`graphic-spec-mode-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                            className="text-xs">
                            Режим распределения
                          </Label>
                          <Select
                            value={
                              graphic.speciality_distribution_mode ??
                              SPECIALITY_DISTRIBUTION_MODE_AUTO
                            }
                            onValueChange={(value) => {
                              if (value === SPECIALITY_DISTRIBUTION_MODE_DIRECT) {
                                const nextDirect =
                                  directDistribution.length > 0
                                    ? directDistribution
                                    : defaultDirectDistribution.length > 0
                                      ? defaultDirectDistribution
                                      : [{ specialty: '', percent: 100 }];
                                onUpdate(
                                  graphicIndex,
                                  'speciality_distribution_direct',
                                  nextDirect
                                );
                              } else {
                                onUpdate(
                                  graphicIndex,
                                  'speciality_distribution_mode',
                                  value
                                );
                              }
                            }}>
                            <SelectTrigger
                              id={`graphic-spec-mode-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                              className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={SPECIALITY_DISTRIBUTION_MODE_AUTO}>
                                Реальное (auto)
                              </SelectItem>
                              <SelectItem value={SPECIALITY_DISTRIBUTION_MODE_DIRECT}>
                                Ручное (direct)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {(graphic.speciality_distribution_mode ?? SPECIALITY_DISTRIBUTION_MODE_AUTO) ===
                        SPECIALITY_DISTRIBUTION_MODE_DIRECT ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-muted-foreground">
                                В режиме `direct` с ручки будет отдаваться это распределение
                                вместо реального.
                              </p>
                              <div className="flex gap-2 shrink-0">
                                {defaultDirectDistribution.length > 0 ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      onUpdate(
                                        graphicIndex,
                                        'speciality_distribution_direct',
                                        defaultDirectDistribution
                                      )
                                    }>
                                    Реальное по умолчанию
                                  </Button>
                                ) : null}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    onUpdate(
                                      graphicIndex,
                                      'speciality_distribution_direct',
                                      addDistributionEntry(directDistribution)
                                    )
                                  }>
                                  Добавить вариант
                                </Button>
                              </div>
                            </div>

                            {directDistribution.length === 0 ? (
                              <div className="text-xs text-muted-foreground border border-dashed rounded-md p-3">
                                Добавьте хотя бы один вариант распределения.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {directDistribution.map((item, distributionIndex) => (
                                  <div
                                    key={distributionIndex}
                                    className="grid grid-cols-1 md:grid-cols-[1fr_140px_auto] gap-2 items-end">
                                    <div className="space-y-1">
                                      <Label className="text-xs">Специальность</Label>
                                      <Input
                                        className="h-8"
                                        value={item.specialty}
                                        onChange={(e) => {
                                          const next = directDistribution.map(
                                            (entry, index) =>
                                              index === distributionIndex
                                                ? {
                                                    ...entry,
                                                    specialty: e.target.value,
                                                  }
                                                : entry
                                          );
                                          onUpdate(
                                            graphicIndex,
                                            'speciality_distribution_direct',
                                            next
                                          );
                                        }}
                                        placeholder="Например, Дерматолог"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Процент</Label>
                                      <Input
                                        className="h-8"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={item.percent.toFixed(2)}
                                        onChange={(e) => {
                                          const raw = e.target.value;
                                          const nextValue =
                                            raw === ''
                                              ? 0
                                              : Number.parseFloat(raw.replace(',', '.'));
                                          onUpdate(
                                            graphicIndex,
                                            'speciality_distribution_direct',
                                            updateDistributionPercent(
                                              directDistribution,
                                              distributionIndex,
                                              nextValue
                                            )
                                          );
                                        }}
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        onUpdate(
                                          graphicIndex,
                                          'speciality_distribution_direct',
                                          removeDistributionEntry(
                                            directDistribution,
                                            distributionIndex
                                          )
                                        )
                                      }
                                      className="h-8 w-8 p-0">
                                      <X className="h-4 w-4" />
                                      <span className="sr-only">Удалить вариант</span>
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {graphic.type === DashboardType.TAB ? (
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-orange-200/80 dark:border-orange-800/80 mt-1">
                    <div className="space-y-1 md:col-span-2">
                      <Label
                        htmlFor={`graphic-stat-tab-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                        className="text-xs">
                        Режим вкладки (stat_tab)
                      </Label>
                      <Select
                        value={
                          graphic.stat_tab ?? StatTabMode.COUNT_ALL
                        }
                        onValueChange={(v) =>
                          onUpdate(graphicIndex, 'stat_tab', v as StatTabMode)
                        }>
                        <SelectTrigger
                          id={`graphic-stat-tab-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                          className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={StatTabMode.COUNT_ALL}>
                            Все ответы (count_all)
                          </SelectItem>
                          <SelectItem value={StatTabMode.COUNT_VARIANTS}>
                            Число вариантов (count_variants)
                          </SelectItem>
                          <SelectItem value={StatTabMode.TOP_VARIANT}>
                            Топ вариант (top_variant)
                          </SelectItem>
                          <SelectItem value={StatTabMode.AVERAGE}>
                            Среднее (average)
                          </SelectItem>
                          <SelectItem value={StatTabMode.VARIANT_PERCENT}>
                            Доля варианта (variant_percent)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor={`graphic-stat-title-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                        className="text-xs">
                        Заголовок (stat_title)
                      </Label>
                      <Input
                        id={`graphic-stat-title-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                        className="h-8"
                        value={graphic.stat_title ?? ''}
                        onChange={(e) =>
                          onUpdate(
                            graphicIndex,
                            'stat_title',
                            e.target.value
                          )
                        }
                        placeholder="Заголовок"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor={`graphic-stat-subtitle-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                        className="text-xs">
                        Подзаголовок (stat_subtitle)
                      </Label>
                      <Input
                        id={`graphic-stat-subtitle-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                        className="h-8"
                        value={graphic.stat_subtitle ?? ''}
                        onChange={(e) =>
                          onUpdate(
                            graphicIndex,
                            'stat_subtitle',
                            e.target.value
                          )
                        }
                        placeholder="Подзаголовок"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor={`graphic-stat-unit-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                        className="text-xs">
                        Единица (stat_unit)
                      </Label>
                      <Select
                        value={
                          graphic.stat_unit == null
                            ? STAT_UNIT_SELECT_NONE
                            : graphic.stat_unit
                        }
                        onValueChange={(v) =>
                          onUpdate(
                            graphicIndex,
                            'stat_unit',
                            v === STAT_UNIT_SELECT_NONE
                              ? null
                              : (v as StatUnit)
                          )
                        }>
                        <SelectTrigger
                          id={`graphic-stat-unit-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                          className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={STAT_UNIT_SELECT_NONE}>
                            Не задано (null)
                          </SelectItem>
                          <SelectItem value={StatUnit.COUNT}>
                            Количество (count)
                          </SelectItem>
                          <SelectItem value={StatUnit.PERCENT}>
                            Процент (percent)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {graphic.stat_tab === StatTabMode.VARIANT_PERCENT ? (
                      <div className="space-y-1 md:col-span-2">
                        <Label
                          htmlFor={`graphic-stat-variant-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                          className="text-xs">
                          Вариант для доли (stat_variant)
                        </Label>
                        <Input
                          id={`graphic-stat-variant-${dashboardIndex}-${statIndex}-${graphicIndex}`}
                          className="h-8"
                          value={
                            graphic.stat_variant === undefined ||
                            graphic.stat_variant === null
                              ? ''
                              : String(graphic.stat_variant)
                          }
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw.trim() === '') {
                              onUpdate(graphicIndex, 'stat_variant', undefined);
                              return;
                            }
                            const trimmed = raw.trim();
                            const withDot = trimmed.replace(',', '.');
                            const n = Number(withDot);
                            const looksNumeric =
                              withDot !== '' &&
                              Number.isFinite(n) &&
                              !/[a-zа-яё]/i.test(withDot);
                            onUpdate(
                              graphicIndex,
                              'stat_variant',
                              looksNumeric ? n : trimmed
                            );
                          }}
                          placeholder="Текст варианта или число"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
                );
              })()}
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
