import {
  DashboardType,
  Scale,
  Graphic,
  Stat,
  Dashboard,
  Company,
} from '@/entities/company/model';

export type { Scale, Graphic, Stat, Dashboard, Company };
export { DashboardType };

export interface FillDialogState {
  open: boolean;
  type: 'stat' | 'dashboard' | 'all' | 'variant';
  dashboardIndex?: number;
  statIndex?: number;
  /** Текст ответа для заливки одного варианта */
  variantResponse?: string;
}

export interface DefaultDistributionDialogState {
  open: boolean;
  dashboardIndex: number;
  statIndex: number;
}

export interface QuestionStats {
  [questionId: string]: {
    value: string | number;
    count: number;
    speciality_distribution?: Array<{ specialty: string; percent: number }>;
  }[];
}

export interface LoadingStats {
  [questionId: string]: boolean;
}

export interface ExpandedRealResults {
  [key: string]: boolean; // key format: "dashboard-${dashboardIndex}-stat-${statIndex}"
}
