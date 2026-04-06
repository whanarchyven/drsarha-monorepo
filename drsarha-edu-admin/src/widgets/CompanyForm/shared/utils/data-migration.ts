import { DashboardType, Graphic, Company } from '@/entities/company/model';

export const migrateCompanyData = (initialCompany: Company): Company => {
  const migratedCompany = {
    ...initialCompany,
    dashboards: initialCompany.dashboards.map((dashboard) => ({
      ...dashboard,
      stats: dashboard.stats.map((stat: any) => {
        // Если есть graphics, используем их
        if (stat.graphics && Array.isArray(stat.graphics)) {
          return stat;
        }
        // Иначе мигрируем из старой структуры
        const graphics: Graphic[] = [];
        if (stat.type !== undefined && stat.cols !== undefined) {
          graphics.push({
            type: stat.type as DashboardType,
            cols: stat.cols,
          });
        } else {
          // Если нет ни type, ни cols, создаем дефолтный график
          graphics.push({ type: DashboardType.LINE, cols: 1 });
        }
        // Удаляем старые поля
        const { type, cols, ...restStat } = stat;

        // Убедимся, что у всех масштабов есть autoscale
        if (Array.isArray(restStat.scales)) {
          restStat.scales = restStat.scales.map((scale: any) => ({
            ...scale,
            autoscale: scale.autoscale || {
              enabled: false,
              min_step: 0,
              max_step: 0,
              extremum: 0,
            },
          }));
        }

        return {
          ...restStat,
          graphics,
        };
      }),
    })),
  };

  return migratedCompany;
};

export const prepareCompanyForSubmit = (company: Company): Company => {
  const companyToSubmit = { ...company };

  // Убедимся, что у всех статистик есть массив graphics и удалим старые поля
  companyToSubmit.dashboards.forEach((dashboard) => {
    dashboard.stats.forEach((stat: any) => {
      if (!stat.graphics || stat.graphics.length === 0) {
        stat.graphics = [{ type: DashboardType.LINE, cols: 1 }];
      }
      // Удаляем старые поля type и cols, если они есть
      if ('type' in stat) {
        delete stat.type;
      }
      if ('cols' in stat) {
        delete stat.cols;
      }
      // Убедимся, что question_summary не пустой
      if ('question_summary' in stat) {
        delete stat.question_summary;
      }

      // Обработаем поля масштабов
      if (Array.isArray(stat.scales)) {
        stat.scales.forEach((scale: any) => {
          // Округляем значение масштаба до целого числа
          if (scale.value !== undefined && scale.value !== null) {
            scale.value = Math.round(Number(scale.value));
          }
          if (
            scale.scaleDistribution !== undefined &&
            scale.scaleDistribution !== null
          ) {
            scale.scaleDistribution = Number(scale.scaleDistribution);
          }
          // Убедимся, что autoscale присутствует
          if (!scale.autoscale) {
            scale.autoscale = {
              enabled: false,
              min_step: 0,
              max_step: 0,
              extremum: 0,
            };
          }
          // Округляем значения в autoscale до целых
          if (scale.autoscale) {
            if (
              scale.autoscale.min_step !== undefined &&
              scale.autoscale.min_step !== null
            ) {
              scale.autoscale.min_step = Math.round(
                Number(scale.autoscale.min_step)
              );
            }
            if (
              scale.autoscale.max_step !== undefined &&
              scale.autoscale.max_step !== null
            ) {
              scale.autoscale.max_step = Math.round(
                Number(scale.autoscale.max_step)
              );
            }
            if (
              scale.autoscale.extremum !== undefined &&
              scale.autoscale.extremum !== null
            ) {
              scale.autoscale.extremum = Math.round(
                Number(scale.autoscale.extremum)
              );
            }
          }
        });
      }
    });

    // Убедимся, что dashboardPercent корректно обработан
    if (
      dashboard.dashboardPercent !== undefined &&
      dashboard.dashboardPercent !== null
    ) {
      dashboard.dashboardPercent = Number(dashboard.dashboardPercent);
    }
  });

  // Убедимся, что новые поля компании корректно обработаны
  if (companyToSubmit.isActive === undefined) {
    companyToSubmit.isActive = false;
  }

  if (
    companyToSubmit.minGrowth !== undefined &&
    companyToSubmit.minGrowth !== null
  ) {
    companyToSubmit.minGrowth = Number(companyToSubmit.minGrowth);
  }

  if (
    companyToSubmit.maxGrowth !== undefined &&
    companyToSubmit.maxGrowth !== null
  ) {
    companyToSubmit.maxGrowth = Number(companyToSubmit.maxGrowth);
  }

  if (
    companyToSubmit.totalGrowth !== undefined &&
    companyToSubmit.totalGrowth !== null
  ) {
    companyToSubmit.totalGrowth = Number(companyToSubmit.totalGrowth);
  }

  if ('_id' in companyToSubmit && !companyToSubmit._id) {
    delete (companyToSubmit as Partial<Company>)._id;
  }

  return companyToSubmit;
};
