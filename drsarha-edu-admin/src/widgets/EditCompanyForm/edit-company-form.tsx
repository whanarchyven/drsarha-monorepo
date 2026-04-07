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

const SAVE_LOG = '[CompanySave]';

function logConvexError(error: unknown) {
  console.error(`${SAVE_LOG} raw error:`, error);
  if (error && typeof error === 'object') {
    const anyErr = error as Record<string, unknown>;
    if ('message' in anyErr) {
      console.error(`${SAVE_LOG} message:`, anyErr.message);
    }
    if ('data' in anyErr) {
      console.error(`${SAVE_LOG} Convex error data:`, anyErr.data);
    }
    if ('cause' in anyErr && anyErr.cause) {
      console.error(`${SAVE_LOG} cause:`, anyErr.cause);
    }
  }
}

export default function EditDashboardForm({
  initialCompany,
}: {
  initialCompany: Company;
}) {
  const router = useRouter();
  const { role, userId } = useAuth();
  const convexClient = getConvexHttpClient();
  const formRole = role ?? undefined;
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
  } = useCompanyForm(initialCompany, {
    fillActorAdminId: role === 'admin' ? userId : null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) {
      console.warn(`${SAVE_LOG} submit aborted: company is null`);
      return;
    }

    setIsSaving(true);

    try {
      console.groupCollapsed(`${SAVE_LOG} submit start`);
      console.log(`${SAVE_LOG} state.company._id`, company._id);
      console.log(`${SAVE_LOG} initialCompany._id`, initialCompany._id);
      console.log(`${SAVE_LOG} dashboards in state`, company.dashboards?.length ?? 0);
      const statsInState = company.dashboards?.reduce(
        (n, d) => n + (d.stats?.length ?? 0),
        0
      );
      console.log(`${SAVE_LOG} stats in state (total)`, statsInState ?? 0);

      let prepared;
      try {
        prepared = prepareForSubmit();
      } catch (prepErr) {
        console.error(`${SAVE_LOG} prepareForSubmit threw:`, prepErr);
        logConvexError(prepErr);
        toast.error('Ошибка подготовки данных (см. консоль)');
        return;
      }

      const convexCompanyId = prepared._id || initialCompany._id;
      console.log(`${SAVE_LOG} convexCompanyId`, convexCompanyId, typeof convexCompanyId);

      if (!convexCompanyId) {
        console.error(`${SAVE_LOG} missing company id after prepare`);
        toast.error('Не удалось определить ID компании');
        return;
      }

      const { _id: _omitId, _creationTime, ...patchData } = prepared as any;
      const payload = {
        ...patchData,
        updated_at: new Date().toISOString(),
      };

      const dashCount = payload.dashboards?.length ?? 'no dashboards key';
      console.log(`${SAVE_LOG} patch top-level keys`, Object.keys(payload));
      console.log(`${SAVE_LOG} payload.dashboards length`, dashCount);

      let jsonProbe: string | null = null;
      try {
        jsonProbe = JSON.stringify(payload);
        console.log(
          `${SAVE_LOG} JSON payload length (chars)`,
          jsonProbe.length
        );
      } catch (serErr) {
        console.error(`${SAVE_LOG} JSON.stringify(payload) failed`, serErr);
      }

      console.log(`${SAVE_LOG} calling companies.update…`);
      console.groupEnd();

      const result = await convexClient.mutation(
        api.functions.companies.update,
        {
          id: convexCompanyId as any,
          data: payload,
        }
      );

      console.log(`${SAVE_LOG} mutation OK, returned _id`, (result as any)?._id);
      toast.success('Компания успешно обновлена');
    } catch (error) {
      logConvexError(error);
      toast.error('Ошибка при обновлении компании (детали в консоли)');
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
          insightFillEnabled={Boolean(company._id?.trim())}
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
