import {
  DashboardType,
  Graphic,
  Company,
  StatTabMode,
  StatUnit,
} from '@/entities/company/model';

export const addGraphic = (
  company: Company,
  dashboardIndex: number,
  statIndex: number
): Company => {
  const updatedDashboards = [...company.dashboards];
  updatedDashboards[dashboardIndex].stats[statIndex].graphics.push({
    type: DashboardType.LINE,
    cols: 1,
  });
  return { ...company, dashboards: updatedDashboards };
};

export const updateGraphic = (
  company: Company,
  dashboardIndex: number,
  statIndex: number,
  graphicIndex: number,
  field: keyof Graphic,
  value: unknown
): Company => {
  const updatedDashboards = [...company.dashboards];
  const prev =
    updatedDashboards[dashboardIndex].stats[statIndex].graphics[graphicIndex];
  const next: Graphic = { ...prev };

  if (field === 'type') {
    next.type = value as DashboardType;
    if (next.type !== DashboardType.TAB) {
      delete next.stat_tab;
      delete next.stat_title;
      delete next.stat_subtitle;
      delete next.stat_unit;
      delete next.stat_variant;
    } else if (next.stat_tab === undefined) {
      next.stat_tab = StatTabMode.COUNT_ALL;
    }
    if (next.type !== DashboardType.BAR) {
      delete next.show_speciality_distribution;
      delete next.speciality_distribution_mode;
      delete next.speciality_distribution_direct;
    }
  } else if (field === 'show_speciality_distribution') {
    if (value === true) {
      next.show_speciality_distribution = true;
      if (next.speciality_distribution_mode === undefined) {
        next.speciality_distribution_mode = 'auto';
      }
    } else {
      delete next.show_speciality_distribution;
      delete next.speciality_distribution_mode;
      delete next.speciality_distribution_direct;
    }
  } else if (field === 'speciality_distribution_mode') {
    next.speciality_distribution_mode = value as Graphic['speciality_distribution_mode'];
    if (next.speciality_distribution_mode !== 'direct') {
      delete next.speciality_distribution_direct;
    }
  } else if (field === 'speciality_distribution_direct') {
    if (Array.isArray(value)) {
      next.speciality_distribution_direct = value as Graphic['speciality_distribution_direct'];
      if (next.show_speciality_distribution !== true) {
        next.show_speciality_distribution = true;
      }
      next.speciality_distribution_mode = 'direct';
    } else {
      delete next.speciality_distribution_direct;
    }
  } else if (field === 'stat_tab') {
    next.stat_tab = value as StatTabMode;
    if (next.stat_tab !== StatTabMode.VARIANT_PERCENT) {
      delete next.stat_variant;
    }
  } else if (field === 'stat_unit') {
    if (value === null) {
      next.stat_unit = null;
    } else if (value === undefined) {
      delete next.stat_unit;
    } else {
      next.stat_unit = value as StatUnit;
    }
  } else if (field === 'stat_title' || field === 'stat_subtitle') {
    const s = value == null ? '' : String(value);
    if (s === '') {
      delete next[field];
    } else {
      next[field] = s;
    }
  } else if (field === 'stat_variant') {
    if (
      value === '' ||
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      delete next.stat_variant;
    } else {
      next.stat_variant = value as string | number;
    }
  } else {
    (next as Record<string, unknown>)[field] = value;
  }

  updatedDashboards[dashboardIndex].stats[statIndex].graphics[graphicIndex] =
    next;
  return { ...company, dashboards: updatedDashboards };
};

export const removeGraphic = (
  company: Company,
  dashboardIndex: number,
  statIndex: number,
  graphicIndex: number
): Company => {
  const updatedDashboards = [...company.dashboards];
  updatedDashboards[dashboardIndex].stats[statIndex].graphics.splice(
    graphicIndex,
    1
  );
  return { ...company, dashboards: updatedDashboards };
};
