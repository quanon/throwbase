export default function DualRangeSlider({ label, domain, rawBounds, value, disabled, onChange }) {
  const { min, max } = domain;
  const pct = (v) => ((v - min) / (max - min || 1)) * 100;

  const handleChange = (which) => (e) => {
    let next = { ...value, [which]: Number(e.target.value) };
    if (next.lo > next.hi) {
      // keep lo <= hi even when thumbs cross
      next = which === "lo" ? { lo: next.hi, hi: next.hi } : { lo: next.lo, hi: next.lo };
    }
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="label-text font-semibold">{label}</span>
        <span className="badge badge-primary badge-outline">
          {disabled ? "–" : `${value.lo.toFixed(1)} – ${value.hi.toFixed(1)}`}
        </span>
      </div>
      <div className="dual-range">
        <div className="track" />
        <div
          className="track-fill"
          style={{ left: `${pct(value.lo)}%`, right: `${100 - pct(value.hi)}%` }}
        />
        <input
          type="range"
          className="lo"
          min={min}
          max={max}
          step={0.5}
          value={value.lo}
          disabled={disabled}
          onChange={handleChange("lo")}
        />
        <input
          type="range"
          className="hi"
          min={min}
          max={max}
          step={0.5}
          value={value.hi}
          disabled={disabled}
          onChange={handleChange("hi")}
        />
      </div>
      <div className="flex justify-between text-xs opacity-50 mt-1">
        <span>{rawBounds ? rawBounds.min.toFixed(1) : ""}</span>
        <span>{rawBounds ? rawBounds.max.toFixed(1) : ""}</span>
      </div>
    </div>
  );
}
