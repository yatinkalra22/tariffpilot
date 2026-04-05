"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ArrowRight, Shield, Zap, Globe2, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATS = [
  { label: "US SMB importers underserved", value: "191,000+" },
  { label: "Average penalty for misclassification", value: "$35K" },
  { label: "Manual classification time", value: "90 min" },
  { label: "TariffPilot time", value: "< 60s" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "AI HTS Classification",
    desc: "Natural language to 10-digit HTS code in seconds using GLM 5.1",
  },
  {
    icon: Shield,
    title: "Full Duty Stack",
    desc: "MFN + Section 301 + 232 + AD/CVD + MPF + HMF — all layers, zero gaps",
  },
  {
    icon: Globe2,
    title: "Country Comparison",
    desc: "See total landed cost from 8 countries side-by-side instantly",
  },
  {
    icon: TrendingDown,
    title: "FTA Savings",
    desc: "Find preferential rates from 20 US trade agreement partners",
  },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1E3A5F] via-[#1E40AF] to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-400" />
          <span className="text-xl font-bold">TariffPilot AI</span>
        </div>
        <Button
          variant="outline"
          className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
          onClick={() => router.push("/analyze")}
        >
          Try Free
        </Button>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Powered by GLM 5.1 — Z.AI&apos;s agent-first model
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Stop Overpaying on
            <span className="block text-blue-400">Import Duties</span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            AI agent that classifies any product under the correct HTS code,
            stacks every US duty layer, and finds you FTA savings — in under 60
            seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 text-lg"
              onClick={() => router.push("/analyze")}
            >
              Analyze Your Product Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-5"
            >
              <div className="text-3xl font-bold text-blue-400">{s.value}</div>
              <div className="text-sm text-slate-400 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-8 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
            >
              <f.icon className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
