import type { AnalyticsQuestion } from '@/shared/types/analytics';

/** Единый вид для списков/бейджей после перехода на Convex (text + variants). */
export function analyticQuestionForUi(q: AnalyticsQuestion) {
  const text = q.text || '';
  const variantsLine =
    q.type === 'text' && q.variants?.length
      ? `Варианты: ${q.variants.join(', ')}`
      : '';

  return {
    id: q.id,
    title: text,
    prompt: variantsLine || text,
  };
}

export function truncateAnalyticLabel(text: string, maxLen = 30) {
  if (!text) return '';
  return text.length <= maxLen ? text : `${text.slice(0, maxLen)}…`;
}
