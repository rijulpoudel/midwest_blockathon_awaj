import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useContract from "../hooks/useContract";
import StatusBadge from "../components/StatusBadge";
import EscalationTimeline from "../components/EscalationTimeline";
import ReporterActions from "../components/ReporterActions";
import LoadingSpinner from "../components/LoadingSpinner";
import { CATEGORY_ICONS } from "../constants";
import { getIPFSUrl } from "../utils/pinata";

function timeAgo(ts) {
  const seconds = Math.floor((Date.now() - ts * 1000) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function TrackReportPage({ account, onConnect }) {
  const { reportId: paramId } = useParams();
  const {
    fetchReport,
    confirmResolution,
    disputeResolution,
    isLoading,
    error,
  } = useContract();
  const [inputId, setInputId] = useState(paramId || "");
  const [report, setReport] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadReport(id) {
    setNotFound(false);
    setReport(null);
    const parsed = parseInt(id, 10);
    if (isNaN(parsed) || parsed <= 0) return;
    const result = await fetchReport(parsed);
    if (result) {
      setReport(result);
    } else {
      setNotFound(true);
    }
  }

  useEffect(() => {
    if (paramId) {
      setInputId(paramId);
      loadReport(paramId);
    }
  }, [paramId]);

  function handleSearch(e) {
    e.preventDefault();
    loadReport(inputId);
  }

  async function handleConfirm() {
    setActionLoading(true);
    try {
      await confirmResolution(report.id);
      await loadReport(report.id);
    } catch {
      /* error from hook */
    }
    setActionLoading(false);
  }

  async function handleDispute() {
    setActionLoading(true);
    try {
      await disputeResolution(report.id);
      await loadReport(report.id);
    } catch {
      /* error from hook */
    }
    setActionLoading(false);
  }

  const isReporter =
    account &&
    report &&
    account.toLowerCase() === report.reporter.toLowerCase();

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Track a Report</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="number"
          min="1"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          placeholder="Enter Report ID"
          required
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="echo-btn-primary px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
        >
          Search
        </button>
      </form>

      {isLoading && (
        <LoadingSpinner message="Fetching report from blockchain..." />
      )}

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {notFound && (
        <p className="text-gray-500 text-center py-8">
          No report found with that ID.
        </p>
      )}

      {report && (
        <div className="space-y-6">
          {/* Report header */}
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
                  <p className="text-sm text-gray-500">{report.category}</p>
                </div>
              </div>
              <StatusBadge status={report.status} />
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>📍 {report.location}</p>
              <p>
                Submitted on{" "}
                {new Date(Number(report.timestamp) * 1000).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </p>
              {report.lastUpdated > 0 && (
                <p className="text-gray-400">
                  Last updated {timeAgo(report.lastUpdated)}
                </p>
              )}
              <p>
                Reporter:{" "}
                <span className="font-mono text-xs">
                  {report.reporter.slice(0, 6)}...{report.reporter.slice(-4)}
                </span>
              </p>
              {isReporter && (
                <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  ✓ Your Report
                </span>
              )}
            </div>
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

          {/* Evidence */}
          <div className="echo-card">
            <h3 className="font-semibold text-gray-800 mb-3">Evidence</h3>
            <img
              src={getIPFSUrl(report.ipfsHash)}
              alt="Report evidence"
              className="w-full rounded-lg mb-3"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <p className="text-xs text-gray-400 mb-2">
              Evidence stored on IPFS via Pinata — content-addressed and
              tamper-proof
            </p>
            <a
              href={getIPFSUrl(report.ipfsHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View on IPFS →
            </a>
          </div>

          {/* Reporter Actions */}
          <ReporterActions
            report={report}
            account={account}
            onConfirm={handleConfirm}
            onDispute={handleDispute}
            isLoading={actionLoading}
          />

          {/* Verification */}
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
