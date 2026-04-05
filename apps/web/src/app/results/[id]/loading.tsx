export default function ResultsLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#1E3A5F] text-white px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-5 bg-white/20 rounded animate-pulse" />
            <div className="w-32 h-5 bg-white/20 rounded animate-pulse" />
          </div>
          <div className="w-96 h-8 bg-white/10 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/10 rounded-xl p-4">
                <div className="w-20 h-3 bg-white/10 rounded animate-pulse mb-2" />
                <div className="w-28 h-7 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-6 h-48 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
