import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import FilterPanel from "./components/FilterPanel.jsx";
import ResultsGrid from "./components/ResultsGrid.jsx";
import { KEYS, snapMin, snapMax, useYoyoDb } from "./hooks/useYoyoDb.js";

const SORT_OPTIONS = [
  { value: "name", label: "名前" },
  { value: "diameter", label: "直径" },
  { value: "width", label: "幅" },
  { value: "weight", label: "重さ" },
];

export default function App() {
  const { status, bounds, total, search } = useYoyoDb();

  const sliderBounds = useMemo(() => {
    if (!bounds) return null;
    const out = {};
    for (const k of KEYS) out[k] = { min: snapMin(bounds[k].min), max: snapMax(bounds[k].max) };
    return out;
  }, [bounds]);

  const fullRangeFilters = useCallback(() => {
    const out = {};
    for (const k of KEYS) out[k] = { lo: sliderBounds[k].min, hi: sliderBounds[k].max };
    return out;
  }, [sliderBounds]);

  const [filters, setFilters] = useState(null);
  // Wait for filters to be seeded too: status flips to "ready" a render
  // before the bounds-seeding effect below sets filters, and FilterPanel
  // indexes into filters[key] whenever ready is true.
  const ready = status.phase === "ready" && filters !== null;
  const [sortKey, setSortKey] = useState("name");
  const [rows, setRows] = useState([]);
  const [matchTotal, setMatchTotal] = useState(0);
  const [error, setError] = useState(null);

  // Seed filters to the full range as soon as the DB reports its bounds.
  useEffect(() => {
    if (sliderBounds && !filters) {
      setFilters(fullRangeFilters());
    }
  }, [sliderBounds, filters, fullRangeFilters]);

  const querySeq = useRef(0);
  const offsetRef = useRef(0);

  const runSearch = useCallback(
    async (append) => {
      if (!filters) return;
      const seq = ++querySeq.current;
      if (!append) offsetRef.current = 0;
      try {
        const { rows: newRows, total: newTotal } = await search({
          filters,
          sortKey,
          offset: offsetRef.current,
        });
        if (seq !== querySeq.current) return; // a newer search superseded this one
        offsetRef.current += newRows.length;
        setRows((prev) => (append ? [...prev, ...newRows] : newRows));
        setMatchTotal(newTotal);
      } catch (e) {
        setError(String(e));
      }
    },
    [filters, sortKey, search]
  );

  // Debounce slider-driven searches; the very first search (right after
  // filters are seeded) rides the same 120ms debounce, which is imperceptible.
  useEffect(() => {
    if (!filters) return;
    const timer = setTimeout(() => runSearch(false), 120);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortKey]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters(fullRangeFilters());
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Header status={status} />

      <main className="container mx-auto p-4 grid gap-4 lg:grid-cols-[320px_1fr] items-start">
        <FilterPanel
          ready={ready}
          filters={filters}
          sliderBounds={sliderBounds}
          rawBounds={bounds}
          onChange={handleFilterChange}
          onReset={handleReset}
          hitCount={matchTotal}
          total={total}
        />

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-bold px-1">検索結果</h2>
            <label className="select select-sm w-48">
              <span className="label">並び順</span>
              <select
                disabled={!ready}
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {(error || status.phase === "error") && (
            <div className="alert alert-error">
              <span>{error ?? status.message}</span>
            </div>
          )}

          {!ready && status.phase !== "error" && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 opacity-70">
              <span className="loading loading-spinner loading-lg" />
              <span>データを読み込んでいます…</span>
            </div>
          )}

          <ResultsGrid rows={rows} total={matchTotal} onMore={() => runSearch(true)} ready={ready} />
        </section>
      </main>
    </div>
  );
}
