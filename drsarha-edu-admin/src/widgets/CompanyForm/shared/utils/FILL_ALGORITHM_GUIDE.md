# Гайд по алгоритму заливки значений в масштабы

## Общее описание

Алгоритм распределяет целочисленное значение заливки между масштабами статистики на основе их процентного распределения (`scaleDistribution`). Алгоритм разделяет масштабы на "большие" и "маленькие" в зависимости от ожидаемого значения после умножения числа заливки на распределение.

## Структура данных

### Входные параметры

```typescript
interface FillValuesParams {
  stat: {
    name: string; // Название статистики
    scales: Array<{
      name: string; // Название масштаба
      value: number; // Текущее значение масштаба (целое число)
      scaleDistribution?: number; // Распределение масштаба (от 0 до 1, где 1 = 100%)
      type: 'linear' | 'multiple'; // Тип масштаба
      autoscale: {
        // Настройки автомасштабирования
        enabled: boolean;
        min_step: number;
        max_step: number;
        extremum: number;
      };
    }>;
  };
  fillValue: number; // Число для заливки (целое число)
}
```

### Промежуточные структуры

```typescript
// Большой масштаб - ожидаемое значение >= 1
interface BigScale {
  scale: Scale; // Объект масштаба
  index: number; // Индекс в массиве scales
  expectedValue: number; // fillValue * scaleDistribution
}

// Малый масштаб - ожидаемое значение < 1
interface SmallScale {
  scale: Scale; // Объект масштаба
  index: number; // Индекс в массиве scales
}
```

## Алгоритм (пошаговое описание)

### Шаг 1: Инициализация

1. Получаем число заливки `fillValue`
2. Вычисляем 1% от числа заливки: `onePercent = fillValue / 100` (для информации)
3. Фильтруем масштабы: берем только те, у которых `scaleDistribution !== undefined && scaleDistribution > 0`

**Результат**: массив `scalesWithDistribution` - все масштабы с положительным распределением

### Шаг 2: Разделение на большие и маленькие

Для каждого масштаба из `scalesWithDistribution`:

1. Вычисляем ожидаемое значение: `expectedValue = fillValue * scaleDistribution`
2. Проверяем условие:
   - Если `expectedValue >= 1` → добавляем в массив `bigScales`
   - Если `expectedValue < 1` → добавляем в массив `smallScales`

**Примеры**:

- `fillValue = 100`, `scaleDistribution = 0.05` (5%) → `expectedValue = 5` → **большой**
- `fillValue = 100`, `scaleDistribution = 0.005` (0.5%) → `expectedValue = 0.5` → **маленький**
- `fillValue = 50`, `scaleDistribution = 0.01` (1%) → `expectedValue = 0.5` → **маленький**
- `fillValue = 200`, `scaleDistribution = 0.01` (1%) → `expectedValue = 2` → **большой**

### Шаг 3: Инициализация остатка

```typescript
let remainder = fillValue;
```

Остаток начинается равным полному числу заливки и будет уменьшаться по мере распределения.

### Шаг 4: Заливка больших масштабов

Для каждого масштаба из `bigScales`:

1. Вычисляем количество для заливки: `fillAmount = Math.floor(expectedValue)`
   - Округляем ожидаемое значение **вниз** до целого числа
   - Пример: `expectedValue = 5.7` → `fillAmount = 5`

2. Обновляем значение масштаба: `scale.value = Math.round(scale.value + fillAmount)`
   - Добавляем округленное значение к текущему значению масштаба

3. Уменьшаем остаток: `remainder = remainder - fillAmount`

**Логирование**: для каждого шага выводим старое значение, новое значение, добавленное количество и текущий остаток

### Шаг 5: Заливка маленьких масштабов

Пока `remainder > 0` и есть доступные малые масштабы:

1. **Случайный выбор масштаба**:
   - Создаем копию массива `smallScales`: `availableSmallScales = [...smallScales]`
   - Выбираем случайный индекс: `randomIndex = Math.floor(Math.random() * availableSmallScales.length)`
   - Извлекаем выбранный масштаб: `selected = availableSmallScales[randomIndex]`
   - Удаляем его из массива: `availableSmallScales.splice(randomIndex, 1)`

2. **Случайный выбор количества**:
   - Если `remainder >= 2`: случайно выбираем 1 или 2 (50% вероятность каждого)
   - Если `remainder === 1`: выбираем 1
   - Фактическое количество: `actualFillAmount = Math.min(fillAmount, remainder)`

