import { NextResponse } from "next/server";

import { getSupabaseClient } from "@/src/lib/supabase/client";
import { getMissingEnvKeys } from "@/src/lib/config";

export const runtime = "nodejs";

export const GET = async () => {
  try {
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
      .select("id, status, created_at, completed_at, score, error, companies ( id, name, url )")
      .order("created_at", { ascending: false })
      .limit(25);

    if (error) {
      return NextResponse.json({ error: "Unable to load report history." }, { status: 500 });
    }

    const reports = (data ?? []).map((report) => ({
      id: report.id,
      status: report.status,
      score: report.score,
      createdAt: report.created_at,
      completedAt: report.completed_at,
      error: report.error,
      company: report.companies,
    }));

    return NextResponse.json({ reports }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Unable to load report history." }, { status: 500 });
  }
};
