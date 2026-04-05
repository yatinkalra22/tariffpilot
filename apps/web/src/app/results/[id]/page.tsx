import { getAnalysis } from "@/lib/api";
import { ResultsView } from "./ResultsView";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let analysis;
  try {
    analysis = await getAnalysis(id);
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Analysis Not Found
          </h1>
          <p className="text-slate-500">
            This analysis may have expired or the ID is invalid.
          </p>
        </div>
      </div>
    );
  }

  return <ResultsView analysis={analysis} />;
}
