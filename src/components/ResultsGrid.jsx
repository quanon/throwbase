import YoyoCard from "./YoyoCard.jsx";

export default function ResultsGrid({ rows, total, onMore, ready }) {
  if (!ready) return null;

  const hasMore = rows.length < total;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((y, i) => (
          <YoyoCard key={`${y.name}-${y.brand}-${i}`} yoyo={y} />
        ))}
      </div>

      {total === 0 && (
        <div className="alert">
          <span>条件に一致するヨーヨーがありません。スライダーの範囲を広げてみてください。</span>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button className="btn btn-outline btn-wide" onClick={onMore}>
            さらに表示 (残り {(total - rows.length).toLocaleString()} 件)
          </button>
        </div>
      )}
    </>
  );
}
