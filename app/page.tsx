import UnifiedSearchPanel from '@/components/UnifiedSearchPanel';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Prospector — Unified AI Search</h1>
          <p className="text-gray-600">Search recent prospects across news and the web, filter by domain and recency, export CSV, and copy links.</p>
        </header>
        <UnifiedSearchPanel />
      </div>
    </main>
  );
}
