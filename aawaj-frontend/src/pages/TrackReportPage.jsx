import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useContract from "../hooks/useContract";
import StatusBadge from "../components/StatusBadge";
import EscalationTimeline from "../components/EscalationTimeline";
import ReporterActions from "../components/ReporterActions";
import LoadingSpinner from "../components/LoadingSpinner";
import { CATEGORY_ICONS } from "../constants";
import { getIPFSUrl } from "../utils/pinata";
import useIPFSImage from "../hooks/useIPFSImage";
import trackBg from "../assets/TrackReport.png";
import PageShell from "../components/PageShell";
import TrackSearchCard from "../components/TrackSearchCard";
import StatsBar from "../components/StatsBar";

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
  const { fetchReport, confirmResolution, disputeResolution, isLoading, error } = useContract();
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

  function handleSearch(id) {
    setInputId(id);
    loadReport(id);
  }

  async function handleConfirm() {
    setActionLoading(true);
    try {
      await confirmResolution(report.id);
      await loadReport(report.id);
    } catch {}
    setActionLoading(false);
  }

  async function handleDispute() {
    setActionLoading(true);
    try {
      await disputeResolution(report.id);
      await loadReport(report.id);
    } catch {}
    setActionLoading(false);
  }

  const evidenceImageUrl = useIPFSImage(report?.ipfsHash);
  const isReporter =
    account &&
    report &&
    account.toLowerCase() === report.reporter.toLowerCase();

  return (
  <PageShell bg={trackBg} overlay="bg-black/0">
    <h1
      className="mt-0 mb-4 text-center"
      style={{
        fontFamily: "'Inter', Helvetica",
        fontSize: "40px",
        fontWeight: "600",
        background: "linear-gradient(to bottom, #A0BAD5, #FFFFFF)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      TRACK YOUR REPORT
    </h1>

    <TrackSearchCard onSearch={handleSearch} />

    <div className="mt-10 w-full max-w-5xl">
      <StatsBar />
    </div>

    {isLoading && (
      <div className="mt-8">
        <LoadingSpinner message="Fetching report from blockchain..." />
      </div>
    )}

    {error && (
      <p className="text-red-400 text-sm mt-4">{error}</p>
    )}

    {notFound && (
      <p className="text-white/60 text-center mt-8">
        No report found with that ID.
      </p>
    )}

    {report && (
      <div className="w-full max-w-2xl mt-8 space-y-6">

        <div
          className="rounded-3xl p-6"
          style={{
            background: "rgba(180,195,210,0.2)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {CATEGORY_ICONS[report.category] || "📋"}
              </span>

              <div>
                <h2 className="text-lg font-bold text-white">
                  Report #{report.id}
                </h2>
                <p className="text-sm text-white/60">{report.category}</p>
              </div>
            </div>

            <StatusBadge status={report.status} />
          </div>

          <div className="space-y-2 text-sm text-white/70">
            <p>📍 {report.location}</p>

            <p>
              Submitted on{" "}
              {new Date(Number(report.timestamp) * 1000).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>

            {report.lastUpdated > 0 && (
              <p className="text-white/40">
                Last updated {timeAgo(report.lastUpdated)}
              </p>
            )}

            <p>
              Reporter{" "}
              <span className="font-mono text-xs">
                {report.reporter.slice(0, 6)}...
                {report.reporter.slice(-4)}
              </span>
            </p>

            {isReporter && (
              <span className="inline-block bg-green-500/20 text-green-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                Your Report
              </span>
            )}
          </div>
        </div>

        <div
          className="rounded-3xl p-6"
          style={{
            background: "rgba(180,195,210,0.2)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <h3 className="font-semibold text-white mb-3">
            Escalation Chain
          </h3>

          <EscalationTimeline
            escalationLevel={report.escalationLevel}
            status={report.status}
          />
        </div>

        <div
          className="rounded-3xl p-6"
          style={{
            background: "rgba(180,195,210,0.2)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <h3 className="font-semibold text-white mb-3">
            Evidence
          </h3>

          {evidenceImageUrl && (
            <img
              src={evidenceImageUrl}
              alt="Report evidence"
              className="w-full rounded-xl mb-3"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}

          <p className="text-xs text-white/40 mb-2">
            Evidence stored on IPFS via Pinata — content-addressed and tamper-proof
          </p>

          <a
            href={getIPFSUrl(report.ipfsHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#00c896] hover:underline"
          >
            View on IPFS
          </a>
        </div>

        <ReporterActions
          report={report}
          account={account}
          onConfirm={handleConfirm}
          onDispute={handleDispute}
          isLoading={actionLoading}
        />

        <div className="text-center pb-4">
          <a
            href={`https://amoy.polygonscan.com/address/${import.meta.env.VITE_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#00c896] hover:underline"
          >
            Verify on Polygonscan
          </a>
        </div>

      </div>
    )}
  </PageShell>
);
}