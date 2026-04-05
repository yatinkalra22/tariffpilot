"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  Loader2,
  Search,
  Calculator,
  Globe,
  TrendingDown,
  FileText,
} from "lucide-react";
import type { SseEvent } from "@/lib/types";

const STEPS = [
  {
    id: 1,
    icon: Search,
    label: "HTS Classification",
    desc: "Identifying 10-digit tariff code using GRI rules",
  },
  {
    id: 2,
    icon: Calculator,
    label: "Duty Calculation",
    desc: "Stacking MFN + Section 301 + 232 + AD/CVD + MPF + HMF",
  },
  {
    id: 3,
    icon: Globe,
    label: "FTA Check",
    desc: "Checking 20 US trade agreement partners",
  },
  {
    id: 4,
    icon: TrendingDown,
    label: "Country Comparison",
    desc: "Comparing landed cost from 8 source countries",
  },
  {
    id: 5,
    icon: FileText,
    label: "Report Generation",
    desc: "Building your compliance report",
  },
];

interface Props {
  events: SseEvent[];
  analysisId: string | null;
}

export function AgentProgress({ events, analysisId }: Props) {
  const completedSteps = new Set(
    events.filter((e) => e.type === "step_complete").map((e) => e.step)
  );
  const activeSteps = new Set(
    events
      .filter((e) => e.type === "step_start")
      .map((e) => e.step)
      .filter((s) => !completedSteps.has(s))
  );
  const latestMessage =
    events[events.length - 1]?.message ?? "Starting analysis...";
  const isComplete = !!analysisId;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-[#1E3A5F]">
            AI Analysis Running
          </h2>
          <p className="text-sm text-slate-500 mt-1">{latestMessage}</p>
        </div>
        {!isComplete && (
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        )}
        {isComplete && <Check className="w-6 h-6 text-emerald-500" />}
      </div>

      <div className="space-y-4">
        {STEPS.map((step, i) => {
          const isDone = completedSteps.has(step.id as 1 | 2 | 3 | 4 | 5);
          const isActive = activeSteps.has(step.id as 1 | 2 | 3 | 4 | 5);
          const isPending = !isDone && !isActive;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                isActive
                  ? "bg-blue-50 border border-blue-200"
                  : isDone
                    ? "bg-emerald-50 border border-emerald-200"
                    : "bg-slate-50 border border-transparent"
              }`}
            >
              <motion.div
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isActive
                      ? "bg-blue-500 text-white"
                      : "bg-slate-200 text-slate-400"
                }`}
              >
                {isDone ? (
                  <Check className="w-5 h-5" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-semibold text-sm ${
                      isDone
                        ? "text-emerald-700"
                        : isActive
                          ? "text-blue-700"
                          : "text-slate-400"
                    }`}
                  >
                    Step {step.id}: {step.label}
                  </span>
                  {isDone && (
                    <span className="text-xs text-emerald-600 font-medium">
                      Complete
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs mt-0.5 ${isPending ? "text-slate-400" : "text-slate-500"}`}
                >
                  {step.desc}
                </p>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 flex gap-1.5 flex-wrap"
                    >
                      {events
                        .filter(
                          (e) => e.step === step.id && e.type === "tool_call"
                        )
                        .map((e, j) => (
                          <span
                            key={j}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                          >
                            {e.message}
                          </span>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center"
        >
          <p className="text-emerald-700 font-semibold">
            Analysis complete! Redirecting to your results...
          </p>
        </motion.div>
      )}
    </div>
  );
}
