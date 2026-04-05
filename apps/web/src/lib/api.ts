const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getAnalysis(id: string) {
  const res = await fetch(`${API_URL}/analysis/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Analysis not found");
  return res.json();
}

export function getStreamUrl() {
  return `${API_URL}/analysis/stream`;
}
