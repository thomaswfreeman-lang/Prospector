"use client";
import { useState } from "react";
import UnifiedSearchButton, { Prospect, SearchResults } from "./UnifiedSearchButton";

export default function FireTestingAppLite() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [last, setLast] = useState<SearchResults | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Prospector (Lite)</h1>
      <UnifiedSearchButton
        onProspectsFound={(ps, results) => {
          setProspects(ps);
          setLast(results);
        }}
      />

      {last && (
        <div className="text-sm text-gray-600">
          <div>Query: <span className="font-mono">{last.q}</span></div>
          <div>APIs hit: {last.successfulAPIs} / {last.totalAPIs}</div>
        </div>
      )}

      <div className="bg-white border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Organization</th>
              <th className="p-2">Dates</th>
              <th className="p-2">Source</th>
            </tr>
          </thead>
          <tbody>
            {prospects.length === 0 ? (
              <tr>
                <td className="p-3 text-gray-500" colSpan={4}>
                  No prospects yet. Run a search above.
                </td>
              </tr>
            ) : (
              prospects.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                        {p.title || p.id}
                      </a>
                    ) : (
                      p.title || p.id
                    )}
                  </td>
                  <td className="p-2">{p.organization || "-"}</td>
                  <td className="p-2">
                    {[p.publishedDate, p.bidDueDate].filter(Boolean).join(" → ") || "-"}
                  </td>
                  <td className="p-2">{p.source || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
