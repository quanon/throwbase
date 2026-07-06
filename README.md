# ThrowBase

A static web app that searches yo-yo data from `yoyo.db` (SQLite).

## File Structure

- `src/`: Application source (React components + DuckDB-Wasm hooks)
- `index.html`: Vite entry HTML
- `yoyos.parquet`: The `yoyos` table from `yoyo.db` converted to Parquet. Embedded as base64 into `dist/index.html` at build time
- `yoyo.db`: Original data (SQLite). Not referenced directly by the app

## Setup

```sh
git clone git@github.com:quanon/throwbase.git
cd throwbase
pnpm install
```

## Development

```sh
pnpm dev
```

Open `http://localhost:5173/`. It runs through the dev server, so it will not work via `file://`.

## Build (single HTML for distribution)

```sh
pnpm build
```

This generates a single file at `dist/index.html` with all JS, CSS, and the `yoyos.parquet` data embedded.
It runs **just by opening `dist/index.html` directly in a browser** with no HTTP server (fully self-contained over `file://`).

The DuckDB-Wasm runtime is loaded from the jsDelivr CDN over HTTPS, so a network connection is required on first load.

## Updating the Data

After updating `yoyo.db`, regenerate `yoyos.parquet` with the following and rebuild with `pnpm build`.

```sh
duckdb -c "
LOAD sqlite_scanner;
ATTACH 'yoyo.db' AS yoyo (TYPE sqlite);
COPY (
  SELECT min(id) AS id, name, brand, release_year, diameter, width, weight, url
  FROM yoyo.yoyos
  GROUP BY name, brand, release_year, diameter, width, weight, url
  ORDER BY id
) TO 'yoyos.parquet' (FORMAT parquet, COMPRESSION zstd);
"
```

## How It Works

1. Opening `dist/index.html` starts the React app, which loads DuckDB-Wasm (`@duckdb/duckdb-wasm`) from jsDelivr and instantiates it on a Web Worker
2. The base64-embedded `yoyos.parquet` (built at build time) is retrieved via `fetch(dataUri)` — using neither the network nor local file access - and a `yoyos` table is created in memory
3. Slider ranges are set dynamically from the table's min/max
4. On every slider change, a `WHERE diameter BETWEEN ... AND ...` SQL query runs, and results are displayed 30 rows at a time with paging
