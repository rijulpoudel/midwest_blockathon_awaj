import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useContract from "../hooks/useContract";
import ActivityFeedCard from "../components/ActivityFeedCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { getReadOnlyContract } from "../utils/contract";

export default function HomePage({ account, onConnect }) {
  const { fetchActivityFeed } = useContract();
  const [feed, setFeed] = useState([]);
  const [totalReports, setTotalReports] = useState(null);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [feedLoading, setFeedLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  async function loadFeed() {
    setFeedLoading(true);
    try {
      const reports = await fetchActivityFeed(10);
      setFeed(reports);
      setResolvedCount(reports.filter((r) => r.status === 4).length);
      setLastUpdated(new Date());
    } catch {
      // error handled in hook
    }
    setFeedLoading(false);
  }

  useEffect(() => {
    async function loadCount() {
      try {
        const contract = getReadOnlyContract();
        const count = await contract.getReportCount();
        setTotalReports(Number(count));
      } catch {
        setTotalReports(0);
      }
    }
    loadCount();
    loadFeed();

    const interval = setInterval(loadFeed, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="bg-[#0a0e1a] text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Make Your Voice Heard
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
            Report civic problems in Nepal. Every report is permanent, public,
            and impossible to ignore.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/submit"
              className="echo-btn-primary text-lg px-8 py-3 rounded-xl shadow-lg"
            >
              Submit a Report
            </Link>
            <Link
              to="/track"
              className="echo-btn-secondary text-lg px-8 py-3 rounded-xl border-white text-white hover:bg-white/10"
            >
              Track Your Report
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-6">
            Powered by Polygon Blockchain + Pinata IPFS
          </p>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-[#131929] py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-[#00c896]">
              {totalReports === null ? (
                <span className="inline-block w-10 h-8 bg-gray-700 rounded animate-pulse" />
              ) : (
                totalReports
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total Reports</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#00c896]">{resolvedCount}</p>
            <p className="text-xs text-gray-400 mt-1">Resolved</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#00c896]">5+</p>
            <p className="text-xs text-gray-400 mt-1">Active Wards</p>
          </div>
        </div>
      </section>

      {/* LIVE FEED */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-xl font-bold text-gray-900">
            Live on Blockchain
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Real-time report activity from Polygon Amoy
        </p>

        {feedLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="echo-card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : feed.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No reports yet. Be the first to report a problem.
          </div>
        ) : (
          <div className="space-y-4">
            {feed.map((report) => (
              <ActivityFeedCard key={report.id} report={report} />
            ))}
          </div>
        )}

        {lastUpdated && (
          <p className="text-xs text-gray-400 mt-4 text-center">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="echo-card text-center">
            <div className="text-4xl mb-3">📸</div>
            <h3 className="font-bold text-gray-800 mb-1">Report It</h3>
            <p className="text-sm text-gray-500">
              Take a photo, describe the problem, submit.
            </p>
          </div>
          <div className="echo-card text-center">
            <div className="text-4xl mb-3">⛓️</div>
            <h3 className="font-bold text-gray-800 mb-1">
              Blockchain Records It
            </h3>
            <p className="text-sm text-gray-500">
              Immutably stored on Polygon. Impossible to delete.
            </p>
          </div>
          <div className="echo-card text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="font-bold text-gray-800 mb-1">Track Resolution</h3>
            <p className="text-sm text-gray-500">
              Follow your report as government responds.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
