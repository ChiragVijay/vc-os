import { CompanyDetail } from "@/src/components/dashboard/CompanyDetail";

type Props = {
  params: Promise<{ companyId: string }>;
};

export default async function CompanyPage({ params }: Props) {
  const { companyId } = await params;
  return <CompanyDetail companyId={companyId} />;
}
