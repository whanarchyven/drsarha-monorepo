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
  questionStats: { value: string; count: number }[]
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

// Функция для получения случайного элемента из массива
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Функция для заливки одной статистики с новым алгоритмом
const fillStatValues = (stat: any, fillValue: number): void => {
  console.log(`\n=== Начало заливки статистики "${stat.name}" ===`);
  console.log(`Исходное значение для заливки: ${fillValue}`);

  // Вычисляем 1% от числа заливки (для информации)
  const onePercent = fillValue / 100;
  console.log(`1% от числа заливки: ${onePercent}`);

  // Фильтруем масштабы с распределением (любое положительное распределение)
  const scalesWithDistribution = stat.scales.filter(
    (scale: any) =>
      scale.scaleDistribution !== undefined && scale.scaleDistribution > 0
  );

  console.log(
    `Всего масштабов с распределением: ${scalesWithDistribution.length}`
  );

  const bigScales: Array<{ scale: any; index: number; expectedValue: number }> =
    [];
  const smallScales: Array<{ scale: any; index: number }> = [];

  // Для каждого масштаба умножаем число заливки на распределение
  scalesWithDistribution.forEach((scale: any, index: number) => {
    const expectedValue = fillValue * scale.scaleDistribution;
    console.log(
      `Масштаб "${scale.name}": распределение=${(scale.scaleDistribution * 100).toFixed(2)}%, fillValue * scaleDistribution = ${fillValue} * ${scale.scaleDistribution} = ${expectedValue.toFixed(2)}`
    );

    // Если полученное число >= 1, то вариант попадает в список больших
    if (expectedValue >= 1) {
      bigScales.push({ scale, index, expectedValue });
      console.log(
        `  → Отнесен к БОЛЬШИМ масштабам (${expectedValue.toFixed(2)} >= 1)`
      );
    } else {
      // Иначе в маленькие
      smallScales.push({ scale, index });
      console.log(
        `  → Отнесен к МАЛЫМ масштабам (${expectedValue.toFixed(2)} < 1)`
      );
    }
  });

  console.log(`\nБольших масштабов: ${bigScales.length}`);
  console.log(`Малых масштабов: ${smallScales.length}`);

  // Инициализируем остаток
  let remainder = fillValue;
  console.log(`\nНачальный остаток: ${remainder}`);

  // Заливаем большие масштабы
  console.log(`\n--- Заливка БОЛЬШИХ масштабов ---`);
  bigScales.forEach(({ scale, index, expectedValue }) => {
    // Округляем процент в меньшую сторону (floor)
    const fillAmount = Math.floor(expectedValue);
    console.log(
      `Масштаб "${scale.name}": ожидаемое=${expectedValue.toFixed(2)}, заливаем=${fillAmount} (округлено вниз)`
    );

    const oldValue = scale.value;
    scale.value = Math.round(scale.value + fillAmount);
    remainder -= fillAmount;

    console.log(
      `  Значение: ${oldValue} → ${scale.value} (добавлено ${fillAmount})`
    );
    console.log(`  Остаток после заливки: ${remainder}`);
  });

  console.log(`\nОстаток после заливки больших масштабов: ${remainder}`);

  // Заливаем малые масштабы пока остаток не иссякнет
  if (remainder > 0 && smallScales.length > 0) {
    console.log(`\n--- Заливка МАЛЫХ масштабов ---`);
    const availableSmallScales = [...smallScales];

    while (remainder > 0 && availableSmallScales.length > 0) {
      // Рандомно выбираем вариант из малых
      const randomIndex = Math.floor(
        Math.random() * availableSmallScales.length
      );
      const selected = availableSmallScales[randomIndex];
      availableSmallScales.splice(randomIndex, 1);

      console.log(`\nВыбран случайный малый масштаб: "${selected.scale.name}"`);

      // Рандомно выбираем сколько залить: 1 или 2
      const fillAmount = remainder >= 2 ? (Math.random() < 0.5 ? 1 : 2) : 1;
      const actualFillAmount = Math.min(fillAmount, remainder);

      console.log(
        `Случайно выбрано залить: ${fillAmount}, фактически заливаем: ${actualFillAmount} (остаток=${remainder})`
      );

      const oldValue = selected.scale.value;
      selected.scale.value = Math.round(
        selected.scale.value + actualFillAmount
      );
      remainder -= actualFillAmount;

      console.log(
        `  Значение: ${oldValue} → ${selected.scale.value} (добавлено ${actualFillAmount})`
      );
      console.log(`  Остаток после заливки: ${remainder}`);
      console.log(
        `  Масштаб "${selected.scale.name}" удален из списка малых (осталось ${availableSmallScales.length})`
      );
    }

    if (remainder > 0) {
      console.log(
        `\n⚠️ Внимание: Остался нераспределенный остаток: ${remainder} (все малые масштабы уже обработаны)`
      );
    }
  } else if (remainder > 0 && smallScales.length === 0) {
    console.log(
      `\n⚠️ Внимание: Остался нераспределенный остаток: ${remainder}, но нет малых масштабов для распределения`
    );
  }

  console.log(`\n=== Конец заливки статистики "${stat.name}" ===`);
  console.log(`Финальный остаток: ${remainder}\n`);
};

