import { useState } from "react";
import useContract from "../hooks/useContract";
import StatusBadge from "../components/StatusBadge";
import EscalationTimeline from "../components/EscalationTimeline";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  AUTHORIZED_GOV_WALLETS,
  ESCALATION_LEVELS,
  CATEGORY_ICONS,
} from "../constants";
import { getIPFSUrl } from "../utils/pinata";

export default function GovDashboardPage({ account, onConnect }) {
  const {
    fetchReport,
    updateReportStatus,
    escalateReport,
    markPendingConfirmation,
    isLoading,
    error,
  } = useContract();

  const [inputId, setInputId] = useState("");
  const [report, setReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [notFound, setNotFound] = useState(false);

  const isAuthorized =
    account && AUTHORIZED_GOV_WALLETS.includes(account.toLowerCase());

  async function handleLookup(e) {
    e.preventDefault();
    setSuccessMsg("");
    setNotFound(false);
    setReport(null);
    const id = parseInt(inputId, 10);
    if (isNaN(id) || id <= 0) return;
    const result = await fetchReport(id);
    if (result) {
      setReport(result);
    } else {
      setNotFound(true);
    }
  }

  async function doAction(actionFn, ...args) {
    setActionLoading(true);
    setSuccessMsg("");
    try {
      const txHash = await actionFn(...args);
      if (txHash) {
        setSuccessMsg(`Transaction confirmed! Hash: ${txHash}`);
        const updated = await fetchReport(report.id);
        if (updated) setReport(updated);
      }
    } catch {
      /* error from hook */
    }
    setActionLoading(false);
  }

  // ─── UNAUTHORIZED SCREEN ─────────────────────────────────────
  if (!isAuthorized) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-[#0a0e1a]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            Unauthorized Access
          </h2>
          <p className="text-gray-400 mb-4">
            This dashboard is restricted to verified government bodies.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Connected wallet:{" "}
            <span className="font-mono text-gray-300">
              {account || "Not connected"}
            </span>
          </p>
          <p className="text-xs text-gray-600 mb-6">
            If you are a government official, contact the Echo administrator.
          </p>
          {!account && (
            <button
              onClick={onConnect}
              className="echo-btn-primary px-6 py-3 rounded-xl font-semibold"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── AUTHORIZED DASHBOARD ────────────────────────────────────
  const nextLevel = report
    ? ESCALATION_LEVELS[Math.min(report.escalationLevel + 1, 4)]
    : null;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 pb-16">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Government Dashboard
        </h1>
        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
          ✓ Authorized
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-8">
        Connected:{" "}
        <span className="font-mono">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
      </p>

      {/* Load report */}
      <form onSubmit={handleLookup} className="flex gap-3 mb-8">
        <input
          type="number"
          min="1"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          placeholder="Report ID"
          required
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="echo-btn-primary px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
        >
          Load Report
        </button>
      </form>

      {isLoading && <LoadingSpinner message="Loading report..." />}
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {notFound && (
        <p className="text-gray-500 text-center py-8">No report found.</p>
      )}

      {/* Success banner */}
      {successMsg && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-6">
          <p className="text-green-800 text-sm font-medium">✅ {successMsg}</p>
        </div>
      )}

      {report && (
        <div className="space-y-6">
          {/* Report details */}
          <div className="echo-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {CATEGORY_ICONS[report.category] || "📋"}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Report #{report.id}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {report.category} — {report.location}
                  </p>
                </div>
              </div>
              <StatusBadge status={report.status} />
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Reporter:{" "}
              <span className="font-mono text-xs">
                {report.reporter.slice(0, 6)}...{report.reporter.slice(-4)}
              </span>
            </p>
          </div>

          {/* IPFS evidence */}
          <div className="echo-card">
            <h3 className="font-semibold text-gray-800 mb-3">Evidence</h3>
            <img
              src={getIPFSUrl(report.ipfsHash)}
              alt="Evidence"
              className="w-full rounded-lg mb-2"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          {/* Escalation Timeline */}
          <div className="echo-card">
            <h3 className="font-semibold text-gray-800 mb-3">
              Escalation Chain
            </h3>
            <EscalationTimeline
              escalationLevel={report.escalationLevel}
              status={report.status}
            />
          </div>

          {/* Action buttons */}
          <div className="echo-card space-y-4">
            <h3 className="font-semibold text-gray-800">Actions</h3>

            {actionLoading && (
              <LoadingSpinner size="sm" message="Processing..." />
            )}

            {/* Status 0 (Submitted) or 1 (InReview) */}
            {(report.status === 0 || report.status === 1) && (
              <div className="flex flex-wrap gap-3">
                {report.status === 0 && (
                  <button
                    onClick={() => doAction(updateReportStatus, report.id, 1)}
                    disabled={actionLoading}
                    className="echo-btn-primary px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
                  >
                    Mark In Review
                  </button>
                )}
                <button
                  onClick={() => doAction(escalateReport, report.id)}
                  disabled={actionLoading || report.escalationLevel >= 4}
                  className="echo-btn-secondary px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
                  title={
                    report.escalationLevel >= 4
                      ? "Already at highest level"
                      : ""
                  }
                >
                  Escalate to {nextLevel?.name || "—"}
                </button>
              </div>
            )}

            {/* Status 1 (InReview) or 2 (Escalated) — mark pending confirmation */}
            {(report.status === 1 || report.status === 2) && (
              <div>
                <button
                  onClick={() => doAction(markPendingConfirmation, report.id)}
                  disabled={actionLoading}
                  className="echo-btn-primary px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
                  title="The original reporter will be asked to confirm the fix"
                >
                  Mark as Resolved (Pending Confirmation)
                </button>
                <p className="text-xs text-gray-400 mt-1">
                  The original reporter will be asked to confirm the fix.
                </p>
              </div>
            )}

            {/* Status 3 (PendingConfirmation) */}
            {report.status === 3 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm font-medium">
                  ⏳ Waiting for reporter to confirm resolution
                </p>
                <p className="text-xs text-blue-600 mt-1 font-mono">
                  Reporter: {report.reporter}
                </p>
              </div>
            )}

            {/* Status 4 (Resolved) */}
            {report.status === 4 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm font-medium">
                  ✅ This report has been resolved and confirmed by the
                  reporter.
                </p>
              </div>
            )}

            {/* Status 5 (Disputed) */}
            {report.status === 5 && (
              <div>
                <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-3">
                  <p className="text-red-800 text-sm font-medium">
                    ⚠️ Reporter has disputed this resolution
                  </p>
                </div>
                <button
                  onClick={() => doAction(updateReportStatus, report.id, 1)}
                  disabled={actionLoading}
                  className="echo-btn-danger px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  Re-open Investigation
                </button>
              </div>
            )}
          </div>

          {/* Polygonscan link */}
          <div className="text-center">
            <a
              href={`https://amoy.polygonscan.com/address/${import.meta.env.VITE_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Verify on Polygonscan →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
