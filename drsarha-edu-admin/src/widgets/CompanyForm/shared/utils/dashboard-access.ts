/** Расширенный UI дашбордов: распределения масштабов, заливка инсайтов, % дашборда, рост компании — только админ. */
export function canUseAdvancedDashboardTools(role?: string): boolean {
  return role === 'admin';
}
