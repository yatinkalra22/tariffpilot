import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#1E3A5F] mb-4">404</h1>
        <p className="text-lg text-slate-500 mb-6">Page not found</p>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4f7a] transition-colors font-medium"
        >
          Go to Analyzer
        </Link>
      </div>
    </div>
  );
}
