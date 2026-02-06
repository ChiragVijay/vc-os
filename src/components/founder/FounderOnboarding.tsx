"use client";

import { useState } from "react";
import { ArrowRight, Play, PenLine } from "lucide-react";
import {
  loadFounderProfile,
  saveFounderProfile,
  demoProfile,
} from "@/src/lib/founder";
import type { FounderProfile } from "@/src/lib/founder";
import { CompanyDashboard } from "./CompanyDashboard";
import { MetricInputForm } from "./MetricInputForm";

function getInitialState(): { profile: FounderProfile | null; mode: "onboarding" | "input" | "dashboard" } {
  if (typeof window === "undefined") return { profile: null, mode: "onboarding" };
  const saved = loadFounderProfile();
  if (saved) return { profile: saved, mode: "dashboard" };
  return { profile: null, mode: "onboarding" };
}

export const FounderOnboarding = () => {
  const [initial] = useState(getInitialState);
  const [profile, setProfile] = useState<FounderProfile | null>(initial.profile);
  const [mode, setMode] = useState<"onboarding" | "input" | "dashboard">(initial.mode);

  const handleLoadDemo = () => {
    saveFounderProfile(demoProfile);
    setProfile(demoProfile);
    setMode("dashboard");
  };

  const handleSaveProfile = (p: FounderProfile) => {
    saveFounderProfile(p);
    setProfile(p);
    setMode("dashboard");
  };

  const handleReset = () => {
    setProfile(null);
    setMode("onboarding");
  };

  const handleEdit = () => {
    setMode("input");
  };

  if (mode === "input") {
    return (
      <MetricInputForm
        existingProfile={profile}
        onSave={handleSaveProfile}
        onCancel={() => {
          if (profile) setMode("dashboard");
          else setMode("onboarding");
        }}
      />
    );
  }

  if (mode === "dashboard" && profile) {
    return (
      <CompanyDashboard
        profile={profile}
        onEdit={handleEdit}
        onReset={handleReset}
      />
    );
  }

  // Onboarding view
  return (
    <div className="px-6 py-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-3">
          Phase_03: Founder Tools
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-light leading-[1.2] mb-3">
          Founder Portal
        </h1>
        <p className="max-w-lg text-xs leading-relaxed text-vc-tertiary">
          Input your company metrics, benchmark anonymously against YC batches,
          track fundraising readiness, and generate investor updates — all without
          exposing individual company data.
        </p>
      </div>

      {/* Two cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        {/* Demo Card */}
        <button
          type="button"
          onClick={handleLoadDemo}
          className="group border border-vc-border p-6 text-left hover:border-accent/50 transition-colors bg-white"
        >
          <div className="flex items-center gap-2 mb-4">
            <Play className="w-4 h-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-accent">
              Try Demo
            </span>
          </div>
          <h2 className="text-lg font-serif font-light mb-2">
            Explore with Acme AI
          </h2>
          <p className="text-xs text-vc-tertiary leading-relaxed mb-6">
            Load a fictional AI startup with 13 months of metrics. See benchmarks
            against {30} YC companies across 4 batches, growth projections,
            health scores, and investor update generation.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-mono text-accent opacity-0 group-hover:opacity-100 transition-opacity">
            Load demo data
            <ArrowRight className="w-3 h-3" />
          </div>
        </button>

        {/* Input Card */}
        <button
          type="button"
          onClick={() => setMode("input")}
          className="group border border-vc-border p-6 text-left hover:border-accent/50 transition-colors bg-white"
        >
          <div className="flex items-center gap-2 mb-4">
            <PenLine className="w-4 h-4 text-vc-secondary" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary">
              Enter Metrics
            </span>
          </div>
          <h2 className="text-lg font-serif font-light mb-2">
            Your Company
          </h2>
          <p className="text-xs text-vc-tertiary leading-relaxed mb-6">
            Input your company details and monthly metrics. Compare anonymously
            against the YC portfolio — no one sees your data, and you never see
            individual company metrics.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-mono text-accent opacity-0 group-hover:opacity-100 transition-opacity">
            Start entering metrics
            <ArrowRight className="w-3 h-3" />
          </div>
        </button>
      </div>

      {/* Features */}
      <div className="mt-16 border-t border-vc-border pt-8">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-6">
          What you get
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              title: "Anonymized Benchmarks",
              desc: "See where you rank against YC batches — percentiles, quartiles, and distributions. No company names or individual data exposed.",
            },
            {
              title: "Growth Trajectory",
              desc: "MRR projections with scenario modeling, runway countdown, and anonymized batch curve overlays.",
            },
            {
              title: "Health Scorecard",
              desc: "Composite health score with sub-metrics, fundraising readiness checklist, and prioritized action items.",
            },
            {
              title: "Investor Updates",
              desc: "One-click markdown export with key metrics, benchmarking context, and fundraising status.",
            },
          ].map((feature) => (
            <div key={feature.title}>
              <h3 className="text-sm font-medium mb-1">{feature.title}</h3>
              <p className="text-xs text-vc-tertiary leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
