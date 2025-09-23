"use client";
import { useState } from "react";
import { Search, Loader, Download, Copy, Globe2, Newspaper, Clock, ExternalLink } from "lucide-react";

export interface Prospect {
  id: string; title?: string; url?: string; publishedDate?: string; bidDueDate?: string;
  organization?: string; contact?: string; location?: string; catalyst?: string; fit?: string;
  reasoning?: string; type?: string; source?: string; host?: string;
}
export interface SearchResults {
  success: boolean; echo: string; q: string; prospects: Prospect[]; sources: string[];
  totalAPIs: number; successfulAPIs: number; errors: string[]; cached?: boolean; version?: string;
}

export default function UnifiedSearchPanel() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<"" | "web" | "news">("");
  const [recency, setRecency] = useState<"" | "1d" | "7d" | "30d">("30d");
  const [site, setSite] = useState<"" | "edu" | "gov" | "com" | "org">("");
  const [preset, setPreset] = useState<"" | "universities" | "gov" | "aerospace" | "construction">("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runSearch() {
    setIsLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ q });
      if (type) params.set("type", type);
      if (recency) params.set("recency", recency);
      if (site) params.set("site", site);
      if (preset) params.set("preset", preset);
      const res = await fetch(`/api/unified-search?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SearchResults = await res.json();
      setResults(data);
    } catch (e: any) { setError(e?.message || "Search failed"); }
    finally { setIsLoading(false); }
  }

  function exportCsv() {
    const params = new URLSearchParams({ q });
    if (type) params.set("type", type);
    if (recency) params.set("recency", recency);
    if (site) params.set("site", site);
    if (preset) params.set("preset", preset);
    window.open(`/api/unified-search.csv?${params.toString()}`, "_blank");
  }
  function copyMarkdown() {
    const items = results?.prospects ?? [];
    const lines = items.slice(0, 50).map(p => `- [${p.title}](${p.url}) — ${p.organization ?? ""} (${p.publishedDate ?? ""})`);
    navigator.clipboard.writeText(lines.join("\n"));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="UL 94, ASTM E1354, ISO 5660, NFPA 701 …" className="w-full rounded-md border px-3 py-2 outline-none"/>
      <div className="flex gap-2">
        <select value={type} onChange={e=>setType(e.target.value as any)} className="flex-1 rounded-md border px-2 py-2">
          <option value="">All</option><option value="web">Web</option><option value="news">News</option>
        </select>
        <select value={recency} onChange={e=>setRecency(e.target.value as any)} className="flex-1 rounded-md border px-2 py-2">
          <option value="">Any time</option><option value="1d">1 day</option><option value="7d">7 days</option><option value="30d">30 days</option>
        </select>
      </div>
      <div className="flex gap-2">
        <select value={site} onChange={e=>setSite(e.target.value as any)} className="flex-1 rounded-md border px-2 py-2">
          <option value="">Any domain</option><option value="edu">.edu</option><option value="gov">.gov</option><option value="org">.org</option><option value="com">.com</option>
        </select>
        <select value={preset} onChange={e=>setPreset(e.target.value as any)} className="flex-1 rounded-md border px-2 py-2">
          <option value="">No preset</option><option value="universities">Universities</option><option value="gov">Gov/RFP</option><option value="aerospace">Aerospace</option><option value="construction">Construction</option>
        </select>
      </div>
      </div>

      <div className="flex gap-2">
        <button onClick={runSearch} disabled={isLoading} className="inline-flex items-center gap-2 rounded-md px-4 py-2 border bg-black text-white disabled:opacity-60">
          {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search
        </button>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-md px-4 py-2 border"><Download className="h-4 w-4" /> Export CSV</button>
        <button onClick={copyMarkdown} className="inline-flex items-center gap-2 rounded-md px-4 py-2 border"><Copy className="h-4 w-4" /> Copy Links</button>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {results && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            <span className="mr-4">Query: <span className="font-mono">{results.q}</span></span>
            <span className="mr-4">Sources: {results.sources.join(", ") || "-"}</span>
            <span className="mr-4">{results.cached ? "cached" : "live"}</span>
            <span className="mr-4">{results.version}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {(results.prospects ?? []).map(p => (
              <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="block border rounded-lg p-3 hover:shadow-sm bg-white">
                <div className="text-base font-medium line-clamp-2">{p.title || p.url}</div>
                <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  {p.type === "news" ? <Newspaper className="h-4 w-4" /> : <Globe2 className="h-4 w-4" />}
                  <span>{p.organization || p.host || ""}</span>
                  {p.publishedDate && <><Clock className="h-4 w-4 opacity-60" /><span>{p.publishedDate}</span></>}
                </div>
                <div className="text-xs text-gray-500 mt-2 line-clamp-2">{p.catalyst}</div>
                <div className="text-xs text-gray-400 mt-2">{p.host}</div>
                <div className="text-xs text-blue-700 mt-2 inline-flex items-center gap-1">Open <ExternalLink className="h-3 w-3" /></div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
