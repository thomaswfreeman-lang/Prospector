"use client";
import { useState } from "react";
import { Search, Loader, AlertTriangle, CheckCircle } from "lucide-react";

export interface Prospect {
  id: string;
  title?: string;
  url?: string;
  publishedDate?: string;
  bidDueDate?: string;
  organization?: string;
  contact?: string;
  location?: string;
  catalyst?: string;
  fit?: string;
  reasoning?: string;
  type?: string;
  source?: string;
  phone?: string;
  email?: string;
}

export interface SearchResults {
  success: boolean;
  echo: string;
  q: string;
  prospects: Prospect[];
  sources: string[];
  totalAPIs: number;
  successfulAPIs: number;
  errors: string[];
}

interface Props {
  onProspectsFound?: (prospects: Prospect[], results: SearchResults) => void;
}

const UnifiedSearchButton: React.FC<Props> = ({ onProspectsFound }) => {
  const [q, setQ] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Idle");

  async function runSearch() {
    setIsLoading(true);
    setError(null);
    setStatus("Searching…");

    try {
      const url = `/api/unified-search?q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data: SearchResults = await res.json();
      setStatus(`Done: ${data.prospects?.length ?? 0} prospects from ${data.sources?.length ?? 0} sources`);
      onProspectsFound?.(data.prospects ?? [], data);
    } catch (e: any) {
      setError(e?.message || "Search failed");
      setStatus("Error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full p-4 rounded-lg border bg-white">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try: UL 94, ASTM E1354, ISO 5660, NFPA 701…"
            className="w-full rounded-md border px-3 py-2 pr-10 outline-none"
          />
          <Search className="absolute right-2 top-2.5 h-5 w-5 opacity-60 pointer-events-none" />
        </div>
        <button
          onClick={runSearch}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 border bg-black text-white disabled:opacity-60"
        >
          {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </button>
      </div>

      <div className="mt-2 text-sm">
        {error ? (
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-4 w-4" /> {error}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" /> {status}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedSearchButton;
