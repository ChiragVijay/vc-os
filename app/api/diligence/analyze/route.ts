import { NextResponse } from "next/server";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/src/lib/supabase/client";
import { getMissingEnvKeys } from "@/src/lib/config";
import type { Database } from "@/src/lib/supabase/types";
import {
  generateDiligenceReport,
  type DiligenceProgressStage,
} from "@/src/services/diligence/generateReport";

export const runtime = "nodejs";

const requestSchema = z.object({
  companyUrl: z.string().url(),
  companyName: z.string().optional(),
  force: z.boolean().optional(),
});

type ReportProgressPayload = {
  stage: DiligenceProgressStage;
  message: string;
  updatedAt: string;
};

const buildProgressData = (stage: DiligenceProgressStage, message: string) => ({
  progress: {
    stage,
    message,
    updatedAt: new Date().toISOString(),
  } satisfies ReportProgressPayload,
});

const createOrUpdateCompany = async (
  supabase: SupabaseClient<Database>,
  name: string,
  url: string,
) => {
  const { data, error } = await supabase
    .from("companies")
    .upsert({ name, url }, { onConflict: "url" })
    .select("id, name, url")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to upsert company record.");
  }

  return data;
};

const updateReportProgress = async (
  supabase: SupabaseClient<Database>,
  reportId: string,
  stage: DiligenceProgressStage,
  message: string,
) => {
  const { error } = await supabase
    .from("diligence_reports")
    .update({
      status: "processing",
      data: buildProgressData(stage, message),
    })
    .eq("id", reportId);

  if (error) {
    throw new Error(error.message);
  }
};
const normalizeCompanyUrl = (urlString: string): string => {
  const url = new URL(urlString);
  // Remove www. prefix and trailing slash for canonical form
  const hostname = url.hostname.replace(/^www\./i, "");
  return `https://${hostname}`;
};

import { checkRateLimit } from "@/src/lib/middleware/rate-limit";

export const POST = async (request: Request) => {
  // Rate Limit Check
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = checkRateLimit(ip);

  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

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

    const body = await request.json();
    const payload = requestSchema.parse(body);
    const url = new URL(payload.companyUrl);
    const canonicalUrl = normalizeCompanyUrl(url.toString());
    const companyName = payload.companyName?.trim() || url.hostname.replace(/^www\./i, "");
    const supabase = getSupabaseClient();

    const { data: existingCompany } = await supabase
      .from("companies")
      .select("id, name")
      .eq("url", canonicalUrl)
      .maybeSingle();

    if (existingCompany && !payload.force) {
      return NextResponse.json(
        {
          error: "A report already exists for this company. Confirm to overwrite.",
        },
        { status: 409 },
      );
    }

    let company;
    try {
      company = await createOrUpdateCompany(supabase, companyName, canonicalUrl);
    } catch (companyError) {
      console.error("[Diligence] Failed to create/update company:", companyError);
      return NextResponse.json(
        { error: "Failed to process company information." },
        { status: 500 },
      );
    }

    let report: { id: string } | null = null;

    if (existingCompany && payload.force) {
      // Update existing report instead of creating new one
      const { data: existingReport } = await supabase
        .from("diligence_reports")
        .select("id")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingReport) {
        const { error: updateError } = await supabase
          .from("diligence_reports")
          .update({
            status: "pending",
            data: buildProgressData("normalize-input", "Queued for processing."),
            error: null,
            score: null,
            completed_at: null,
          })
          .eq("id", existingReport.id);

        if (!updateError) {
          report = existingReport;
        } else {
          console.error("[Diligence] Failed to update existing report:", updateError);
        }
      }
    }

    if (!report) {
      const { data: newReport, error } = await supabase
        .from("diligence_reports")
        .insert({
          company_id: company.id,
          status: "pending",
          data: buildProgressData("normalize-input", "Queued for processing."),
        })
        .select("id")
        .single();

      if (error || !newReport) {
        console.error("[Diligence] Failed to create report:", error);
        return NextResponse.json({ error: "Unable to start the report." }, { status: 500 });
      }

      report = newReport;
    }

    void (async () => {
      try {
        console.log(`[Diligence] Starting report ${report.id} for ${companyName}`);

        await updateReportProgress(
          supabase,
          report.id,
          "normalize-input",
          "Starting diligence workflow.",
        );

        const { report: reportData, sources } = await generateDiligenceReport(
          { companyUrl: url.toString(), companyName },
          async (event) => {
            console.log(`[Diligence] ${report.id} - ${event.stage}: ${event.message}`);
            await updateReportProgress(supabase, report.id, event.stage, event.message);
          },
        );

        // Score is deprecated, explicitly setting to null
        const score = null;

        // Delete existing sources for this report (in case of regeneration)
        await supabase.from("diligence_report_sources").delete().eq("report_id", report.id);

        // Insert sources into the sources table
        // Deduplicate sources by URL to avoid constraint violations
        if (sources.length > 0) {
          const seenUrls = new Set<string>();
          const deduplicatedSources = sources.filter((source) => {
            const normalizedUrl = source.url.toLowerCase();
            if (seenUrls.has(normalizedUrl)) {
              return false;
            }
            seenUrls.add(normalizedUrl);
            return true;
          });

          const sourceRows = deduplicatedSources.map((source, index) => ({
            report_id: report.id,
            source_id: source.id,
            url: source.url,
            title: source.title,
            source_type: source.type,
            snippet: source.snippet,
            score: source.score,
            ordinal: index + 1,
            referenced_in: [],
          }));

          const { error: sourcesError } = await supabase
            .from("diligence_report_sources")
            .insert(sourceRows);

          if (sourcesError) {
            console.error(`[Diligence] Failed to insert sources:`, sourcesError);
          } else {
            console.log(
              `[Diligence] Inserted ${sourceRows.length} sources for report ${report.id}`,
            );
          }
        }

        const { error: updateError } = await supabase
          .from("diligence_reports")
          .update({
            status: "completed",
            score: null,
            data: {
              report: reportData,
              progress: {
                stage: "complete",
                message: "Report completed.",
                updatedAt: new Date().toISOString(),
              },
            },
            completed_at: new Date().toISOString(),
            error: null,
            sources_used: ["tavily", "brave", "hn", "reddit", "gemini"],
          })
          .eq("id", report.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        console.log(`[Diligence] Report ${report.id} completed successfully`);
      } catch (error) {
        const rawMessage = error instanceof Error ? error.message : "Unknown error";

        let message = "Report generation failed.";

        if (rawMessage.includes("LLM API rate limit exceeded")) {
          message = "LLM API rate limit exceeded.";
        } else if (rawMessage.includes("key") || rawMessage.includes("API key")) {
          message = "Required API keys are missing or invalid.";
        }

        console.error(`[Diligence] Report ${report.id} failed:`, rawMessage);

        const { error: failureUpdateError } = await supabase
          .from("diligence_reports")
          .update({
            status: "failed",
            error: message,
            data: buildProgressData("error", message),
            completed_at: new Date().toISOString(),
          })
          .eq("id", report.id);

        if (failureUpdateError) {
          console.error(
            `[Diligence] Failed to update report ${report.id} status:`,
            failureUpdateError,
          );
        }
      }
    })();

    return NextResponse.json({ reportId: report.id }, { status: 202 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Provide a valid URL to continue." }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: message.includes("Supabase keys")
          ? "Supabase keys are missing. Add them to .env.local."
          : "Unable to start the report.",
      },
      { status: 500 },
    );
  }
};
