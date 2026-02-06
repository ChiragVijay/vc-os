import { DiligenceReportLoader } from "@/src/components/diligence/DiligenceReportLoader";

type Props = {
  params: Promise<{ reportId: string }>;
};

export default async function DiligenceReportPage({ params }: Props) {
  const { reportId } = await params;
  return <DiligenceReportLoader reportId={reportId} />;
}
