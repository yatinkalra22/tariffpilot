"use client";

import { motion } from "motion/react";

interface DutyLayer {
  name: string;
  rate: number;
  rateText: string;
  amount: number;
  applies: boolean;
}

interface Props {
  data: {
    layers: DutyLayer[];
    totalRate: number;
    totalAmount: number;
    effectiveRateText: string;
    originCountry: string;
  };
}

export function DutyBreakdown({ data }: Props) {
  const activeLayers = data.layers.filter((l) => l.applies);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl border border-slate-200 p-6"
    >
      <h2 className="text-lg font-semibold text-slate-800 mb-1">
        Duty Stack Breakdown
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        All duty layers applied to your shipment from {data.originCountry}
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-2 text-slate-500 font-medium">
              Duty Layer
            </th>
            <th className="text-right py-2 text-slate-500 font-medium">
              Rate
            </th>
            <th className="text-right py-2 text-slate-500 font-medium">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {activeLayers.map((layer, i) => (
            <tr key={i} className="border-b border-slate-50">
              <td className="py-2.5 text-slate-700">{layer.name}</td>
              <td className="py-2.5 text-right font-mono text-slate-700">
                {layer.rateText}
              </td>
              <td className="py-2.5 text-right font-mono text-red-600 font-medium">
                $
                {layer.amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
          ))}
          <tr className="bg-slate-50">
            <td className="py-3 font-bold text-slate-800">Total</td>
            <td className="py-3 text-right font-bold font-mono text-red-600">
              {data.effectiveRateText}
            </td>
            <td className="py-3 text-right font-bold font-mono text-red-600">
              $
              {data.totalAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </td>
          </tr>
        </tbody>
      </table>
    </motion.div>
  );
}
