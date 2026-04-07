'use client';

import { Company } from '@/entities/company/model';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { canUseAdvancedDashboardTools } from '../utils/dashboard-access';

interface CompanyInfoCardProps {
  company: Company;
  onUpdate: (updates: Partial<Company>) => void;
  role?: string;
}

export function CompanyInfoCard({
  company,
  onUpdate,
  role,
}: CompanyInfoCardProps) {
  const advanced = canUseAdvancedDashboardTools(role);

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
      <CardHeader className="border-b border-blue-200 dark:border-blue-800">
        <CardTitle className="text-blue-900 dark:text-blue-100">
          Информация о компании
        </CardTitle>
        <CardDescription>
          {company._id
            ? 'Обновите основную информацию о компании'
            : 'Введите основную информацию о компании'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название компании</Label>
            <Input
              id="name"
              value={company.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Введите название компании"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={company.slug}
              onChange={(e) => onUpdate({ slug: e.target.value })}
              placeholder="company-slug"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Пароль компании</Label>
          <Input
            id="password"
            value={company.password || ''}
            onChange={(e) => onUpdate({ password: e.target.value })}
            placeholder="Введите пароль для доступа к компании"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logo">URL логотипа</Label>
          <Input
            id="logo"
            value={company.logo}
            onChange={(e) => onUpdate({ logo: e.target.value })}
            placeholder="https://example.com/logo.png"
          />
          {company.logo && (
            <div className="mt-2 p-2 border rounded-md inline-block">
              <img
                src={company.logo || '/placeholder.svg'}
                alt={`Логотип ${company.name}`}
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '/placeholder.svg?height=48&width=48';
                }}
              />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            value={company.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Введите описание компании"
            rows={3}
          />
        </div>
        {company._id && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={company.isActive || false}
                onChange={(e) => onUpdate({ isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Активная компания</Label>
            </div>
          </div>
        )}
        {advanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minGrowth">Минимальный рост</Label>
              <Input
                id="minGrowth"
                type="number"
                value={company.minGrowth || ''}
                onChange={(e) =>
                  onUpdate({
                    minGrowth: e.target.value
                      ? Number.parseFloat(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Минимальный рост"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxGrowth">Максимальный рост</Label>
              <Input
                id="maxGrowth"
                type="number"
                value={company.maxGrowth || ''}
                onChange={(e) =>
                  onUpdate({
                    maxGrowth: e.target.value
                      ? Number.parseFloat(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Максимальный рост"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalGrowth">Общий рост</Label>
              <Input
                id="totalGrowth"
                type="number"
                value={company.totalGrowth || ''}
                onChange={(e) =>
                  onUpdate({
                    totalGrowth: e.target.value
                      ? Number.parseFloat(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Общий рост"
                step="0.1"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
