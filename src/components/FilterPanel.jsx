import DualRangeSlider from "./DualRangeSlider.jsx";

const FIELDS = [
  { key: "diameter", label: "直径 (mm)" },
  { key: "width", label: "幅 (mm)" },
  { key: "weight", label: "重さ (g)" },
];

const EMPTY_DOMAIN = { min: 0, max: 0 };

export default function FilterPanel({ ready, filters, sliderBounds, rawBounds, onChange, onReset, hitCount, total }) {
  return (
    <aside className="card bg-base-100 shadow-md lg:sticky lg:top-20">
      <div className="card-body gap-6">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-base">検索条件</h2>
          <button className="btn btn-ghost btn-xs" disabled={!ready} onClick={onReset}>
            リセット
          </button>
        </div>

        {FIELDS.map(({ key, label }) => (
          <DualRangeSlider
            key={key}
            label={label}
            domain={ready ? sliderBounds[key] : EMPTY_DOMAIN}
            rawBounds={ready ? rawBounds[key] : null}
            value={ready ? filters[key] : { lo: 0, hi: 0 }}
            disabled={!ready}
            onChange={(v) => onChange(key, v)}
          />
        ))}

        <div className="divider my-0" />

        <div className="stats bg-base-200">
          <div className="stat py-3">
            <div className="stat-title text-xs">該当件数</div>
            <div className="stat-value text-2xl text-primary">
              <span>{ready ? hitCount.toLocaleString() : "–"}</span>
              <span className="text-sm font-normal opacity-60"> 件</span>
            </div>
            <div className="stat-desc">
              全 <span>{ready ? total.toLocaleString() : "–"}</span> 件中
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
