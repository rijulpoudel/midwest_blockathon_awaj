import { useState, useEffect } from "react";
import useWallet from "../hooks/useWallet";
import useContract from "../hooks/useContract";
import useIPFSImage from "../hooks/useIPFSImage";
import StatusBadge from "../components/StatusBadge";
import EscalationTimeline from "../components/EscalationTimeline";
import LoadingSpinner from "../components/LoadingSpinner";
import { getReadOnlyContract } from "../utils/contract";
import bgImage from "../assets/home_asset/home-page.png";
import {
  STATUS_LABELS,
  AUTHORIZED_GOV_WALLETS,
  ESCALATION_LEVELS,
  GOV_STATUSES,
} from "../constants";

// ── Glass Card wrapper ──────────────────────────────────────
const glassCard = {
  background: "rgba(255, 255, 255, 0.12)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
};

// ── Access Gate ──────────────────────────────────────────────
function AccessGate({ account, connectWallet, isConnecting }) {
  if (!account) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center px-4">
        <div style={glassCard} className="py-16">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "white" }}>
            Government Portal
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)" }} className="mb-8">
            Connect an authorized government wallet to access this dashboard.
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="echo-btn-primary px-8 py-3 text-lg font-semibold disabled:opacity-50"
          >
            {isConnecting ? "Connecting…" : "Connect Wallet"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-20 text-center px-4">
      <div
        style={{ ...glassCard, border: "2px solid rgba(239,68,68,0.4)" }}
        className="py-16"
      >
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: "white" }}>
          Access Denied
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)" }} className="mb-4">
          Wallet{" "}
          <code
            className="text-xs px-2 py-1 rounded"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            {account}
          </code>{" "}
          is not authorized.
        </p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          Only registered government officials can access this portal.
        </p>
      </div>
    </div>
  );
}

// ── Report Row ───────────────────────────────────────────────
function ReportRow({ report, onSelect, isSelected }) {
  const imageUrl = useIPFSImage(report.ipfsHash);

  return (
    <button
      onClick={() => onSelect(report)}
      className={`w-full text-left flex items-center gap-4 transition-all ${
        isSelected ? "shadow-md" : "hover:shadow-sm"
      }`}
      style={{
        ...glassCard,
        border: isSelected
          ? "2px solid #00c896"
          : "1px solid rgba(255,255,255,0.18)",
      }}
    >
      <div
        className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-lg"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            📷
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold" style={{ color: "white" }}>
            #{report.id} — {report.category}
          </span>
          <StatusBadge status={report.status} />
        </div>
        <p
          className="text-sm truncate"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          {report.location}
        </p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
          {report.timestamp.toLocaleDateString()} ·{" "}
          {report.reporter?.slice(0, 6)}…{report.reporter?.slice(-4)}
        </p>
      </div>
    </button>
  );
}

