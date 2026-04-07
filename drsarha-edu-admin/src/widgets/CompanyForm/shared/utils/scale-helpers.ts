import { Scale, Company } from '@/entities/company/model';

export const addScale = (
  company: Company,
  dashboardIndex: number,
  statIndex: number
): Company => {
  const updatedDashboards = [...company.dashboards];
  updatedDashboards[dashboardIndex].stats[statIndex].scales.push({
    name: '',
    value: 0,
    type: 'linear',
    autoscale: {
      enabled: false,
      min_step: 0,
      max_step: 0,
      extremum: 0,
    },
    scaleDistribution: undefined,
  });
  return { ...company, dashboards: updatedDashboards };
};

export const updateScale = (
  company: Company,
  dashboardIndex: number,
  statIndex: number,
  scaleIndex: number,
  field: keyof Scale,
  value: any
): Company => {
  const updatedDashboards = [...company.dashboards];
  const scales = [...updatedDashboards[dashboardIndex].stats[statIndex].scales];

  // Если изменяется scaleDistribution, применяем автобалансировку
  if (field === 'scaleDistribution') {
    let newValue =
      value !== undefined && value !== null ? Number(value) : undefined;

    // Вычисляем текущую сумму всех распределений (кроме изменяемого)
    const currentSum = scales.reduce((sum, scale, idx) => {
      if (idx === scaleIndex) return sum;
      return sum + (scale.scaleDistribution || 0);
    }, 0);

    // Вычисляем новую сумму
    const newSum = currentSum + (newValue || 0);

    if (newSum > 1.0) {
      // Если сумма превышает 1.0, пропорционально уменьшаем остальные
      const excess = newSum - 1.0;
      const otherScalesSum = currentSum;

      if (otherScalesSum > 0) {
        // Пропорционально уменьшаем остальные масштабы
        scales.forEach((scale, idx) => {
          if (idx !== scaleIndex && scale.scaleDistribution !== undefined) {
            const currentDist = scale.scaleDistribution;
            const proportion = currentDist / otherScalesSum;
            const reduction = excess * proportion;
            scale.scaleDistribution = Math.max(0, currentDist - reduction);
          }
        });
      } else {
        // Если других распределений нет, ограничиваем новое значение до 1.0
        newValue = 1.0;
      }
    } else if (newSum < 1.0 && newValue !== undefined) {
      // Если сумма меньше 1.0, пропорционально увеличиваем остальные
      const deficit = 1.0 - newSum;
      const otherScalesSum = currentSum;

      if (otherScalesSum > 0) {
        // Пропорционально увеличиваем остальные масштабы
        scales.forEach((scale, idx) => {
          if (idx !== scaleIndex && scale.scaleDistribution !== undefined) {
            const currentDist = scale.scaleDistribution;
            const proportion = currentDist / otherScalesSum;
            const increase = deficit * proportion;
            scale.scaleDistribution = Math.min(1.0, currentDist + increase);
          }
        });
      }
    }

    // Обновляем изменяемый масштаб
    scales[scaleIndex] = {
      ...scales[scaleIndex],
      scaleDistribution:
        newValue !== undefined
          ? Math.max(0, Math.min(1.0, newValue))
          : undefined,
    };

    // Нормализуем: убеждаемся, что сумма равна 1.0
    const finalSum = scales.reduce(
      (sum, scale) => sum + (scale.scaleDistribution || 0),
      0
    );
    if (finalSum > 0 && Math.abs(finalSum - 1.0) > 0.0001) {
      // Нормализуем все значения
      scales.forEach((scale) => {
        if (scale.scaleDistribution !== undefined) {
          scale.scaleDistribution = scale.scaleDistribution / finalSum;
        }
      });
    }

    updatedDashboards[dashboardIndex].stats[statIndex].scales = scales;
  } else {
    // Для других полей просто обновляем значение
    // Если это поле value, округляем до целого
    const finalValue =
      field === 'value' ? Math.round(Number(value) || 0) : value;
    updatedDashboards[dashboardIndex].stats[statIndex].scales[scaleIndex] = {
      ...updatedDashboards[dashboardIndex].stats[statIndex].scales[scaleIndex],
      [field]: finalValue,
    };
  }

  return { ...company, dashboards: updatedDashboards };
};

