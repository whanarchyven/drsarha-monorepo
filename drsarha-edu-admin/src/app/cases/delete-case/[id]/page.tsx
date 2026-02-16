import DeleteCaseClientPage from './DeleteCasePage';

export default function AdminDeleteCaseServerPage() {
  const adminId =
    process.env.ADMIN_ID || process.env.NEXT_PUBLIC_ADMIN_ID || '';
  return <DeleteCaseClientPage adminId={adminId} />;
}
