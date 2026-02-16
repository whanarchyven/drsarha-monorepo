import { DashboardType, Graphic, Company } from '@/entities/company/model';

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
  value: any
): Company => {
  const updatedDashboards = [...company.dashboards];
  updatedDashboards[dashboardIndex].stats[statIndex].graphics[graphicIndex] = {
    ...updatedDashboards[dashboardIndex].stats[statIndex].graphics[
      graphicIndex
    ],
    [field]: value,
  };
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
