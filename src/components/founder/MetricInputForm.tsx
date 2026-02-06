"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import type { FounderProfile, FounderCompany, FounderMonthlyMetrics } from "@/src/lib/founder";

interface MetricInputFormProps {
  existingProfile?: FounderProfile | null;
  onSave: (profile: FounderProfile) => void;
  onCancel: () => void;
}

const SECTORS = ["SaaS", "Fintech", "Health", "Dev Tools", "Marketplace", "AI/ML"] as const;
const BATCHES = ["W25", "S25", "W26", "S26"] as const;
const STAGES = ["Pre-Seed", "Seed", "Series A"] as const;

function generateMonthOptions(): string[] {
  const months: string[] = [];
  const now = new Date(2026, 1); // Feb 2026
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`
    );
  }
  return months;
}

function emptyMetrics(month: string): FounderMonthlyMetrics {
  return {
    month,
    mrr: 0,
    burn: 0,
    runway: 0,
    customers: 0,
    churnRate: 0,
    ltv: 0,
    cac: 0,
    nps: 0,
  };
}

export const MetricInputForm = ({
  existingProfile,
  onSave,
  onCancel,
}: MetricInputFormProps) => {
  const [step, setStep] = useState<1 | 2>(existingProfile ? 2 : 1);
  const [company, setCompany] = useState<FounderCompany>(
    existingProfile?.company ?? {
      name: "",
      sector: "SaaS",
      batch: "W25",
      stage: "Seed",
      foundedDate: "2024-06-01",
      teamSize: 5,
      description: "",
    }
  );

  const monthOptions = generateMonthOptions();

  const [snapshots, setSnapshots] = useState<FounderMonthlyMetrics[]>(
    existingProfile?.snapshots ?? [
      emptyMetrics(monthOptions[2]),
      emptyMetrics(monthOptions[1]),
      emptyMetrics(monthOptions[0]),
    ]
  );

  const [errors, setErrors] = useState<string[]>([]);

  const selectClass =
    "w-full border border-vc-border bg-white px-3 py-2 text-xs font-mono tracking-tight text-vc-primary focus:outline-none focus:ring-2 focus:ring-accent/40 appearance-none";
  const inputClass =
    "w-full border border-vc-border bg-white px-3 py-2 text-xs font-mono tracking-tight text-vc-primary placeholder:text-vc-secondary focus:outline-none focus:ring-2 focus:ring-accent/40";

  // ─── Step 1: Company Info ─────────────────────────────

  const validateStep1 = () => {
    const errs: string[] = [];
    if (!company.name.trim()) errs.push("Company name is required");
    if (!company.description.trim()) errs.push("Description is required");
    setErrors(errs);
    return errs.length === 0;
  };

  // ─── Step 2: Metrics ─────────────────────────────────

  const addMonth = () => {
    if (snapshots.length >= 18) return;
    // Find the earliest month and go one before
    const sorted = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
    const earliest = sorted[0].month;
    const [y, m] = earliest.split("-").map(Number);
    const prev = m === 1 ? `${y - 1}-12` : `${y}-${(m - 1).toString().padStart(2, "0")}`;
    setSnapshots([emptyMetrics(prev), ...snapshots]);
  };

  const removeMonth = (idx: number) => {
    if (snapshots.length <= 1) return;
    setSnapshots(snapshots.filter((_, i) => i !== idx));
  };

  const updateMetric = (
    idx: number,
    field: keyof FounderMonthlyMetrics,
    value: string
  ) => {
    const updated = [...snapshots];
    const num = parseFloat(value) || 0;
    updated[idx] = { ...updated[idx], [field]: num };

    // Auto-calculate runway
    if (field === "mrr" || field === "burn") {
      const mrr = updated[idx].mrr;
      const burn = updated[idx].burn;
      if (burn > mrr) {
        const netBurn = burn - mrr * 0.3;
        updated[idx].runway =
          netBurn > 0
            ? Math.round(((mrr * 6) / netBurn) * 10) / 10
            : 36;
      } else {
        updated[idx].runway = 36;
      }
    }

    setSnapshots(updated);
  };

  const validateStep2 = () => {
    const errs: string[] = [];
    if (snapshots.length === 0) errs.push("At least one month of data required");
    const hasAnyMrr = snapshots.some((s) => s.mrr > 0);
    if (!hasAnyMrr) errs.push("At least one month needs MRR > 0");
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSave = () => {
    if (!validateStep2()) return;
    const sorted = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
    onSave({
      company,
      snapshots: sorted,
      isDemo: false,
      savedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={onCancel}
          className="text-vc-secondary hover:text-vc-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-1">
            {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
          </div>
          <h1 className="text-xl font-serif font-light">
            {step === 1 ? "Company Details" : "Monthly Metrics"}
          </h1>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-8">
        <div className={`h-0.5 flex-1 ${step >= 1 ? "bg-accent" : "bg-vc-border"}`} />
        <div className={`h-0.5 flex-1 ${step >= 2 ? "bg-accent" : "bg-vc-border"}`} />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="border border-rose-200 bg-rose-50 px-4 py-3 mb-6">
          {errors.map((e, i) => (
            <div key={i} className="text-xs text-rose-600 font-mono">
              {e}
            </div>
          ))}
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                value={company.name}
                onChange={(e) =>
                  setCompany({ ...company, name: e.target.value })
                }
                placeholder="Your Company"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-1.5">
                Sector
              </label>
              <select
                value={company.sector}
                onChange={(e) =>
                  setCompany({ ...company, sector: e.target.value as FounderCompany["sector"] })
                }
                className={selectClass}
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-1.5">
                YC Batch
              </label>
              <select
                value={company.batch}
                onChange={(e) =>
                  setCompany({ ...company, batch: e.target.value as FounderCompany["batch"] })
                }
                className={selectClass}
              >
                {BATCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-1.5">
                Stage
              </label>
              <select
                value={company.stage}
                onChange={(e) =>
                  setCompany({ ...company, stage: e.target.value as FounderCompany["stage"] })
                }
                className={selectClass}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-1.5">
                Team Size
              </label>
              <input
                type="number"
                value={company.teamSize}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    teamSize: parseInt(e.target.value) || 1,
                  })
                }
                min={1}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary mb-1.5">
              Description *
            </label>
            <textarea
              value={company.description}
              onChange={(e) =>
                setCompany({ ...company, description: e.target.value })
              }
              placeholder="What does your company do?"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-mono uppercase tracking-[0.1em] bg-vc-primary text-white hover:bg-accent transition-colors"
            >
              Next: Metrics
              <ArrowLeft className="w-3 h-3 rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-mono text-vc-secondary hover:text-vc-primary transition-colors underline underline-offset-4"
            >
              ← Back to company details
            </button>
            <button
              type="button"
              onClick={addMonth}
              disabled={snapshots.length >= 18}
              className="flex items-center gap-1.5 text-xs font-mono text-accent hover:text-vc-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-3 h-3" />
              Add earlier month
            </button>
          </div>

          {/* Metrics Table */}
          <div className="overflow-x-auto border border-vc-border">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-vc-border bg-vc-hover">
                  <th className="text-left px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] text-vc-secondary font-normal w-24">
                    Month
                  </th>
                  <th className="text-right px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] text-vc-secondary font-normal">
                    MRR ($)
                  </th>
                  <th className="text-right px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] text-vc-secondary font-normal">
                    Burn ($)
                  </th>
                  <th className="text-right px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] text-vc-secondary font-normal">
                    Runway
                  </th>
                  <th className="text-right px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] text-vc-secondary font-normal">
                    Cust.
                  </th>
                  <th className="text-right px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] text-vc-secondary font-normal">
                    Churn %
                  </th>
                  <th className="text-right px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] text-vc-secondary font-normal">
                    LTV ($)
                  </th>
                  <th className="text-right px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] text-vc-secondary font-normal">
                    CAC ($)
                  </th>
                  <th className="text-right px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] text-vc-secondary font-normal">
                    NPS
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {snapshots
                  .sort((a, b) => a.month.localeCompare(b.month))
                  .map((snap, idx) => {
                    const sortedSnaps = [...snapshots].sort((a, b) =>
                      a.month.localeCompare(b.month)
                    );
                    const realIdx = snapshots.indexOf(sortedSnaps[idx]);
                    const s = sortedSnaps[idx];
                    return (
                      <tr
                        key={s.month}
                        className="border-b border-vc-border hover:bg-vc-hover/50"
                      >
                        <td className="px-3 py-2 text-vc-secondary">
                          {s.month}
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            value={s.mrr || ""}
                            onChange={(e) =>
                              updateMetric(realIdx, "mrr", e.target.value)
                            }
                            placeholder="0"
                            className="w-full text-right bg-transparent border-0 px-2 py-1 text-xs font-mono focus:outline-none focus:bg-accent/5"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            value={s.burn || ""}
                            onChange={(e) =>
                              updateMetric(realIdx, "burn", e.target.value)
                            }
                            placeholder="0"
                            className="w-full text-right bg-transparent border-0 px-2 py-1 text-xs font-mono focus:outline-none focus:bg-accent/5"
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-vc-secondary">
                          {s.runway > 0 ? `${s.runway}mo` : "—"}
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            value={s.customers || ""}
                            onChange={(e) =>
                              updateMetric(realIdx, "customers", e.target.value)
                            }
                            placeholder="0"
                            className="w-full text-right bg-transparent border-0 px-2 py-1 text-xs font-mono focus:outline-none focus:bg-accent/5"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            value={s.churnRate || ""}
                            onChange={(e) =>
                              updateMetric(realIdx, "churnRate", e.target.value)
                            }
                            placeholder="0"
                            step="0.1"
                            className="w-full text-right bg-transparent border-0 px-2 py-1 text-xs font-mono focus:outline-none focus:bg-accent/5"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            value={s.ltv || ""}
                            onChange={(e) =>
                              updateMetric(realIdx, "ltv", e.target.value)
                            }
                            placeholder="0"
                            className="w-full text-right bg-transparent border-0 px-2 py-1 text-xs font-mono focus:outline-none focus:bg-accent/5"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            value={s.cac || ""}
                            onChange={(e) =>
                              updateMetric(realIdx, "cac", e.target.value)
                            }
                            placeholder="0"
                            className="w-full text-right bg-transparent border-0 px-2 py-1 text-xs font-mono focus:outline-none focus:bg-accent/5"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            value={s.nps || ""}
                            onChange={(e) =>
                              updateMetric(realIdx, "nps", e.target.value)
                            }
                            placeholder="0"
                            min={-100}
                            max={100}
                            className="w-full text-right bg-transparent border-0 px-2 py-1 text-xs font-mono focus:outline-none focus:bg-accent/5"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <button
                            type="button"
                            onClick={() => removeMonth(realIdx)}
                            disabled={snapshots.length <= 1}
                            className="p-1 text-vc-secondary hover:text-rose-500 transition-colors disabled:opacity-20"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Computed indicators */}
          {snapshots.length >= 2 && (
            <div className="flex gap-4 mt-4">
              {(() => {
                const sorted = [...snapshots].sort((a, b) =>
                  a.month.localeCompare(b.month)
                );
                const last = sorted[sorted.length - 1];
                const prev = sorted[sorted.length - 2];
                const growth =
                  prev.mrr > 0
                    ? (((last.mrr - prev.mrr) / prev.mrr) * 100).toFixed(1)
                    : "—";
                return (
                  <>
                    <div className="border border-vc-border px-3 py-2">
                      <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-vc-secondary">
                        Latest ARR
                      </div>
                      <div className="text-sm font-light">
                        ${(last.mrr * 12).toLocaleString()}
                      </div>
                    </div>
                    <div className="border border-vc-border px-3 py-2">
                      <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-vc-secondary">
                        MoM Growth
                      </div>
                      <div className="text-sm font-light">{growth}%</div>
                    </div>
                    <div className="border border-vc-border px-3 py-2">
                      <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-vc-secondary">
                        LTV:CAC
                      </div>
                      <div className="text-sm font-light">
                        {last.cac > 0
                          ? `${(last.ltv / last.cac).toFixed(1)}x`
                          : "—"}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          <div className="flex justify-end mt-8">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-mono uppercase tracking-[0.1em] bg-vc-primary text-white hover:bg-accent transition-colors"
            >
              <Save className="w-3 h-3" />
              Save & Compare
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
