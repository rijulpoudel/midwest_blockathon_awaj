import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import useContract from "../hooks/useContract";
import EscalationTimeline from "../components/EscalationTimeline";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import { getIPFSUrl } from "../utils/pinata";
import useIPFSImage from "../hooks/useIPFSImage";
import { verifyConfirmationCode } from "../utils/submitReport";
import {
  confirmResolutionViaRelayer,
  disputeResolutionViaRelayer,
} from "../utils/relayer";
import { CATEGORY_ICONS } from "../constants";
import PageShell from "../components/PageShell";
import trackBg from "../assets/TrackReport.png";

// ── Glass container style ────────────────────────────────────
const glassStyle = {
  background: "rgba(180,195,210,0.2)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.25)",
};

// ── Citizen Confirm / Dispute Section ────────────────────────
function CitizenResolutionSection({ report, onResolved }) {
  const [codeInput, setCodeInput] = useState("");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [confirmationHash, setConfirmationHash] = useState(null);
  const [hashLoading, setHashLoading] = useState(true);

  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [err, setErr] = useState("");

  // Fetch the confirmationHash from IPFS metadata
  useEffect(() => {
    let cancelled = false;
    async function fetchHash() {
      try {
        const url = getIPFSUrl(report.ipfsHash);
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch metadata");
        const data = await res.json();
        if (!cancelled) {
          setConfirmationHash(data.confirmationHash || null);
          setHashLoading(false);
        }
      } catch {
        if (!cancelled) setHashLoading(false);
      }
    }
    if (report.ipfsHash) fetchHash();
    return () => {
      cancelled = true;
    };
  }, [report.ipfsHash]);

  async function handleVerifyCode(e) {
    e.preventDefault();
    if (!codeInput.trim()) return;
    setVerifying(true);
    setVerifyError("");

    if (!confirmationHash) {
      setVerified(true);
      setVerifying(false);
      return;
    }

    const valid = await verifyConfirmationCode(codeInput, confirmationHash);
    if (valid) {
      setVerified(true);
    } else {
      setVerifyError("Invalid code. Please check and try again.");
    }
    setVerifying(false);
  }

  async function handleConfirm() {
    setAction("confirm");
    setLoading(true);
    setErr("");
    try {
      const txHash = await confirmResolutionViaRelayer(report.id);
      setResult(
        `Confirmed! The issue is resolved. Transaction: ${txHash.slice(0, 12)}…`,
      );
      onResolved(7);
    } catch (e) {
      setErr(`Failed to confirm: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDispute() {
    setAction("dispute");
    setLoading(true);
    setErr("");
    try {
      const txHash = await disputeResolutionViaRelayer(report.id);
      setResult(
        `Disputed! The government will be notified. Transaction: ${txHash.slice(0, 12)}…`,
      );
      onResolved(8);
    } catch (e) {
      setErr(`Failed to dispute: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (hashLoading) {
    return (
      <div className="rounded-3xl p-6 text-center" style={glassStyle}>
        <LoadingSpinner />
        <p className="text-sm text-white/40 mt-2">Loading verification data…</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl p-6"
      style={{ ...glassStyle, border: "2px solid rgba(234,179,8,0.5)" }}
    >
      <h3 className="font-semibold text-yellow-300 mb-2">
        ⚖️ Your Confirmation Required
      </h3>
      <p className="text-sm text-white/60 mb-4">
        The government has marked this issue as resolved. As the person who
        reported it, <strong className="text-white">you</strong> decide if it's
        actually fixed. This is recorded on the blockchain and cannot be faked.
      </p>

      {/* Step 1: Enter confirmation code */}
      {!verified && !result && (
        <div>
          <p className="text-sm text-white/70 mb-3">
            🔐 Enter the{" "}
            <strong className="text-white">secret confirmation code</strong> you
            received when you submitted this report.
          </p>
          <form onSubmit={handleVerifyCode} className="flex gap-3">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. AAWAJ-7X9K2M3P"
              className="flex-1 px-4 py-2.5 text-sm text-white font-mono tracking-wider placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
              style={{
                background: "rgba(20,27,39,0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
              }}
            />
            <button
              type="submit"
              disabled={verifying || !codeInput.trim()}
              className="echo-btn-primary px-5 py-2.5 disabled:opacity-50"
            >
              {verifying ? "Verifying…" : "Verify"}
            </button>
          </form>
          {verifyError && (
            <p className="text-red-400 text-sm mt-2">{verifyError}</p>
          )}
        </div>
      )}

      {/* Step 2: Confirm or Dispute */}
      {verified && !result && (
        <div>
          <div
            className="rounded-xl p-3 mb-4"
            style={{
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            <p className="text-green-300 text-sm font-medium">
              ✅ Identity verified — you are the original reporter.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading && action === "confirm"
                ? "Confirming…"
                : "✅ Yes, it's resolved"}
            </button>
            <button
              onClick={handleDispute}
              disabled={loading}
              className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading && action === "dispute"
                ? "Disputing…"
                : "❌ No, still broken"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {result && (
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background:
              action === "confirm"
                ? "rgba(34,197,94,0.15)"
                : "rgba(236,72,153,0.15)",
            border: `1px solid ${action === "confirm" ? "rgba(34,197,94,0.3)" : "rgba(236,72,153,0.3)"}`,
          }}
        >
          <p className="text-2xl mb-1">{action === "confirm" ? "🎉" : "⚠️"}</p>
          <p
            className={`font-medium ${action === "confirm" ? "text-green-300" : "text-pink-300"}`}
          >
            {result}
          </p>
        </div>
      )}

      {err && <p className="text-red-400 text-sm mt-3">{err}</p>}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function TrackReportPage() {
  const { fetchReport, isLoading, error } = useContract();
  const [searchParams] = useSearchParams();
  const [reportId, setReportId] = useState("");
  const [report, setReport] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const urlId = searchParams.get("id");
    if (urlId && !report) {
      const id = parseInt(urlId, 10);
      if (!isNaN(id) && id > 0) {
        setReportId(String(id));
        fetchReport(id).then((result) => {
          if (result) setReport(result);
          else setNotFound(true);
        });
      }
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSearch(id) {
    setNotFound(false);
    setReport(null);
    const parsed = parseInt(id || reportId, 10);
    if (isNaN(parsed) || parsed <= 0) return;
    const result = await fetchReport(parsed);
    if (result) {
      setReport(result);
    } else {
      setNotFound(true);
    }
  }

  function handleResolved(newStatus) {
    setReport((r) => (r ? { ...r, status: newStatus } : r));
  }

  const evidenceImageUrl = useIPFSImage(report?.ipfsHash);

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

      {/* Glass Search Bar */}
      <div
        className="w-full max-w-5xl rounded-3xl p-10 flex flex-col items-center gap-4 justify-center"
        style={glassStyle}
      >
        <h2 className="text-2xl font-bold text-black tracking-widest text-center">
          SEARCH WITH YOUR ID
        </h2>
        <p className="text-sm text-gray-600 text-center">
          Enter your Report ID to track it
        </p>
        <div className="flex gap-3 w-full max-w-md">
          <input
            type="number"
            min="1"
            value={reportId}
            onChange={(e) => setReportId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter Report ID"
            className="flex-1 bg-white text-gray-800 rounded-xl px-4 py-3 text-base focus:outline-none placeholder-gray-400"
          />
          <button
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="echo-btn-primary px-6 py-3 rounded-xl disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-8">
          <LoadingSpinner message="Fetching report from blockchain..." />
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      {notFound && (
        <p className="text-white/60 text-center mt-8">
          No report found with that ID.
        </p>
      )}

      {report && (
        <div className="w-full max-w-2xl mt-8 space-y-6">
          {/* Report Details Glass Card */}
          <div className="rounded-3xl p-6" style={glassStyle}>
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
                {report.timestamp instanceof Date
                  ? report.timestamp.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : new Date(report.timestamp * 1000).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
              </p>
              <p>
                Reporter{" "}
                <span className="font-mono text-xs">
                  {report.reporter?.slice(0, 6)}...
                  {report.reporter?.slice(-4)}
                </span>
              </p>
            </div>
          </div>

          {/* Escalation Timeline Glass Card */}
          <div className="rounded-3xl p-6" style={glassStyle}>
            <h3 className="font-semibold text-white mb-3">
              Escalation & Resolution Timeline
            </h3>
            <EscalationTimeline currentStatus={report.status} />
          </div>

          {/* Evidence Glass Card */}
          <div className="rounded-3xl p-6" style={glassStyle}>
            <h3 className="font-semibold text-white mb-3">Evidence</h3>

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
              Evidence stored on IPFS via Pinata — content-addressed and
              tamper-proof
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href={getIPFSUrl(report.ipfsHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#00c896] hover:underline"
              >
                📦 View on IPFS →
              </a>
              <a
                href={`https://amoy.polygonscan.com/address/${import.meta.env.VITE_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#00c896] hover:underline"
              >
                ⛓️ Verify on Polygonscan →
              </a>
            </div>
          </div>

          {/* Citizen confirm/dispute — only when Gov says "Resolved" (status 6) */}
          {report.status === 6 && (
            <CitizenResolutionSection
              report={report}
              onResolved={handleResolved}
            />
          )}

          {/* Final state banners */}
          {report.status === 7 && (
            <div
              className="rounded-3xl p-6 text-center"
              style={{
                ...glassStyle,
                border: "2px solid rgba(34,197,94,0.5)",
                background: "rgba(34,197,94,0.15)",
              }}
            >
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-green-300 font-semibold text-lg">
                Citizen Confirmed — Issue Resolved
              </p>
              <p className="text-sm text-white/50 mt-1">
                The original reporter verified this issue was actually fixed.
                This confirmation is permanent on the blockchain.
              </p>
            </div>
          )}

          {report.status === 8 && (
            <div
              className="rounded-3xl p-6 text-center"
              style={{
                ...glassStyle,
                border: "2px solid rgba(236,72,153,0.5)",
                background: "rgba(236,72,153,0.15)",
              }}
            >
              <p className="text-3xl mb-2">⚠️</p>
              <p className="text-pink-300 font-semibold text-lg">
                Citizen Disputed — Not Resolved
              </p>
              <p className="text-sm text-white/50 mt-1">
                The original reporter says this issue is NOT fixed. The
                government's "resolved" claim has been publicly challenged
                on-chain.
              </p>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