export const removeScale = (
  company: Company,
  dashboardIndex: number,
  statIndex: number,
  scaleIndex: number
): Company => {
  const updatedDashboards = [...company.dashboards];
  updatedDashboards[dashboardIndex].stats[statIndex].scales.splice(
    scaleIndex,
    1
  );
  return { ...company, dashboards: updatedDashboards };
};

export const addScaleFromVariant = (
  company: Company,
  dashboardIndex: number,
  statIndex: number,
  variantValue: string
): Company => {
  // Удаляем постфикс "(*)" из значения перед добавлением
  const normalizedValue = String(variantValue)
    .replace(/\s*\(\*\)\s*$/, '') // Удаляем постфикс "(*)" в конце
    .trim();

  const updatedDashboards = [...company.dashboards];
  updatedDashboards[dashboardIndex].stats[statIndex].scales.push({
    name: normalizedValue,
    value: 0,
    type: 'linear',
    autoscale: {
      enabled: false,
      min_step: 0,
      max_step: 0,
      extremum: 0,
    },
    scaleDistribution: 0,
  });
  return { ...company, dashboards: updatedDashboards };
};

export const applyDefaultDistribution = (
  company: Company,
  dashboardIndex: number,
  statIndex: number,
  questionStats: { value: string | number; count: number }[]
): Company => {
  const stat = company.dashboards[dashboardIndex].stats[statIndex];

  if (!questionStats || questionStats.length === 0) {
    return company;
  }

  const total = questionStats.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) {
    return company;
  }

  // Функция для нормализации значения (удаляет постфикс "(*)" и пробелы)
  const normalizeValue = (val: string): string => {
    return String(val)
      .replace(/\s*\(\*\)\s*$/, '') // Удаляем постфикс "(*)" в конце
      .trim();
  };

  // Создаем карту распределений по нормализованным названиям из реальных результатов
  const distributionMap = new Map<string, number>();
  questionStats.forEach((item) => {
    const normalizedValue = normalizeValue(item.value);
    const percentage = item.count / total; // от 0 до 1
    // Используем нормализованное значение как ключ
    distributionMap.set(normalizedValue, percentage);
  });

  const updatedDashboards = [...company.dashboards];
  const existingScales = [
    ...updatedDashboards[dashboardIndex].stats[statIndex].scales,
  ];

  // Создаем Set существующих нормализованных названий масштабов
  const existingScaleNames = new Set(
    existingScales.map((scale) => normalizeValue(scale.name))
  );

  // Добавляем масштабы для всех вариантов из реальных результатов, которых еще нет
  questionStats.forEach((item) => {
    const normalizedValue = normalizeValue(item.value);
    if (!existingScaleNames.has(normalizedValue)) {
      const distribution = distributionMap.get(normalizedValue) || 0;
      existingScales.push({
        name: normalizedValue,
        value: 0,
        type: 'linear',
        autoscale: {
          enabled: false,
          min_step: 0,
          max_step: 0,
          extremum: 0,
        },
        scaleDistribution: distribution,
      });
      existingScaleNames.add(normalizedValue);
    }
  });

  // Обновляем scaleDistribution для всех масштабов (включая существующие)
  updatedDashboards[dashboardIndex].stats[statIndex].scales =
    existingScales.map((scale) => {
      const normalizedScaleName = normalizeValue(scale.name);
      const distribution = distributionMap.get(normalizedScaleName);
      if (distribution !== undefined) {
        return {
          ...scale,
          scaleDistribution: distribution,
        };
      }
      // Если масштаб не найден в статистике, оставляем как есть
      return scale;
    });

  return { ...company, dashboards: updatedDashboards };
};
