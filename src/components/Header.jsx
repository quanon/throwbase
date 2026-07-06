export default function Header({ status }) {
  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-10">
      <div className="flex-1">
        <span className="text-xl font-bold px-2">🪀 Throwbase</span>
      </div>
      <div className="flex-none">
        {status.phase === "loading" && (
          <span className="text-sm opacity-60 px-2">
            <span className="loading loading-spinner loading-xs align-middle" /> 読み込み中
          </span>
        )}
        {status.phase === "error" && (
          <span className="text-sm text-error px-2">読み込み失敗</span>
        )}
      </div>
    </div>
  );
}