// ── Main Dashboard ───────────────────────────────────────────
export default function GovDashboardPage() {
  const { account, connectWallet, isConnecting } = useWallet();
  const { updateReportStatus, isLoading, error } = useContract();

  const [reports, setReports] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState(1);
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");

  const isAuthorized =
    account && AUTHORIZED_GOV_WALLETS.includes(account.toLowerCase());

  // Load all reports
  useEffect(() => {
    if (!isAuthorized) return;

    async function loadAll() {
      try {
        const contract = getReadOnlyContract();
        const f = contract.filters.ReportSubmitted();
        let events = [];
        try {
          events = await contract.queryFilter(f, -100000);
        } catch {
          try {
            events = await contract.queryFilter(f, -10000);
          } catch {
            /* ignore */
          }
        }

        let ids = [];
        if (events.length > 0) {
          ids = [...new Set(events.map((e) => Number(e.args.id)))].sort(
            (a, b) => b - a,
          );
        } else {
          const probes = await Promise.allSettled(
            Array.from({ length: 30 }, (_, i) => contract.getReport(i + 1)),
          );
          ids = probes
            .map((r, i) =>
              r.status === "fulfilled" &&
              r.value.submitter !== "0x0000000000000000000000000000000000000000"
                ? i + 1
                : null,
            )
            .filter(Boolean)
            .reverse();
        }

        if (ids.length === 0) {
          setFeedLoading(false);
          return;
        }

        const raw = await Promise.all(ids.map((id) => contract.getReport(id)));
        setReports(
          raw.map((r) => ({
            id: Number(r.id),
            reporter: r.submitter,
            ipfsHash: r.ipfsCid,
            location: r.location,
            category: r.category,
            status: Number(r.status),
            timestamp: new Date(Number(r.timestamp) * 1000),
          })),
        );
      } catch (err) {
        console.warn("Gov feed failed:", err);
      } finally {
        setFeedLoading(false);
      }
    }
    loadAll();
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <AccessGate
        account={account}
        connectWallet={connectWallet}
        isConnecting={isConnecting}
      />
    );
  }

  async function handleUpdate() {
    if (!selected) return;
    setSuccess("");
    const txHash = await updateReportStatus(selected.id, newStatus);
    if (txHash) {
      setSuccess(`Report #${selected.id} → "${STATUS_LABELS[newStatus]}"`);
      setReports((prev) =>
        prev.map((r) =>
          r.id === selected.id ? { ...r, status: newStatus } : r,
        ),
      );
      setSelected((s) => (s ? { ...s, status: newStatus } : s));
    }
  }

  async function handleEscalateNext() {
    if (!selected) return;
    const current = selected.status;
    let next;
    if (current < 2) next = 2;
    else if (current >= 2 && current < 5) next = current + 1;
    else return;

    setSuccess("");
    const txHash = await updateReportStatus(selected.id, next);
    if (txHash) {
      setSuccess(
        `Report #${selected.id} escalated to "${STATUS_LABELS[next]}"`,
      );
      setReports((prev) =>
        prev.map((r) => (r.id === selected.id ? { ...r, status: next } : r)),
      );
      setSelected((s) => (s ? { ...s, status: next } : s));
    }
  }

  async function handleMarkResolved() {
    if (!selected) return;
    setSuccess("");
    const txHash = await updateReportStatus(selected.id, 6);
    if (txHash) {
      setSuccess(
        `Report #${selected.id} marked as Gov Resolved — awaiting citizen confirmation`,
      );
      setReports((prev) =>
        prev.map((r) => (r.id === selected.id ? { ...r, status: 6 } : r)),
      );
      setSelected((s) => (s ? { ...s, status: 6 } : s));
    }
  }

  const filtered =
    filter === "all"
      ? reports
      : reports.filter((r) => r.status === Number(filter));

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status <= 1).length,
    escalated: reports.filter((r) => r.status >= 2 && r.status <= 5).length,
    govResolved: reports.filter((r) => r.status === 6).length,
    confirmed: reports.filter((r) => r.status === 7).length,
    disputed: reports.filter((r) => r.status === 8).length,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-6xl mx-auto pt-6 px-4 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "white" }}>
              🏛️ Government Dashboard
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Connected:{" "}
              <code className="text-xs text-[#00c896] font-medium">
                {account?.slice(0, 6)}…{account?.slice(-4)}
              </code>
            </p>
          </div>
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: "rgba(0,200,150,0.2)", color: "#00c896" }}
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Authorized
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          <StatCard label="Total" value={stats.total} color="white" />
          <StatCard label="Pending" value={stats.pending} color="#60a5fa" />
          <StatCard label="Escalated" value={stats.escalated} color="#fb923c" />
          <StatCard
            label="Gov Resolved"
            value={stats.govResolved}
            color="#22d3ee"
          />
          <StatCard label="Confirmed" value={stats.confirmed} color="#4ade80" />
          <StatCard label="Disputed" value={stats.disputed} color="#f472b6" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Report List */}
          <div className="lg:w-1/2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "white" }}>
                All Reports
              </h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#00c896] focus:border-transparent outline-none"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                }}
              >
                <option value="all">All Statuses</option>
                {STATUS_LABELS.map((label, i) => (
                  <option key={label} value={i}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {feedLoading ? (
              <div className="text-center py-12">
                <LoadingSpinner />
              </div>
            ) : filtered.length === 0 ? (
              <div style={glassCard} className="text-center py-10">
                <span style={{ color: "rgba(255,255,255,0.5)" }}>
                  No reports found.
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
                {filtered.map((r) => (
                  <ReportRow
                    key={r.id}
                    report={r}
                    onSelect={setSelected}
                    isSelected={selected?.id === r.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Detail Panel */}
          <div className="lg:w-1/2">
            {selected ? (
              <DetailPanel
                report={selected}
                newStatus={newStatus}
                setNewStatus={setNewStatus}
                onUpdate={handleUpdate}
                onEscalateNext={handleEscalateNext}
                onMarkResolved={handleMarkResolved}
                isLoading={isLoading}
                error={error}
                success={success}
              />
            ) : (
              <div style={glassCard} className="text-center py-20">
                <div className="text-4xl mb-3">👈</div>
                <p style={{ color: "rgba(255,255,255,0.5)" }}>
                  Select a report to review and update.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Detail Panel ─────────────────────────────────────────────
function DetailPanel({
  report,
  newStatus,
  setNewStatus,
  onUpdate,
  onEscalateNext,
  onMarkResolved,
  isLoading,
  error,
  success,
}) {
  const imageUrl = useIPFSImage(report.ipfsHash);

  const canEscalate =
    report.status >= 0 && report.status < 5 && report.status !== 6;
  const canResolve = report.status >= 1 && report.status <= 5;
  const isAwaitingCitizen = report.status === 6;
  const isFinal = report.status === 7 || report.status === 8;

  const nextEscalationLabel =
    report.status < 2
      ? "Ward"
      : ESCALATION_LEVELS.find((l) => l.status === report.status + 1)?.label;

  return (
    <div className="space-y-4">
      {/* Report Info */}
      <div style={glassCard}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ color: "white" }}>
            Report #{report.id}
          </h3>
          <StatusBadge status={report.status} />
        </div>

        {imageUrl && (
          <img
            src={imageUrl}
            alt="Evidence"
            className="w-full h-56 object-cover rounded-lg mb-4"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}

        <div className="space-y-2 text-sm">
          <Row label="Category" value={report.category} />
          <Row label="Location" value={report.location} />
          <Row
            label="Submitter"
            value={`${report.reporter?.slice(0, 10)}…${report.reporter?.slice(-6)}`}
          />
          <Row label="Submitted" value={report.timestamp.toLocaleString()} />
          {report.ipfsHash && (
            <Row label="IPFS CID" value={report.ipfsHash} mono />
          )}
        </div>
      </div>

      {/* Escalation Timeline */}
      <div style={glassCard}>
        <h4 className="font-semibold mb-3" style={{ color: "white" }}>
          Escalation & Resolution Timeline
        </h4>
        <EscalationTimeline currentStatus={report.status} />
      </div>

      {/* Quick Actions */}
      {!isFinal && (
        <div style={glassCard} className="space-y-4">
          <h4 className="font-semibold" style={{ color: "white" }}>
            Actions
          </h4>

          {/* Escalation Buttons */}
          {canEscalate && nextEscalationLabel && (
            <button
              onClick={onEscalateNext}
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              ⬆️ Escalate to {nextEscalationLabel}
            </button>
          )}

          {/* Mark Resolved */}
          {canResolve && (
            <button
              onClick={onMarkResolved}
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              ✅ Mark as Gov Resolved
            </button>
          )}

          {isAwaitingCitizen && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-center">
              <p className="text-yellow-700 font-medium">
                ⏳ Awaiting citizen confirmation
              </p>
              <p className="text-xs text-gray-500 mt-1">
                The original reporter must confirm or dispute this resolution.
                This cannot be bypassed.
              </p>
            </div>
          )}

          {/* Advanced: manual status override */}
          <details className="pt-2">
            <summary
              className="text-xs cursor-pointer"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Advanced: Manual status override
            </summary>
            <div className="flex gap-3 items-end mt-3">
              <div className="flex-1">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(Number(e.target.value))}
                  className="w-full rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#00c896] focus:border-transparent outline-none"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                >
                  {GOV_STATUSES.map((i) => (
                    <option key={i} value={i}>
                      {STATUS_LABELS[i]}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={onUpdate}
                disabled={isLoading}
                className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap"
              >
                {isLoading ? "Sending…" : "Set Status"}
              </button>
            </div>
          </details>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && (
            <p className="text-[#00c896] text-sm font-medium">✅ {success}</p>
          )}
        </div>
      )}

      {isFinal && (
        <div
          style={{
            ...glassCard,
            border:
              report.status === 7
                ? "2px solid rgba(74,222,128,0.5)"
                : "2px solid rgba(244,114,182,0.5)",
          }}
          className="text-center py-6"
        >
          <p className="text-2xl mb-2">{report.status === 7 ? "🎉" : "⚠️"}</p>
          <p
            className="font-semibold"
            style={{ color: report.status === 7 ? "#4ade80" : "#f472b6" }}
          >
            {report.status === 7
              ? "Citizen confirmed — case closed"
              : "Citizen disputed — requires re-investigation"}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div style={glassCard} className="text-center py-4">
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
        {label}
      </p>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
        {label}
      </span>
      <span
        className={`text-right ${mono ? "font-mono text-xs break-all" : ""}`}
        style={{ color: "white" }}
      >
        {value}
      </span>
    </div>
  );
}
