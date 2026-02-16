import PinReportsPage from './PinReportPage';

export default function PinReportsServerPage() {
  const adminId =
    process.env.ADMIN_ID || process.env.NEXT_PUBLIC_ADMIN_ID || '';
  return <PinReportsPage adminId={adminId} />;
}
