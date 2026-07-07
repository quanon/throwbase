import { useEffect, useMemo, useRef, useState } from "react";
// Vite inlines this as a data: URI at build time (see assetsInlineLimit in
// vite.config.js), so loading it below never touches the network or local
// filesystem — that's what lets the built page run from file://.
import yoyosParquetUrl from "../../yoyos.parquet";

export const KEYS = ["diameter", "width", "weight"];
export const STEP = 0.5;
export const PAGE_SIZE = 30;

// Slider-range modes. "all" derives the bounds from the actual data extent;
// preset modes clamp the sliders to a fixed, commonly used range.
export const RANGE_MODES = [
  { value: "all", label: "全データ" },
  { value: "1a", label: "1A" },
];

// Ranges typical for 1A yo-yos, used as the slider min/max in "1a" mode.
export const RANGE_PRESETS = {
  "1a": {
    diameter: { min: 40, max: 60 },
    width: { min: 30, max: 70 },
    weight: { min: 50, max: 80 },
  },
};

export const snapMin = (v) => Math.floor(v / STEP) * STEP;
export const snapMax = (v) => Math.ceil(v / STEP) * STEP;

export function useYoyoDb() {
  const [status, setStatus] = useState({ phase: "loading" });
  const [bounds, setBounds] = useState(null);
  const [total, setTotal] = useState(0);
  const connRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const duckdb = await import(
          /* @vite-ignore */ "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/+esm"
        );
        const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles());
        const workerUrl = URL.createObjectURL(
          new Blob([`importScripts("${bundle.mainWorker}");`], { type: "text/javascript" })
        );
        const worker = new Worker(workerUrl);
        const db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING), worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        URL.revokeObjectURL(workerUrl);

        const response = await fetch(yoyosParquetUrl);
        const buffer = new Uint8Array(await response.arrayBuffer());
        await db.registerFileBuffer("yoyos.parquet", buffer);

        const conn = await db.connect();
        await conn.query(`CREATE TABLE yoyos AS SELECT * FROM 'yoyos.parquet'`);

        const stats = (
          await conn.query(`
            SELECT
              count(*)::INT AS total,
              min(diameter) AS d_min, max(diameter) AS d_max,
              min(width)    AS w_min, max(width)    AS w_max,
              min(weight)   AS g_min, max(weight)   AS g_max
            FROM
              yoyos
          `)
        ).toArray()[0];

        if (cancelled) return;
        connRef.current = conn;
        setBounds({
          diameter: { min: stats.d_min, max: stats.d_max },
          width: { min: stats.w_min, max: stats.w_max },
          weight: { min: stats.g_min, max: stats.g_max },
        });
        setTotal(stats.total);
        setStatus({ phase: "ready" });
      } catch (e) {
        console.error(e);
        if (!cancelled) setStatus({ phase: "error", message: String(e) });
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // Stable identity: reads connRef.current lazily, so callers don't need to
  // wait for "ready" before grabbing this function.
  const search = useMemo(
    () =>
      async ({ filters, sortKey, sortDir, offset }) => {
        const conn = connRef.current;
        if (!conn) return { rows: [], total: 0 };
        const where = KEYS.map((k) => `${k} BETWEEN ${filters[k].lo} AND ${filters[k].hi}`).join(" AND ");
        const dir = sortDir === "desc" ? "DESC" : "ASC";
        const order = sortKey === "name" ? `name ${dir}, id` : `${sortKey} ${dir}, name, id`;
        const [countResult, rowsResult] = await Promise.all([
          conn.query(`SELECT count(*)::INT AS n FROM yoyos WHERE ${where}`),
          conn.query(`
            SELECT name, brand, release_year, diameter, width, weight, url
            FROM yoyos
            WHERE ${where}
            ORDER BY ${order}
            LIMIT ${PAGE_SIZE} OFFSET ${offset}
          `),
        ]);
        return { rows: rowsResult.toArray(), total: countResult.toArray()[0].n };
      },
    []
  );

  return { status, bounds, total, search };
}
