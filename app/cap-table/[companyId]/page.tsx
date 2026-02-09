import { Suspense } from "react";
import { CompanyCapTable } from "@/src/components/cap-table/CompanyCapTable";

function LoadingSkeleton() {
  return (
    <div className="px-6 py-8 max-w-7xl mx-auto animate-pulse">
      <div className="h-4 w-32 bg-vc-border/40 mb-6" />
      <div className="h-10 w-64 bg-vc-border/40 mb-8" />
      <div className="grid grid-cols-6 gap-0 border border-vc-border mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-vc-border px-3 py-3">
            <div className="h-3 w-16 bg-vc-border/40 mb-2" />
            <div className="h-6 w-24 bg-vc-border/40" />
          </div>
        ))}
      </div>
      <div className="border border-vc-border p-6 mb-8">
        <div className="h-[280px] bg-vc-border/20" />
      </div>
    </div>
  );
}

export default async function CompanyCapTablePage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CompanyCapTable companyId={companyId} />
    </Suspense>
  );
}
