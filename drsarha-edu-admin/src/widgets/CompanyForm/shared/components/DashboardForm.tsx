'use client';

import { Dashboard } from '@/entities/company/model';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DashboardFormProps {
  dashboard: Dashboard;
  dashboardIndex: number;
  role?: string;
  onUpdate: (field: keyof Dashboard, value: any) => void;
}

export function DashboardForm({
  dashboard,
  dashboardIndex,
  role,
  onUpdate,
}: DashboardFormProps) {
  return (
    <div className="space-y-4 p-4 bg-purple-50/30 dark:bg-purple-950/10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="space-y-2">
          <Label htmlFor={`dashboard-name-${dashboardIndex}`}>
            Название дашборда
          </Label>
          <Input
            id={`dashboard-name-${dashboardIndex}`}
            value={dashboard.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="Введите название дашборда"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`dashboard-icon-${dashboardIndex}`}>Иконка</Label>
          <Input
            id={`dashboard-icon-${dashboardIndex}`}
            value={dashboard.icon}
            onChange={(e) => onUpdate('icon', e.target.value)}
            placeholder="Название иконки или URL"
          />
        </div>
      </div>
      {role === 'admin' && (
        <div className="space-y-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-800">
          <Label htmlFor={`dashboard-percent-${dashboardIndex}`}>
            Процент дашборда (от 0 до 100%)
          </Label>
          <Input
            id={`dashboard-percent-${dashboardIndex}`}
            type="number"
            value={
              dashboard.dashboardPercent !== undefined
                ? (dashboard.dashboardPercent * 100).toFixed(2)
                : ''
            }
            onChange={(e) =>
              onUpdate(
                'dashboardPercent',
                e.target.value
                  ? Number.parseFloat(e.target.value) / 100
                  : undefined
              )
            }
            placeholder="Процент дашборда (%)"
            min="0"
            max="100"
            step="0.01"
          />
        </div>
      )}
    </div>
  );
}
