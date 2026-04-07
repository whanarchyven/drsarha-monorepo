export enum DashboardType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
  TABLE = 'table',
  TAB = 'tab',
}

/** Режим отображения для графика типа «вкладка» (tab). */
export enum StatTabMode {
  COUNT_ALL = 'count_all',
  COUNT_VARIANTS = 'count_variants',
  TOP_VARIANT = 'top_variant',
  AVERAGE = 'average',
  VARIANT_PERCENT = 'variant_percent',
}

/** Единица отображения значения на вкладке (tab). */
export enum StatUnit {
  COUNT = 'count',
  PERCENT = 'percent',
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
  stat_tab?: StatTabMode;
  stat_title?: string;
  stat_subtitle?: string;
  /** null — явно «без единицы»; undefined — поле не задано */
  stat_unit?: StatUnit | null;
  /** Учитывается при stat_tab === variant_percent */
  stat_variant?: string | number;
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
      sourceCount?: number;
    }>;
    totalInsights?: number;
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
