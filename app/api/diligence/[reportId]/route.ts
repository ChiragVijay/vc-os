import { NextResponse } from "next/server";

import { getSupabaseClient } from "@/src/lib/supabase/client";
import { getMissingEnvKeys } from "@/src/lib/config";

export const runtime = "nodejs";

type RouteParams = {
  reportId: string;
};

export const GET = async (request: Request, { params }: { params: Promise<RouteParams> }) => {
  try {
    const { reportId } = await params;
    const missingKeys = getMissingEnvKeys([
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ]);
    if (missingKeys.length > 0) {
      return NextResponse.json(
        { error: "Supabase keys are missing. Add them to .env.local." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("diligence_reports")
      .select(
        "id, status, data, score, sources_used, created_at, completed_at, error, companies ( id, name, url )",
      )
      .eq("id", reportId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    // Fetch sources for this report
    const { data: sourcesData } = await supabase
      .from("diligence_report_sources")
      .select("source_id, url, title, source_type, snippet, score, ordinal")
      .eq("report_id", reportId)
      .order("ordinal", { ascending: true });

    const reportData =
      data.data && typeof data.data === "object" && !Array.isArray(data.data)
        ? (data.data as Record<string, unknown>)
        : {};
    const report = {
      id: data.id,
      status: data.status,
      score: data.score,
      sourcesUsed: data.sources_used ?? [],
      createdAt: data.created_at,
      completedAt: data.completed_at,
      error: data.error,
      company: data.companies,
      report: (reportData.report as Record<string, unknown> | null) ?? null,
      progress: (reportData.progress as Record<string, unknown> | null) ?? null,
      sources: (sourcesData ?? []).map((s) => ({
        id: s.source_id,
        url: s.url,
        title: s.title,
        type: s.source_type,
        snippet: s.snippet,
        score: s.score,
        ordinal: s.ordinal,
      })),
    };

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Unable to load report." }, { status: 500 });
  }
};