3. **Обновление значения**:
   - `scale.value = Math.round(scale.value + actualFillAmount)`
   - `remainder = remainder - actualFillAmount`

4. **Повторяем** пока `remainder > 0` и `availableSmallScales.length > 0`

**Важно**: каждый малый масштаб может получить заливку только один раз. После заливки он удаляется из списка доступных.

### Шаг 6: Обработка остатка

Если после всех операций `remainder > 0`:

- Логируем предупреждение о нераспределенном остатке
- Остаток остается нераспределенным (не добавляется ни к одному масштабу)

## Блок-схема алгоритма

```
┌─────────────────────────────────────┐
│  НАЧАЛО: fillValue, stat.scales     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Фильтруем масштабы:                │
│  scaleDistribution > 0              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Для каждого масштаба:              │
│  expectedValue = fillValue *        │
│                  scaleDistribution  │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────┐
│ expectedValue│  │ expectedValue│
│    >= 1      │  │     < 1      │
└──────┬───────┘  └──────┬───────┘
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│  bigScales   │  │ smallScales  │
└──────┬───────┘  └──────┬───────┘
       │                 │
       │                 │
       ▼                 │
┌─────────────────────┐  │
│ remainder = fillValue│ │
└──────────┬──────────┘  │
           │             │
           ▼             │
┌─────────────────────┐  │
│ Для каждого bigScale│  │
│ fillAmount =        │  │
│   floor(expectedValue)│ │
│ scale.value +=      │  │
│   fillAmount        │  │
│ remainder -=        │  │
│   fillAmount        │  │
└──────────┬──────────┘  │
           │             │
           ▼             │
┌─────────────────────┐  │
│ remainder > 0?       │  │
│ AND                 │  │
│ smallScales.length  │  │
│ > 0?                │  │
└──────┬──────────────┘  │
       │                 │
   ┌───┴───┐             │
   │  ДА   │             │
   └───┬───┘             │
       │                 │
       ▼                 │
┌─────────────────────┐  │
│ Выбрать случайный   │  │
│ smallScale          │  │
│ Удалить из списка   │  │
└──────────┬──────────┘  │
           │             │
           ▼             │
┌─────────────────────┐  │
│ fillAmount =        │  │
│   random(1 или 2)   │  │
│ actualFillAmount =  │  │
│   min(fillAmount,   │  │
│       remainder)    │  │
└──────────┬──────────┘  │
           │             │
           ▼             │
┌─────────────────────┐  │
│ scale.value +=      │  │
│   actualFillAmount  │  │
│ remainder -=        │  │
│   actualFillAmount  │  │
└──────────┬──────────┘  │
           │             │
           └─────────────┘
           │
           ▼
┌─────────────────────┐
│ КОНЕЦ: обновленные   │
│ значения масштабов   │
└─────────────────────┘
```

## Примеры работы алгоритма

### Пример 1: Простой случай

**Входные данные**:

- `fillValue = 100`
- Масштабы:
  - A: `scaleDistribution = 0.5` (50%), `value = 0`
  - B: `scaleDistribution = 0.3` (30%), `value = 0`
  - C: `scaleDistribution = 0.2` (20%), `value = 0`

**Шаг 2: Разделение**:

- A: `100 * 0.5 = 50` → **большой**
- B: `100 * 0.3 = 30` → **большой**
- C: `100 * 0.2 = 20` → **большой**

**Шаг 4: Заливка больших**:

- A: `fillAmount = floor(50) = 50`, `value = 0 + 50 = 50`, `remainder = 100 - 50 = 50`
- B: `fillAmount = floor(30) = 30`, `value = 0 + 30 = 30`, `remainder = 50 - 30 = 20`
- C: `fillAmount = floor(20) = 20`, `value = 0 + 20 = 20`, `remainder = 20 - 20 = 0`

**Результат**: `remainder = 0`, все распределено, малые масштабы не нужны.

### Пример 2: С малыми масштабами

**Входные данные**:

- `fillValue = 100`
- Масштабы:
  - A: `scaleDistribution = 0.45` (45%), `value = 0`
  - B: `scaleDistribution = 0.30` (30%), `value = 0`
  - C: `scaleDistribution = 0.005` (0.5%), `value = 0`
  - D: `scaleDistribution = 0.003` (0.3%), `value = 0`

