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
      .select("id, status, data, error, completed_at")
      .eq("id", reportId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    const reportData =
      data.data && typeof data.data === "object" && !Array.isArray(data.data)
        ? (data.data as Record<string, unknown>)
        : {};
    const progress = (reportData.progress as Record<string, unknown> | null) ?? null;

    return NextResponse.json(
      {
        id: data.id,
        status: data.status,
        error: data.error,
        completedAt: data.completed_at,
        progress,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Unable to load status." }, { status: 500 });
  }
};
