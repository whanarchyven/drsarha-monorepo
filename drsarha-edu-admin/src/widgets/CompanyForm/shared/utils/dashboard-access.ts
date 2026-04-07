/** Расширенный UI дашбордов (масштабы, заливка, рост компании и т.д.) */
export function canUseAdvancedDashboardTools(role?: string): boolean {
  return role === 'admin' || role === 'moderator';
}
