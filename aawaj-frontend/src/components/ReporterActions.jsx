import LoadingSpinner from "./LoadingSpinner";

export default function ReporterActions({
  report,
  account,
  onConfirm,
  onDispute,
  isLoading,
}) {
  if (!account || !report) return null;
  if (account.toLowerCase() !== report.reporter.toLowerCase()) return null;
  if (report.status !== 3) return null;

  return (
    <div className="echo-card border-2 border-purple-300 bg-purple-50">
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        🔔 Resolution Pending — Your Input Needed
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Government has marked this report as resolved. Is the issue actually
        fixed?
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="echo-btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            "✓ Yes, it's fixed — Confirm Resolution"
          )}
        </button>
        <button
          onClick={onDispute}
          disabled={isLoading}
          className="echo-btn-danger flex-1 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            "✗ No, it's not fixed — Dispute"
          )}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        ⚠️ Disputing will escalate this report back to government for
        re-investigation.
      </p>
    </div>
  );
}
