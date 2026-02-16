import { Dashboard, Company } from '@/entities/company/model';

export const addDashboard = (company: Company): Company => {
  return {
    ...company,
    dashboards: [
      ...company.dashboards,
      {
        name: '',
        icon: '',
        stats: [],
        dashboardPercent: undefined,
      },
    ],
  };
};

export const updateDashboard = (
  company: Company,
  index: number,
  field: keyof Dashboard,
  value: any
): Company => {
  const updatedDashboards = [...company.dashboards];
  updatedDashboards[index] = {
    ...updatedDashboards[index],
    [field]: value,
  };
  return { ...company, dashboards: updatedDashboards };
};

export const removeDashboard = (
  company: Company,
  dashboardIndex: number
): Company => {
  const updatedDashboards = [...company.dashboards];
  updatedDashboards.splice(dashboardIndex, 1);
  return { ...company, dashboards: updatedDashboards };
};

export const moveDashboardUp = (
  company: Company,
  dashboardIndex: number
): Company => {
  if (dashboardIndex === 0) return company;

  const updatedDashboards = [...company.dashboards];
  const temp = updatedDashboards[dashboardIndex];
  updatedDashboards[dashboardIndex] = updatedDashboards[dashboardIndex - 1];
  updatedDashboards[dashboardIndex - 1] = temp;

  return { ...company, dashboards: updatedDashboards };
};

export const moveDashboardDown = (
  company: Company,
  dashboardIndex: number
): Company => {
  if (dashboardIndex === company.dashboards.length - 1) return company;

  const updatedDashboards = [...company.dashboards];
  const temp = updatedDashboards[dashboardIndex];
  updatedDashboards[dashboardIndex] = updatedDashboards[dashboardIndex + 1];
  updatedDashboards[dashboardIndex + 1] = temp;

  return { ...company, dashboards: updatedDashboards };
};
