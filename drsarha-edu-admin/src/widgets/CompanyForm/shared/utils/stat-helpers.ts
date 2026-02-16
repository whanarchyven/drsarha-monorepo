import { DashboardType, Stat, Company } from '@/entities/company/model';

export const addStat = (company: Company, dashboardIndex: number): Company => {
  const updatedDashboards = [...company.dashboards];
  updatedDashboards[dashboardIndex].stats.push({
    name: '',
    question_id: '',
    scaleAll: 1,
    scales: [],
    graphics: [{ type: DashboardType.LINE, cols: 1 }],
    question_summary: undefined,
  });
  return { ...company, dashboards: updatedDashboards };
};

export const updateStat = (
  company: Company,
  dashboardIndex: number,
  statIndex: number,
  field: keyof Stat,
  value: any
): Company => {
  const updatedDashboards = [...company.dashboards];
  updatedDashboards[dashboardIndex].stats[statIndex] = {
    ...updatedDashboards[dashboardIndex].stats[statIndex],
    [field]: value,
  };
  return { ...company, dashboards: updatedDashboards };
};

export const removeStat = (
  company: Company,
  dashboardIndex: number,
  statIndex: number
): Company => {
  const updatedDashboards = [...company.dashboards];
  updatedDashboards[dashboardIndex].stats.splice(statIndex, 1);
  return { ...company, dashboards: updatedDashboards };
};

export const moveStatUp = (
  company: Company,
  dashboardIndex: number,
  statIndex: number
): Company => {
  if (statIndex === 0) return company;

  const updatedDashboards = [...company.dashboards];
  const stats = [...updatedDashboards[dashboardIndex].stats];
  const temp = stats[statIndex];
  stats[statIndex] = stats[statIndex - 1];
  stats[statIndex - 1] = temp;

  updatedDashboards[dashboardIndex].stats = stats;
  return { ...company, dashboards: updatedDashboards };
};

export const moveStatDown = (
  company: Company,
  dashboardIndex: number,
  statIndex: number
): Company => {
  const dashboard = company.dashboards[dashboardIndex];
  if (statIndex === dashboard.stats.length - 1) return company;

  const updatedDashboards = [...company.dashboards];
  const stats = [...updatedDashboards[dashboardIndex].stats];
  const temp = stats[statIndex];
  stats[statIndex] = stats[statIndex + 1];
  stats[statIndex + 1] = temp;

  updatedDashboards[dashboardIndex].stats = stats;
  return { ...company, dashboards: updatedDashboards };
};

export const selectQuestion = (
  company: Company,
  dashboardIndex: number,
  statIndex: number,
  questionId: string
): Company => {
  const updatedDashboards = [...company.dashboards];
  updatedDashboards[dashboardIndex].stats[statIndex].question_id = questionId;
  return { ...company, dashboards: updatedDashboards };
};
