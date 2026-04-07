export type AnalyticsQuestionType = 'numeric' | 'text';

export interface AnalyticsQuestion {
  id: string;
  text: string;
  type: AnalyticsQuestionType;
  variants: string[];
}

export interface AnalyticsQuestionFormData {
  text: string;
  type: AnalyticsQuestionType;
  variants: string[];
}

export interface AnalyticsQuestionSummary {
  question: {
    _id: string;
    text: string;
    type: AnalyticsQuestionType;
    variants?: string[];
  };
  results: Array<{
    value: string | number;
    count: number;
    sourceCount?: number;
  }>;
  totalInsights: number;
  range: {
    start_date?: number;
    end_date?: number;
  } | null;
}
