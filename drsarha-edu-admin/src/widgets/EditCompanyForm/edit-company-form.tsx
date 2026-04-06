'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { useAuth } from '@/shared/hooks/useAuth';
import { Company } from '@/entities/company/model';
import { useCompanyForm } from '../CompanyForm/shared/hooks/use-company-form';
import { CompanyInfoCard } from '../CompanyForm/shared/components/CompanyInfoCard';
import { DashboardsCard } from '../CompanyForm/shared/components/DashboardsCard';
import { FillDialog } from '../CompanyForm/shared/components/FillDialog';
import { DefaultDistributionDialog } from '../CompanyForm/shared/components/DefaultDistributionDialog';
import { getConvexHttpClient } from '@/shared/lib/convex';
import { api } from '@convex/_generated/api';

export default function EditDashboardForm({
  initialCompany,
}: {
  initialCompany: Company;
}) {
  const router = useRouter();
  const companyId = initialCompany._id || 'comp123';
  const { role } = useAuth();
  const convexClient = getConvexHttpClient();
  const roleValue = role || undefined;
  const [isSaving, setIsSaving] = useState(false);

  const {
    company,
    expandedDashboards,
    setExpandedDashboards,
    expandedRealResults,
    onRealResultsExpandedChange,
    questionStats,
    loadingStats,
    questionTitleCache,
    defaultDistributionDialog,
    setDefaultDistributionDialog,
    fillDialog,
    setFillDialog,
    fillValue,
    setFillValue,
    updateCompany,
    handleAddDashboard,
    handleUpdateDashboard,
    handleRemoveDashboard,
    handleMoveDashboardUp,
    handleMoveDashboardDown,
    handleAddStat,
    handleUpdateStat,
    handleRemoveStat,
    handleMoveStatUp,
    handleMoveStatDown,
    handleQuestionSelect,
    handleAddGraphic,
    handleUpdateGraphic,
    handleRemoveGraphic,
    handleAddScale,
    handleUpdateScale,
    handleRemoveScale,
    handleAddScaleFromVariant,
    handleApplyDefaultDistribution,
    handleFillValues,
    handleFillDialogOpen,
    getQuestionText,
    updateQuestionTitleCache,
    prepareForSubmit,
  } = useCompanyForm(initialCompany);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    setIsSaving(true);

    try {
      const updatedCompany = {
        ...prepareForSubmit(),
        updated_at: new Date().toISOString(),
      };

      await convexClient.mutation(api.functions.companies.update, {
        id: companyId as any,
        data: updatedCompany,
      });
      toast.success('Компания успешно обновлена');
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error('Ошибка при обновлении компании');
    } finally {
      setIsSaving(false);
    }
  };

  if (!company) {
    return (
      <div className="container mx-auto py-16 flex flex-col items-center justify-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Компания не найдена</h2>
        <p className="text-muted-foreground mb-4">
          Запрашиваемая компания не найдена.
        </p>
        <Button onClick={() => router.push('/companies')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Вернуться к списку компаний
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/companies">Компании</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/companies/${company._id}`}>
                {company.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Редактирование</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Редактирование компании: {company.name}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <CompanyInfoCard
          company={company}
          onUpdate={updateCompany}
          role={roleValue}
        />

        <DashboardsCard
          company={company}
          expandedDashboards={expandedDashboards}
          onExpandedChange={setExpandedDashboards}
          expandedRealResults={expandedRealResults}
          onRealResultsExpandedChange={onRealResultsExpandedChange}
          questionTitleCache={questionTitleCache}
          questionStats={questionStats}
          loadingStats={loadingStats}
          role={roleValue}
          onDashboardAdd={handleAddDashboard}
          onDashboardUpdate={handleUpdateDashboard}
          onDashboardRemove={handleRemoveDashboard}
          onDashboardMoveUp={handleMoveDashboardUp}
          onDashboardMoveDown={handleMoveDashboardDown}
          onStatAdd={handleAddStat}
          onStatUpdate={handleUpdateStat}
          onStatRemove={handleRemoveStat}
          onStatMoveUp={handleMoveStatUp}
          onStatMoveDown={handleMoveStatDown}
          onQuestionSelect={handleQuestionSelect}
          onGraphicAdd={handleAddGraphic}
          onGraphicUpdate={handleUpdateGraphic}
          onGraphicRemove={handleRemoveGraphic}
          onScaleAdd={handleAddScale}
          onScaleUpdate={handleUpdateScale}
          onScaleRemove={handleRemoveScale}
          onScaleAddFromVariant={handleAddScaleFromVariant}
          onDefaultDistribution={handleApplyDefaultDistribution}
          onFillValues={handleFillDialogOpen}
          getQuestionText={getQuestionText}
          onQuestionTitleUpdate={updateQuestionTitleCache}
        />

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/companies')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Отмена
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Сохранить изменения
              </>
            )}
          </Button>
        </CardFooter>
      </form>

      <DefaultDistributionDialog
        dialog={defaultDistributionDialog}
        onOpenChange={(open) =>
          setDefaultDistributionDialog({
            ...defaultDistributionDialog,
            open,
          })
        }
        onConfirm={() =>
          handleApplyDefaultDistribution(
            defaultDistributionDialog.dashboardIndex,
            defaultDistributionDialog.statIndex
          )
        }
      />

      <FillDialog
        dialog={fillDialog}
        fillValue={fillValue}
        onOpenChange={(open) => setFillDialog({ ...fillDialog, open })}
        onValueChange={setFillValue}
        onApply={handleFillValues}
      />
    </div>
  );
}
