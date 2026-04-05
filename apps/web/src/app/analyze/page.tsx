"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Globe, DollarSign, Package, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AgentProgress } from "@/components/agent-progress/AgentProgress";
import Link from "next/link";
import { getStreamUrl } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import type { SseEvent } from "@/lib/types";

const COUNTRIES = [
  { code: "CN", name: "China (most common)" },
  { code: "VN", name: "Vietnam" },
  { code: "IN", name: "India" },
  { code: "MX", name: "Mexico" },
  { code: "TW", name: "Taiwan" },
  { code: "KR", name: "South Korea" },
  { code: "TH", name: "Thailand" },
  { code: "ID", name: "Indonesia" },
  { code: "DE", name: "Germany" },
  { code: "JP", name: "Japan" },
];

const EXAMPLES = [
  "Wireless Bluetooth earbuds with active noise cancellation and a charging case",
  "Stainless steel kitchen knife set with wooden handles",
  "Children's electric ride-on toy car with remote control",
  "Solar panels for residential installation, 400W monocrystalline",
];

export default function AnalyzePage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("CN");
  const [cifValue, setCifValue] = useState("10000");
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<SseEvent[]>([]);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  async function handleSubmit() {
    if (!description.trim()) return;
    setIsRunning(true);
    setEvents([]);
    setAnalysisId(null);

    try {
      const res = await fetch(getStreamUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          originCountry: country,
          cifValue: parseFloat(cifValue),
          sessionId: getSessionId(),
        }),
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event: SseEvent = JSON.parse(line.slice(6));
            setEvents((prev) => [...prev, event]);

            if (event.type === "analysis_complete" && event.analysisId) {
              setAnalysisId(event.analysisId);
              setTimeout(
                () => router.push(`/results/${event.analysisId}`),
                1500
              );
            }
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err) {
      setEvents((prev) => [
        ...prev,
        {
          type: "error",
          step: 1,
          stepName: "Error",
          message: `Connection failed: ${err}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#1E3A5F] text-white px-8 py-4 flex items-center gap-3">
        <Shield className="w-5 h-5" />
        <span className="font-bold text-lg">TariffPilot AI</span>
        <Link
          href="/history"
          className="ml-auto text-sm text-blue-300 hover:text-white flex items-center gap-1"
        >
          <Clock className="w-4 h-4" />
          History
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!isRunning ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">
                Analyze Your Product
              </h1>
              <p className="text-slate-500 mb-8">
                Describe what you&apos;re importing and we&apos;ll classify it,
                calculate all US duties, and find savings opportunities.
              </p>

              {/* Product description */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Package className="inline w-4 h-4 mr-1" />
                  Product Description
                </label>
                <Textarea
                  placeholder="Describe your product in plain English — the more detail, the better the classification..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px] text-base"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {EXAMPLES.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setDescription(ex)}
                      className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-100 transition-colors"
                    >
                      Try: {ex.substring(0, 40)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Country + CIF row */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Globe className="inline w-4 h-4 mr-1" />
                    Country of Origin
                  </label>
                  <Select value={country} onValueChange={(v) => v && setCountry(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <DollarSign className="inline w-4 h-4 mr-1" />
                    CIF Value (USD)
                  </label>
                  <Input
                    type="number"
                    value={cifValue}
                    onChange={(e) => setCifValue(e.target.value)}
                    placeholder="10000"
                    min="1"
                  />
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-[#1E3A5F] hover:bg-[#2a4f7a] text-white py-4 text-base"
                onClick={handleSubmit}
                disabled={!description.trim()}
              >
                <Shield className="mr-2 w-5 h-5" />
                Analyze Import Duties
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AgentProgress events={events} analysisId={analysisId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
