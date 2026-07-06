function StatBlock({ label, value, unit }) {
  return (
    <div className="bg-base-200 rounded-lg p-2 text-center">
      <div className="text-[10px] opacity-60">{label}</div>
      <div className="font-bold tabular-nums">
        {Number(value).toFixed(2)}
        <span className="text-xs font-normal opacity-60"> {unit}</span>
      </div>
    </div>
  );
}

export default function YoyoCard({ yoyo }) {
  return (
    <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body p-4 gap-3">
        <div>
          <h3 className="font-bold leading-tight">{yoyo.name}</h3>
          <div className="badge badge-ghost badge-sm mt-1">{yoyo.brand}</div>
          {yoyo.release_year != null && (
            <div className="badge badge-ghost badge-sm mt-1">{Number(yoyo.release_year)} 年</div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StatBlock label="直径" value={yoyo.diameter} unit="mm" />
          <StatBlock label="幅" value={yoyo.width} unit="mm" />
          <StatBlock label="重さ" value={yoyo.weight} unit="g" />
        </div>
        <div className="card-actions justify-end">
          <a
            className="btn btn-primary btn-xs btn-outline"
            href={yoyo.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            詳細を見る
          </a>
        </div>
      </div>
    </div>
  );
}