**Шаг 2: Разделение**:

- A: `100 * 0.45 = 45` → **большой**
- B: `100 * 0.30 = 30` → **большой**
- C: `100 * 0.005 = 0.5` → **маленький**
- D: `100 * 0.003 = 0.3` → **маленький**

**Шаг 4: Заливка больших**:

- A: `fillAmount = floor(45) = 45`, `value = 45`, `remainder = 55`
- B: `fillAmount = floor(30) = 30`, `value = 30`, `remainder = 25`

**Шаг 5: Заливка малых**:

- `remainder = 25`, доступны: [C, D]
- Итерация 1: случайно выбран C, случайно выбрано 2, `C.value = 2`, `remainder = 23`
- Итерация 2: случайно выбран D, случайно выбрано 1, `D.value = 1`, `remainder = 22`
- Итерация 3: случайно выбран C (снова), случайно выбрано 2, `C.value = 4`, `remainder = 20`
- ... и так далее пока `remainder > 0`

### Пример 3: С остатком

**Входные данные**:

- `fillValue = 10`
- Масштабы:
  - A: `scaleDistribution = 0.7` (70%), `value = 0`
  - B: `scaleDistribution = 0.2` (20%), `value = 0`

**Шаг 2: Разделение**:

- A: `10 * 0.7 = 7` → **большой**
- B: `10 * 0.2 = 2` → **большой**

**Шаг 4: Заливка больших**:

- A: `fillAmount = floor(7) = 7`, `value = 7`, `remainder = 3`
- B: `fillAmount = floor(2) = 2`, `value = 2`, `remainder = 1`

**Шаг 5**: Нет малых масштабов, `remainder = 1` остается нераспределенным.

## Код функции

```typescript
/**
 * Функция для заливки одной статистики с новым алгоритмом
 *
 * @param stat - Объект статистики со свойством scales (массив масштабов)
 * @param fillValue - Целое число для заливки
 */
const fillStatValues = (
  stat: {
    name: string;
    scales: Array<{
      name: string;
      value: number;
      scaleDistribution?: number;
      type: 'linear' | 'multiple';
      autoscale: {
        enabled: boolean;
        min_step: number;
        max_step: number;
        extremum: number;
      };
    }>;
  },
  fillValue: number
): void => {
  console.log(`\n=== Начало заливки статистики "${stat.name}" ===`);
  console.log(`Исходное значение для заливки: ${fillValue}`);

  // Шаг 1: Вычисляем 1% от числа заливки (для информации)
  const onePercent = fillValue / 100;
  console.log(`1% от числа заливки: ${onePercent}`);

  // Шаг 1: Фильтруем масштабы с распределением (любое положительное распределение)
  const scalesWithDistribution = stat.scales.filter(
    (scale) =>
      scale.scaleDistribution !== undefined && scale.scaleDistribution > 0
  );

  console.log(
    `Всего масштабов с распределением: ${scalesWithDistribution.length}`
  );

  // Шаг 2: Разделяем на большие и маленькие
  const bigScales: Array<{ scale: any; index: number; expectedValue: number }> =
    [];
  const smallScales: Array<{ scale: any; index: number }> = [];

  scalesWithDistribution.forEach((scale, index) => {
    // Умножаем число заливки на распределение
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

  // Шаг 3: Инициализируем остаток
  let remainder = fillValue;
  console.log(`\nНачальный остаток: ${remainder}`);

  // Шаг 4: Заливаем большие масштабы
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

  // Шаг 5: Заливаем малые масштабы пока остаток не иссякнет
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
```

## Важные замечания

1. **Округление**: Все значения масштабов округляются до целых чисел (`Math.round`)
2. **Остаток**: Если после всех операций остается остаток и нет малых масштабов, он не распределяется
3. **Случайность**: При заливке малых масштабов используется случайный выбор для обеспечения равномерного распределения
4. **Однократность**: Каждый малый масштаб может получить заливку только один раз за выполнение алгоритма
5. **Производительность**: Алгоритм имеет сложность O(n + m), где n - количество больших масштабов, m - количество малых масштабов

## Использование на сервере

При реализации на сервере рекомендуется:

1. Убрать все `console.log` или заменить на логирование через систему логирования сервера
2. Добавить валидацию входных данных
3. Добавить обработку ошибок
4. Рассмотреть возможность батчевой обработки нескольких статистик
5. Добавить метрики производительности
