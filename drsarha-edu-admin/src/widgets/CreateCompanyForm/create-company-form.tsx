'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
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

const initialCompany: Company = {
  _id: '',
  name: '',
  slug: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  logo: '',
  description: '',
  password: '',
  dashboards: [],
  isActive: true,
  minGrowth: undefined,
  maxGrowth: undefined,
  totalGrowth: undefined,
  analytics_date_range_fixed: false,
};

export default function DashboardForm() {
  const { role } = useAuth();
  const convexClient = getConvexHttpClient();
  const formRole =
    role === 'admin' || role === 'moderator' ? role : 'admin';

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
    fillDateStart,
    setFillDateStart,
    fillDateEnd,
    setFillDateEnd,
    isApplyingInsightFill,
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
    handleApplyInsightFill,
    handleFillDialogOpen,
    getQuestionText,
    updateQuestionTitleCache,
    prepareForSubmit,
  } = useCompanyForm(initialCompany);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    try {
      const companyToSubmit = prepareForSubmit();
      await convexClient.mutation(api.functions.companies.insert, companyToSubmit);
      toast.success('Компания успешно создана');
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error(`Ошибка при создании компании: ${error}`);
    }
  };

  if (!company) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <CompanyInfoCard
          company={company}
          onUpdate={updateCompany}
          role={formRole}
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
          role={formRole}
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
          insightFillEnabled={false}
          getQuestionText={getQuestionText}
          onQuestionTitleUpdate={updateQuestionTitleCache}
        />
      </form>

      <CardFooter className="flex justify-between mt-8">
        <Button variant="outline">Отмена</Button>
        <Button type="submit" onClick={handleSubmit}>
          Сохранить компанию
        </Button>
      </CardFooter>

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
        fillDateStart={fillDateStart}
        fillDateEnd={fillDateEnd}
        isApplying={isApplyingInsightFill}
        onOpenChange={(open) => setFillDialog({ ...fillDialog, open })}
        onValueChange={setFillValue}
        onDateStartChange={setFillDateStart}
        onDateEndChange={setFillDateEnd}
        onApply={handleApplyInsightFill}
      />
    </div>
  );
}
