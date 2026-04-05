"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Shield, Clock, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSessionId } from "@/lib/session";
import Link from "next/link";

interface HistoryItem {
  id: string;
  productDesc: string;
  htsCode: string | null;
  totalDutyRate: number | null;
  totalDutyAmount: number | null;
  createdAt: string;
  status: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const sessionId = getSessionId();
    fetch(`${API_URL}/analysis/history/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) =>
    item.productDesc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#1E3A5F] text-white px-8 py-4 flex items-center gap-3">
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

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">
              Analysis History
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {items.length} past {items.length === 1 ? "analysis" : "analyses"}
            </p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">
              {items.length === 0
                ? "No analyses yet. Run your first one!"
                : "No results match your search."}
            </p>
            <Button onClick={() => router.push("/analyze")}>
              Analyze a Product
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push(`/results/${item.id}`)}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {item.productDesc}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      {item.htsCode && (
                        <span className="font-mono text-xs bg-blue-50 text-[#1E3A5F] px-2 py-0.5 rounded">
                          {item.htsCode}
                        </span>
                      )}
                      {item.totalDutyRate != null && (
                        <span className="text-red-600 font-medium">
                          {Number(item.totalDutyRate).toFixed(1)}% duty
                        </span>
                      )}
                      {item.totalDutyAmount != null && (
                        <span className="text-slate-500">
                          ${Number(item.totalDutyAmount).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        item.status === "COMPLETE"
                          ? "bg-emerald-50 text-emerald-700"
                          : item.status === "FAILED"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {item.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