export const fillValues = (
  company: Company,
  fillType: 'stat' | 'dashboard' | 'all',
  value: number,
  dashboardIndex?: number,
  statIndex?: number
): Company => {
  console.log(
    `\n╔══════════════════════════════════════════════════════════════╗`
  );
  console.log(`║ НАЧАЛО ЗАЛИВКИ ЗНАЧЕНИЙ`);
  console.log(`║ Тип заливки: ${fillType}`);
  console.log(`║ Исходное значение: ${value}`);
  console.log(
    `╚══════════════════════════════════════════════════════════════╝`
  );

  const updatedDashboards = [...company.dashboards];

  if (
    fillType === 'stat' &&
    dashboardIndex !== undefined &&
    statIndex !== undefined
  ) {
    // Заливка для одной статистики
    console.log(`\nРежим: Заливка одной статистики`);
    console.log(
      `Дашборд индекс: ${dashboardIndex}, Статистика индекс: ${statIndex}`
    );
    const stat = updatedDashboards[dashboardIndex].stats[statIndex];
    fillStatValues(stat, value);
  } else if (fillType === 'dashboard' && dashboardIndex !== undefined) {
    // Заливка для всех статистик дашборда
    console.log(`\nРежим: Заливка всех статистик дашборда`);
    console.log(`Дашборд индекс: ${dashboardIndex}`);
    const dashboard = updatedDashboards[dashboardIndex];
    dashboard.stats.forEach((stat, statIdx) => {
      console.log(
        `\n──────────────────────────────────────────────────────────`
      );
      fillStatValues(stat, value);
    });
  } else if (fillType === 'all') {
    // Заливка для всех дашбордов с учетом процента дашборда
    console.log(`\nРежим: Заливка всех дашбордов с учетом процента`);
    updatedDashboards.forEach((dashboard, dashIdx) => {
      const dashboardPercent = dashboard.dashboardPercent || 0;
      const dashboardFillValue = value * dashboardPercent;
      console.log(
        `\n──────────────────────────────────────────────────────────`
      );
      console.log(
        `Дашборд "${dashboard.name}" (индекс ${dashIdx}): процент=${(dashboardPercent * 100).toFixed(2)}%, значение для заливки=${dashboardFillValue.toFixed(2)}`
      );

      dashboard.stats.forEach((stat, statIdx) => {
        console.log(
          `\n──────────────────────────────────────────────────────────`
        );
        fillStatValues(stat, dashboardFillValue);
      });
    });
  }

  console.log(
    `\n╔══════════════════════════════════════════════════════════════╗`
  );
  console.log(`║ КОНЕЦ ЗАЛИВКИ ЗНАЧЕНИЙ`);
  console.log(
    `╚══════════════════════════════════════════════════════════════╝\n`
  );

  return { ...company, dashboards: updatedDashboards };
};
