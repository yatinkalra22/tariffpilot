"use client";

import { motion } from "motion/react";

interface CountryData {
  country: string;
  countryName: string;
  flag: string;
  totalRate: number;
  totalAmount: number;
  ftaApplies: boolean;
  ftaName?: string;
  savingsVsChina: number;
  savingsPercent: number;
}

interface Props {
  data: CountryData[];
}

export function CountryComparison({ data }: Props) {
  const sorted = [...data].sort((a, b) => a.totalRate - b.totalRate);
  const maxRate = Math.max(...sorted.map((c) => c.totalRate));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl border border-slate-200 p-6"
    >
      <h2 className="text-lg font-semibold text-slate-800 mb-1">
        Source Country Comparison
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Total duty rate for the same product from different countries
      </p>

      <div className="space-y-3">
        {sorted.map((c, i) => (
          <div key={c.country} className="flex items-center gap-3">
            <div className="w-28 text-sm shrink-0">
              <span className="mr-1">{c.flag}</span>
              <span className="text-slate-700">{c.countryName}</span>
            </div>
            <div className="flex-1">
              <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${maxRate > 0 ? (c.totalRate / maxRate) * 100 : 0}%`,
                  }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                  className={`h-full rounded-full ${
                    c.ftaApplies
                      ? "bg-emerald-500"
                      : c.country === "CN"
                        ? "bg-red-500"
                        : "bg-blue-500"
                  }`}
                />
              </div>
            </div>
            <div className="w-16 text-right text-sm font-mono font-medium text-slate-700">
              {(c.totalRate * 100).toFixed(1)}%
            </div>
            <div className="w-20 text-right">
              {c.savingsVsChina > 0 ? (
                <span className="text-xs text-emerald-600 font-medium">
                  -${c.savingsVsChina.toLocaleString()}
                </span>
              ) : (
                <span className="text-xs text-slate-400">baseline</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {sorted[0]?.savingsVsChina > 0 && (
        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-semibold text-emerald-800">
              Best alternative: {sorted[0].flag} {sorted[0].countryName}
            </p>
            <p className="text-sm text-emerald-600">
              {sorted[0].ftaName
                ? `FTA rate via ${sorted[0].ftaName}`
                : `${(sorted[0].totalRate * 100).toFixed(1)}% effective rate`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-700">
              ${sorted[0].savingsVsChina.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-600">potential savings</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
