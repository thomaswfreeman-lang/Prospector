export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-semibold">About</h1>
        <p>Build tag: <code>unified-patch-2025-09-23-v2</code></p>
        <p>This deployment includes: SerpAPI unified search, filters, CSV export, scoring/dedupe, safe optional Redis caching.</p>
      </div>
    </main>
  );
}
