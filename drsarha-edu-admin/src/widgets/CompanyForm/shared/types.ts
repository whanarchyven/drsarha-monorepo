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
  type: 'stat' | 'dashboard' | 'all';
  dashboardIndex?: number;
  statIndex?: number;
}

export interface DefaultDistributionDialogState {
  open: boolean;
  dashboardIndex: number;
  statIndex: number;
}

export interface QuestionStats {
  [questionId: string]: { value: string; count: number }[];
}

export interface LoadingStats {
  [questionId: string]: boolean;
}

export interface ExpandedRealResults {
  [key: string]: boolean; // key format: "dashboard-${dashboardIndex}-stat-${statIndex}"
}
