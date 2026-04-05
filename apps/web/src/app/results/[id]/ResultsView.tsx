"use client";

import { motion } from "motion/react";
import { Shield, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DutyBreakdown } from "@/components/duty-breakdown/DutyBreakdown";
import { CountryComparison } from "@/components/country-comparison/CountryComparison";
import type { AnalysisResult } from "@/lib/types";
import Link from "next/link";

interface Props {
  analysis: AnalysisResult;
}

export function ResultsView({ analysis }: Props) {
  const classification = analysis.result?.classification;
  const duty = analysis.result?.dutyCalculation;
  const countries = analysis.result?.countryComparisons;
  const report = analysis.result?.report;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with KPIs */}
      <div className="bg-[#1E3A5F] text-white px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5" />
            <span className="font-bold text-lg">TariffPilot AI</span>
            <Link
              href="/analyze"
              className="ml-auto text-sm text-blue-300 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              New Analysis
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-1">
            {analysis.productDesc?.substring(0, 80)}
            {(analysis.productDesc?.length ?? 0) > 80 ? "..." : ""}
          </h1>

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              {
                label: "HTS Code",
                value: classification?.code || analysis.htsCode || "—",
                mono: true,
              },
              {
                label: "Total Duty Rate",
                value: duty?.effectiveRateText || `${analysis.totalDutyRate}%`,
                color: "text-red-400",
              },
              {
                label: "Duty on CIF Value",
                value: `$${(duty?.totalAmount || analysis.totalDutyAmount || 0).toLocaleString()}`,
              },
              {
                label: "Max Potential Savings",
                value: `$${(report?.totalPotentialSavings || 0).toLocaleString()}`,
                color: "text-emerald-400",
              },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/10 rounded-xl p-4"
              >
                <div className="text-xs text-blue-300 mb-1">{kpi.label}</div>
                <div
                  className={`text-2xl font-bold tabular-nums ${kpi.color || ""} ${kpi.mono ? "font-mono text-lg" : ""}`}
                >
                  {kpi.value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Classification card */}
          {classification && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <h2 className="text-lg font-semibold text-slate-800 mb-3">
                HTS Classification
              </h2>
              <div className="flex items-start gap-4">
                <span className="font-mono text-sm bg-blue-50 text-[#1E3A5F] px-3 py-1.5 rounded-lg font-bold">
                  {classification.code}
                </span>
                <div>
                  <p className="text-sm text-slate-700">
                    {classification.description}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    <span className="font-medium">Rationale:</span>{" "}
                    {classification.rationale}
                  </p>
                  {classification.griReference && (
                    <p className="text-xs text-slate-400 mt-1">
                      {classification.griReference}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Confidence:</span>
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${(classification.confidence > 1 ? classification.confidence : classification.confidence * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-600">
                      {classification.confidence > 1
                        ? classification.confidence
                        : Math.round(classification.confidence * 100)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Duty breakdown */}
          {duty && <DutyBreakdown data={duty} />}

          {/* Country comparison */}
          {countries && countries.length > 0 && (
            <CountryComparison data={countries} />
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Export buttons */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">
              Export Report
            </h3>
            <div className="space-y-2">
              <a
                href={`${apiUrl}/report/${analysis.id}/pdf`}
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4f7a] transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download PDF Report
              </a>
              <a
                href={`${apiUrl}/report/${analysis.id}/excel`}
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download Excel Report
              </a>
            </div>
          </div>

          {/* Recommendations */}
          {report?.recommendations && report.recommendations.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-3">
                Recommendations
              </h3>
              <ul className="space-y-2">
                {report.recommendations.map((rec: string, i: number) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm text-slate-600"
                  >
                    <span className="text-emerald-500 mt-0.5 shrink-0">
                      {i + 1}.
                    </span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Executive Summary */}
          {report?.executive_summary && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-3">
                Executive Summary
              </h3>
              <p className="text-sm text-slate-600">
                {report.executive_summary}
              </p>
            </div>
          )}

          {/* Compliance notes */}
          {report?.compliance_notes && report.compliance_notes.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="font-semibold text-amber-800 mb-2 text-sm">
                Compliance Notes
              </h3>
              <ul className="space-y-1">
                {report.compliance_notes.map((note: string, i: number) => (
                  <li key={i} className="text-xs text-amber-700">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* New analysis button */}
          <Link href="/analyze">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Run Another Analysis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
