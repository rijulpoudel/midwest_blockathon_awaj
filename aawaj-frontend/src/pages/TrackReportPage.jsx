import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import useContract from "../hooks/useContract";
import ReportCard from "../components/ReportCard";
import EscalationTimeline from "../components/EscalationTimeline";
import LoadingSpinner from "../components/LoadingSpinner";
import { getIPFSUrl } from "../utils/pinata";
import useIPFSImage from "../hooks/useIPFSImage";
import { verifyConfirmationCode } from "../utils/submitReport";
import {
  confirmResolutionViaRelayer,
  disputeResolutionViaRelayer,
} from "../utils/relayer";

// ── Evidence Section ─────────────────────────────────────────
function EvidenceSection({ report }) {
  const imageUrl = useIPFSImage(report.ipfsHash);

  return (
    <div className="card">
      <h3 className="font-semibold text-white mb-3">Evidence</h3>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Report evidence"
          className="w-full rounded-lg mb-4"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      )}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <span className="text-accent-blue text-sm font-medium whitespace-nowrap">
            IPFS CID:
          </span>
          <code className="text-xs text-body break-all bg-surface-bg rounded px-2 py-1">
            {report.ipfsHash}
          </code>
        </div>
        <p className="text-xs text-muted">
          This content hash is a cryptographic fingerprint. If anyone changes
          the evidence, the hash changes — proving tampering.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={getIPFSUrl(report.ipfsHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent-blue hover:underline"
          >
            📦 View on IPFS →
          </a>
          <a
            href={`https://amoy.polygonscan.com/address/${import.meta.env.VITE_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent-blue hover:underline"
          >
            ⛓️ Verify on Polygonscan →
          </a>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-block w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs text-accent-green font-medium">
            Stored on IPFS via Pinata — tamper-proof & permanent
          </span>
        </div>
      </div>
    </div>
  );
}

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
      // Legacy report without a hash — allow access (backwards compat)
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
      <div className="card border border-yellow-700 text-center py-6">
        <LoadingSpinner />
        <p className="text-sm text-muted mt-2">Loading verification data…</p>
      </div>
    );
  }

  return (
    <div className="card border border-yellow-700">
      <h3 className="font-semibold text-yellow-300 mb-2">
        ⚖️ Your Confirmation Required
      </h3>
      <p className="text-sm text-muted mb-4">
        The government has marked this issue as resolved. As the person who
        reported it, <strong className="text-white">you</strong> decide if it's
        actually fixed. This is recorded on the blockchain and cannot be faked.
      </p>

      {/* Step 1: Enter confirmation code */}
      {!verified && !result && (
        <div>
          <p className="text-sm text-body mb-3">
            🔐 Enter the{" "}
            <strong className="text-white">secret confirmation code</strong> you
            received when you submitted this report. This proves you are the
            original reporter.
          </p>
          <form onSubmit={handleVerifyCode} className="flex gap-3">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. AAWAJ-7X9K2M3P"
              className="flex-1 bg-surface-card border border-gray-600 text-white rounded-lg px-4 py-2 text-sm font-mono placeholder-gray-500 tracking-wider"
            />
            <button
              type="submit"
              disabled={verifying || !codeInput.trim()}
              className="btn-primary px-5 py-2 disabled:opacity-50"
            >
              {verifying ? "Verifying…" : "Verify"}
            </button>
          </form>
          {verifyError && (
            <p className="text-red-400 text-sm mt-2">{verifyError}</p>
          )}
        </div>
      )}

      {/* Step 2: Confirm or Dispute (only after code verified) */}
      {verified && !result && (
        <div>
          <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3 mb-4">
            <p className="text-green-400 text-sm font-medium">
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
          className={`rounded-lg p-4 text-center ${
            action === "confirm"
              ? "bg-green-900/30 border border-green-700"
              : "bg-pink-900/30 border border-pink-700"
          }`}
        >
          <p className="text-2xl mb-1">{action === "confirm" ? "🎉" : "⚠️"}</p>
          <p
            className={`font-medium ${
              action === "confirm" ? "text-green-300" : "text-pink-300"
            }`}
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

  async function handleSearch(e) {
    e.preventDefault();
    setNotFound(false);
    setReport(null);
    const id = parseInt(reportId, 10);
    if (isNaN(id) || id <= 0) return;
    const result = await fetchReport(id);
    if (result) {
      setReport(result);
    } else {
      setNotFound(true);
    }
  }

  function handleResolved(newStatus) {
    setReport((r) => (r ? { ...r, status: newStatus } : r));
  }

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold text-white mb-6">Track a Report</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="number"
          min="1"
          value={reportId}
          onChange={(e) => setReportId(e.target.value)}
          placeholder="Enter Report ID"
          required
          className="flex-1 bg-surface-card border border-gray-600 text-white rounded-lg px-4 py-2 text-sm placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary px-6 py-2 disabled:opacity-50"
        >
          Search
        </button>
      </form>

      {isLoading && <LoadingSpinner />}

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {notFound && (
        <p className="text-muted text-center py-8">
          No report found with that ID.
        </p>
      )}

      {report && (
        <div className="space-y-6">
          <ReportCard report={report} />
          <EvidenceSection report={report} />

          {/* Escalation & Resolution Timeline */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3">
              Escalation & Resolution Timeline
            </h3>
            <EscalationTimeline currentStatus={report.status} />
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
            <div className="card border border-green-700 bg-green-900/20 text-center py-6">
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-green-300 font-semibold text-lg">
                Citizen Confirmed — Issue Resolved
              </p>
              <p className="text-sm text-muted mt-1">
                The original reporter verified this issue was actually fixed.
                This confirmation is permanent on the blockchain.
              </p>
            </div>
          )}

          {report.status === 8 && (
            <div className="card border border-pink-700 bg-pink-900/20 text-center py-6">
              <p className="text-3xl mb-2">⚠️</p>
              <p className="text-pink-300 font-semibold text-lg">
                Citizen Disputed — Not Resolved
              </p>
              <p className="text-sm text-muted mt-1">
                The original reporter says this issue is NOT fixed. The
                government's "resolved" claim has been publicly challenged
                on-chain.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
