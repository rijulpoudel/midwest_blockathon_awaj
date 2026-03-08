import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReadOnlyContract } from "../utils/contract";
import { STATUS_LABELS } from "../constants";
import useIPFSImage from "../hooks/useIPFSImage";

const STATUS_COLORS = [
  "bg-yellow-900 text-yellow-300", // 0 Submitted
  "bg-blue-900 text-blue-300", // 1 In Review
  "bg-orange-900 text-orange-300", // 2 Ward
  "bg-orange-800 text-orange-200", // 3 Municipality
  "bg-red-900 text-red-300", // 4 Province
  "bg-red-800 text-red-200", // 5 Federal
  "bg-cyan-900 text-cyan-300", // 6 Gov Resolved
  "bg-green-900 text-green-300", // 7 Confirmed
  "bg-pink-900 text-pink-300", // 8 Disputed
];

function useRecentReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const contract = getReadOnlyContract();

        // Try event logs first for efficiency
        const filter = contract.filters.ReportSubmitted();
        let events = [];
        try {
          events = await contract.queryFilter(filter, -100000);
        } catch {
          try {
            events = await contract.queryFilter(filter, -10000);
          } catch {
            /* public RPC may limit range */
          }
        }

        let ids = [];
        if (events.length > 0) {
          ids = [...new Set(events.map((e) => Number(e.args.id)))]
            .sort((a, b) => b - a)
            .slice(0, 10);
        } else {
          // Fallback: probe IDs 1-20
          const probes = await Promise.allSettled(
            Array.from({ length: 20 }, (_, i) => contract.getReport(i + 1)),
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
          setLoading(false);
          return;
        }

        const raw = await Promise.all(ids.map((id) => contract.getReport(id)));
        setReports(
          raw.map((r) => ({
            id: Number(r.id),
            ipfsHash: r.ipfsCid,
            location: r.location,
            category: r.category,
            status: Number(r.status),
            timestamp: new Date(Number(r.timestamp) * 1000),
          })),
        );
      } catch (err) {
        console.warn("Feed load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { reports, loading };
}

export default function HomePage() {
  const { reports, loading } = useRecentReports();

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center text-center px-4 py-16">
      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
        📢 AAWAJ
      </h1>
      <p className="text-xl text-gray-300 max-w-2xl mb-2">
        Your Voice, On-Chain
      </p>
      <p className="text-gray-400 max-w-xl mb-10">
        Submit evidence of civic issues directly to the blockchain. No wallet
        needed. Your report is permanent, transparent, and tamper-proof —
        powered by Polygon and IPFS via Pinata.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-20">
        <Link
          to="/submit"
          className="btn-primary px-8 py-3 text-lg font-semibold"
        >
          Submit a Report
        </Link>
        <Link
          to="/track"
          className="btn-secondary px-8 py-3 text-lg font-semibold"
        >
          Track a Report
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mb-20">
        <FeatureCard
          icon="📸"
          title="Upload Evidence"
          desc="Photos are stored permanently on IPFS via Pinata — nobody can delete them."
        />
        <FeatureCard
          icon="⛓️"
          title="On-Chain Record"
          desc="Every report is written to the Polygon blockchain for full transparency."
        />
        <FeatureCard
          icon="🏛️"
          title="Gov Accountability"
          desc="Government officials update statuses on-chain. All actions are public."
        />
      </div>

      {/* ── Recent Reports Feed ── */}
      <div className="w-full max-w-3xl text-left">
        <h2 className="text-2xl font-bold text-white mb-1">Recent Reports</h2>
        <p className="text-sm text-muted mb-6">
          Live from the Polygon blockchain
        </p>

        {loading ? (
          <div className="text-center py-12 text-muted">Loading reports…</div>
        ) : reports.length === 0 ? (
          <div className="card text-center py-10 text-muted">
            No reports yet.{" "}
            <Link to="/submit" className="text-accent-blue underline">
              Be the first!
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reports.map((r) => (
              <FeedCard key={r.id} report={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FeedCard({ report }) {
  const imageUrl = useIPFSImage(report.ipfsHash);

  return (
    <Link
      to={`/track?id=${report.id}`}
      className="card flex items-center gap-4 hover:border-accent-blue border border-transparent transition-colors"
    >
      <div className="w-20 h-20 rounded-lg bg-surface-bg flex-shrink-0 overflow-hidden">
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
          <div className="w-full h-full flex items-center justify-center text-2xl text-muted">
            📷
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-white truncate">
            #{report.id} — {report.category}
          </p>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
              STATUS_COLORS[report.status] ?? "bg-gray-800 text-gray-300"
            }`}
          >
            {STATUS_LABELS[report.status] ?? "Unknown"}
          </span>
        </div>
        <p className="text-sm text-muted truncate">{report.location}</p>
        <p className="text-xs text-muted mt-1">
          {report.timestamp.toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="card text-left">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-body">{desc}</p>
    </div>
  );
}
