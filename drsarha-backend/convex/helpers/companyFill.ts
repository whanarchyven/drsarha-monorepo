import { cleanupAnalyticsValue } from "./analytics";

/** Распределение объёма заливки по вариантам ответа (имена масштабов с scaleDistribution). */
export function allocateStatResponses(stat: any, fillValue: number) {
  const scalesWithDistribution = Array.isArray(stat.scales)
    ? stat.scales.filter(
        (scale: any) =>
          scale.scaleDistribution !== undefined && scale.scaleDistribution > 0,
      )
    : [];

  const allocations = new Map<string, number>();
  const bigScales: Array<{ scale: any; expectedValue: number }> = [];
  const smallScales: Array<{ scale: any }> = [];

  for (const scale of scalesWithDistribution) {
    const expectedValue = fillValue * scale.scaleDistribution;
    if (expectedValue >= 1) {
      bigScales.push({ scale, expectedValue });
    } else {
      smallScales.push({ scale });
    }
  }

  let remainder = fillValue;

  for (const { scale, expectedValue } of bigScales) {
    const fillAmount = Math.floor(expectedValue);
    if (fillAmount <= 0) {
      continue;
    }
    const key = cleanupAnalyticsValue(scale.name);
    allocations.set(key, (allocations.get(key) ?? 0) + fillAmount);
    remainder -= fillAmount;
  }

  const availableSmallScales = [...smallScales];
  while (remainder > 0 && availableSmallScales.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableSmallScales.length);
    const [selected] = availableSmallScales.splice(randomIndex, 1);
    const fillAmount = remainder >= 2 ? (Math.random() < 0.5 ? 1 : 2) : 1;
    const actualFillAmount = Math.min(fillAmount, remainder);
    const key = cleanupAnalyticsValue(selected.scale.name);
    allocations.set(key, (allocations.get(key) ?? 0) + actualFillAmount);
    remainder -= actualFillAmount;
  }

  return Array.from(allocations.entries())
    .filter(([response, count]) => Boolean(response) && count > 0)
    .map(([response, count]) => ({ response, count }));
}
