import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useContract from "../hooks/useContract";
import ActivityFeedCard from "../components/ActivityFeedCard";
import { getReadOnlyContract } from "../utils/contract";
import bgImage from "../assets/home-page.png";

// ── Nepal News Component ─────────────────────────────────────────────────────
function NepalNewsSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        const API_KEY = import.meta.env.VITE_GNEWS_API_KEY;
        const res = await fetch(
          `https://gnews.io/api/v4/search?q=nepal+government+OR+nepal+civic&lang=en&max=2&apikey=${API_KEY}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setArticles(data.articles || []);
      } catch (err) {
        setError("Could not load news.");
      }
      setLoading(false);
    }
    fetchNews();
  }, []);

  if (loading) {
    return (
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="flex gap-[100px]">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex-1 rounded-2xl overflow-hidden animate-pulse"
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(0,200,150,0.18)",
                minHeight: 260,
              }}
            >
              <div className="h-40 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-2 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <p className="text-center text-gray-400 text-sm">{error}</p>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 pb-20">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🇳🇵</span>
        <h2 className="text-2xl font-bold text-white">Nepal in the News</h2>
        <span
          className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(0,200,150,0.12)", color: "#00c896" }}
        >
          Live
        </span>
      </div>

      {/* Two equal-width cards with 100px gap */}
      <div className="flex gap-[100px]">
        {articles.slice(0, 2).map((article, idx) => (
          <NewsCard key={idx} article={article} />
        ))}

        {/* Fallback placeholders if fewer than 2 articles returned */}
        {articles.length < 2 &&
          Array.from({ length: 2 - articles.length }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="flex-1 rounded-2xl flex items-center justify-center text-gray-400 text-sm"
              style={{
                background: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(12px)",
                border: "1px dashed rgba(0,200,150,0.2)",
                minHeight: 200,
              }}
            >
              No article available
            </div>
          ))}
      </div>
    </section>
  );
}

function NewsCard({ article }) {
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex-1 block rounded-2xl overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl"
      style={{
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(0,200,150,0.18)",
        boxShadow: "0 4px 24px rgba(0,200,150,0.07)",
      }}
    >
      {/* Thumbnail */}
      {article.image ? (
        <div className="h-44 overflow-hidden bg-gray-100">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.parentElement.style.display = "none";
            }}
          />
        </div>
      ) : (
        <div
          className="h-24 flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,200,150,0.12), rgba(10,14,26,0.08))",
          }}
        >
          <span className="text-gray-300 text-sm">No image</span>
        </div>
      )}

      {/* Text content */}
      <div className="p-5">
        {/* Source badge + date */}
        <div className="flex items-center gap-2 mb-3">
          {article.source?.name && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(0,200,150,0.12)",
                color: "#00a87a",
              }}
            >
              {article.source.name}
            </span>
          )}
          {date && (
            <span className="text-xs text-gray-500 ml-auto">{date}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-800 leading-snug line-clamp-3 group-hover:text-[#00c896] transition-colors">
          {article.title}
        </h3>

        {/* Location */}
        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
          <span>📍</span> Nepal
        </p>
      </div>
    </a>
  );
}

// ── Main HomePage ────────────────────────────────────────────────────────────
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
    /*
      Background: uses HOME PAGE.png (1440x3381px) as the full-page canvas.
      The page scrolls naturally through the image — no scroll hijacking.
      Add new sections below NepalNewsSection and they'll sit on the image.
    */
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "1440px 3381px",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center",
        minHeight: "3381px",
        width: "100%",
      }}
    >

      {/* ── HERO ── */}
      <section className="text-white py-20 px-4">
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

      {/* ── STATS BAR ── */}
      <section
        className="py-8 px-4"
        style={{
          background: "rgba(19,25,41,0.75)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
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

      {/* ── LIVE FEED ── */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-xl font-bold text-white">Live on Blockchain</h2>
        </div>
        <p className="text-sm text-gray-400 mb-6">
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

      {/* ── 100px GAP ── */}
      <div style={{ height: 100 }} />

      {/* ── NEPAL NEWS (replaces How It Works) ── */}
      <NepalNewsSection />

      {/* ── ADD NEW SECTIONS BELOW HERE ── */}
      {/* The background image extends to 3381px so you have plenty of canvas */}

    </div>
  );
}