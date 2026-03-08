import { useState, useEffect } from "react";
import useWallet from "../hooks/useWallet";
import useContract from "../hooks/useContract";
import useIPFSImage from "../hooks/useIPFSImage";
import StatusBadge from "../components/StatusBadge";
import EscalationTimeline from "../components/EscalationTimeline";
import LoadingSpinner from "../components/LoadingSpinner";
import { getReadOnlyContract } from "../utils/contract";
import {
  STATUS_LABELS,
  AUTHORIZED_GOV_WALLETS,
  ESCALATION_LEVELS,
  GOV_STATUSES,
} from "../constants";

// ── Access Gate ──────────────────────────────────────────────
function AccessGate({ account, connectWallet, isConnecting }) {
  if (!account) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center px-4">
        <div className="card py-16">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Government Portal
          </h2>
          <p className="text-muted mb-8">
            Connect an authorized government wallet to access this dashboard.
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="btn-primary px-8 py-3 text-lg font-semibold disabled:opacity-50"
          >
            {isConnecting ? "Connecting…" : "Connect Wallet"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-20 text-center px-4">
      <div className="card py-16 border border-red-800">
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-white mb-3">Access Denied</h2>
        <p className="text-muted mb-4">
          Wallet{" "}
          <code className="text-xs bg-surface-bg px-2 py-1 rounded text-body">
            {account}
          </code>{" "}
          is not authorized.
        </p>
        <p className="text-sm text-muted">
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
      className={`w-full text-left card flex items-center gap-4 transition-colors ${
        isSelected
          ? "border-accent-blue border"
          : "border border-transparent hover:border-gray-600"
      }`}
    >
      <div className="w-16 h-16 rounded-lg bg-surface-bg flex-shrink-0 overflow-hidden">
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
          <div className="w-full h-full flex items-center justify-center text-lg text-muted">
            📷
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-white">
            #{report.id} — {report.category}
          </span>
          <StatusBadge status={report.status} />
        </div>
        <p className="text-sm text-muted truncate">{report.location}</p>
        <p className="text-xs text-muted">
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
    // Find next escalation level
    const current = selected.status;
    let next;
    if (current < 2)
      next = 2; // Jump to Ward
    else if (current >= 2 && current < 5) next = current + 1;
    else return; // Already at Federal or beyond

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
    <div className="max-w-6xl mx-auto mt-6 px-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            🏛️ Government Dashboard
          </h1>
          <p className="text-sm text-muted mt-1">
            Connected:{" "}
            <code className="text-xs text-accent-blue">
              {account?.slice(0, 6)}…{account?.slice(-4)}
            </code>
          </p>
        </div>
        <span className="inline-flex items-center gap-2 bg-green-900/50 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Authorized
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        <StatCard label="Total" value={stats.total} color="text-white" />
        <StatCard label="Pending" value={stats.pending} color="text-blue-300" />
        <StatCard
          label="Escalated"
          value={stats.escalated}
          color="text-orange-300"
        />
        <StatCard
          label="Gov Resolved"
          value={stats.govResolved}
          color="text-cyan-300"
        />
        <StatCard
          label="Confirmed"
          value={stats.confirmed}
          color="text-green-300"
        />
        <StatCard
          label="Disputed"
          value={stats.disputed}
          color="text-pink-300"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Report List */}
        <div className="lg:w-1/2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">All Reports</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-surface-card border border-gray-600 text-white text-sm rounded-lg px-3 py-1.5"
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
            <div className="card text-center py-10 text-muted">
              No reports found.
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
            <div className="card text-center py-20 text-muted">
              <div className="text-4xl mb-3">👈</div>
              <p>Select a report to review and update.</p>
            </div>
          )}
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

  // What can the gov do based on current status?
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
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Report #{report.id}</h3>
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
      <div className="card">
        <h4 className="font-semibold text-white mb-3">
          Escalation & Resolution Timeline
        </h4>
        <EscalationTimeline currentStatus={report.status} />
      </div>

      {/* Quick Actions */}
      {!isFinal && (
        <div className="card space-y-4">
          <h4 className="font-semibold text-white">Actions</h4>

          {/* Escalation Buttons */}
          {canEscalate && nextEscalationLabel && (
            <button
              onClick={onEscalateNext}
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
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
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 text-center">
              <p className="text-yellow-300 font-medium">
                ⏳ Awaiting citizen confirmation
              </p>
              <p className="text-xs text-muted mt-1">
                The original reporter must confirm or dispute this resolution.
                This cannot be bypassed.
              </p>
            </div>
          )}

          {/* Advanced: manual status override */}
          <details className="pt-2">
            <summary className="text-xs text-muted cursor-pointer hover:text-white">
              Advanced: Manual status override
            </summary>
            <div className="flex gap-3 items-end mt-3">
              <div className="flex-1">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(Number(e.target.value))}
                  className="w-full bg-surface-bg border border-gray-600 text-white rounded-lg px-4 py-2 text-sm"
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
                className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap"
              >
                {isLoading ? "Sending…" : "Set Status"}
              </button>
            </div>
          </details>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && (
            <p className="text-accent-green text-sm font-medium">
              ✅ {success}
            </p>
          )}
        </div>
      )}

      {isFinal && (
        <div
          className={`card text-center py-6 border ${
            report.status === 7
              ? "border-green-700 bg-green-900/20"
              : "border-pink-700 bg-pink-900/20"
          }`}
        >
          <p className="text-2xl mb-2">{report.status === 7 ? "🎉" : "⚠️"}</p>
          <p
            className={`font-semibold ${
              report.status === 7 ? "text-green-300" : "text-pink-300"
            }`}
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
    <div className="card text-center py-4">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted font-medium">{label}</span>
      <span
        className={`text-body text-right ${mono ? "font-mono text-xs break-all" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
