import EditCompanyForm from '@/widgets/EditCompanyForm/edit-company-form';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@convex/_generated/api';
export default async function CreateCompanyAnalyticsPage({
  params,
}: {
  params: { id: string };
}) {
  const convexUrl =
    process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || '';
  const client = new ConvexHttpClient(convexUrl);
  const company = await client.query(api.functions.companies.getById, {
    id: params.id,
  });

  if (!company) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Компания не найдена</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Редактировать компанию</h1>
      <EditCompanyForm initialCompany={company} />
    </div>
  );
}
