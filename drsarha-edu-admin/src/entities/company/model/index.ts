export enum DashboardType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
  TABLE = 'table',
}

export interface Scale {
  name: string;
  value: number;
  type: 'linear' | 'multiple';
  autoscale: {
    enabled: boolean;
    min_step: number;
    max_step: number;
    extremum: number;
  };
  scaleDistribution?: number; // значение от 0 до 1
}

export interface Graphic {
  type: DashboardType;
  cols: number;
}

export interface Stat {
  name: string;
  question_id: string;
  scaleAll: number;
  scales: Scale[];
  graphics: Graphic[];
  question_summary?: {
    results: Array<{
      value: string;
      count: number;
    }>;
  };
}

export interface Dashboard {
  name: string;
  icon: string;
  stats: Stat[];
  dashboardPercent?: number; // значение от 0 до 1
}

export interface Company {
  _id: string;
  name: string;
  slug: string;
  created_at: string;
  password: string;
  updated_at: string;
  logo: string;
  description: string;
  dashboards: Dashboard[];
  isActive?: boolean;
  minGrowth?: number;
  maxGrowth?: number;
  totalGrowth?: number;
}
