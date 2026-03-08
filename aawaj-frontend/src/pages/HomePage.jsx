import { useState, useEffect, useRef } from "react";
import useContract from "../hooks/useContract";
import ActivityFeedCard from "../components/ActivityFeedCard";
import { getReadOnlyContract } from "../utils/contract";
import bgImage from "../assets/home_asset/home-page.png";
import mountainImage from "../assets/home_asset/mountain.png";

// Mountain is 1440x1051px → height ratio = 1051/1440
const MOUNTAIN_RATIO = 1051 / 1440;
// Background image is 1440x3381px → height ratio = 3381/1440
const BG_RATIO = 3381 / 1440;

// ── Nepal News ───────────────────────────────────────────────────────────────
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
      } catch {
        setError("Could not load news.");
      }
      setLoading(false);
    }
    fetchNews();
  }, []);

  if (loading) {
    return (
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px 80px" }}>
        <div style={{ display: "flex", gap: 100 }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ flex: 1, borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px)", border: "1px solid rgba(0,200,150,0.18)", minHeight: 260 }}>
              <div style={{ height: 160, background: "#e5e7eb" }} />
              <div style={{ padding: 20 }}>
                <div style={{ height: 12, background: "#e5e7eb", borderRadius: 4, width: "75%", marginBottom: 10 }} />
                <div style={{ height: 12, background: "#e5e7eb", borderRadius: 4, width: "50%" }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px 80px" }}>
        <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 14 }}>{error}</p>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 24 }}>🇳🇵</span>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "white", margin: 0 }}>Nepal in the News</h2>
        <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(0,200,150,0.12)", color: "#00c896", marginLeft: 8 }}>
          Live
        </span>
      </div>
      <div style={{ display: "flex", gap: 100 }}>
        {articles.slice(0, 2).map((article, idx) => (
          <NewsCard key={idx} article={article} />
        ))}
        {articles.length < 2 &&
          Array.from({ length: 2 - articles.length }).map((_, i) => (
            <div key={`placeholder-${i}`} style={{ flex: 1, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14, background: "rgba(255,255,255,0.25)", backdropFilter: "blur(12px)", border: "1px dashed rgba(0,200,150,0.2)", minHeight: 200 }}>
              No article available
            </div>
          ))}
      </div>
    </section>
  );
}

function NewsCard({ article }) {
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer"
      style={{ flex: 1, display: "block", borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px)", border: "1px solid rgba(0,200,150,0.18)", boxShadow: "0 4px 24px rgba(0,200,150,0.07)", textDecoration: "none", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,200,150,0.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,200,150,0.07)"; }}
    >
      {article.image ? (
        <div style={{ height: 176, overflow: "hidden", background: "#f3f4f6" }}>
          <img src={article.image} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { e.target.parentElement.style.display = "none"; }} />
        </div>
      ) : (
        <div style={{ height: 96, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(0,200,150,0.12), rgba(10,14,26,0.08))" }}>
          <span style={{ color: "#d1d5db", fontSize: 14 }}>No image</span>
        </div>
      )}
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          {article.source?.name && (
            <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(0,200,150,0.12)", color: "#00a87a" }}>
              {article.source.name}
            </span>
          )}
          {date && <span style={{ fontSize: 12, color: "#6b7280", marginLeft: "auto" }}>{date}</span>}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1f2937", lineHeight: 1.4, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {article.title}
        </h3>
        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 12, display: "flex", alignItems: "center", gap: 4 }}>
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

  // scrollY from window — works because height:100% is removed from html/body/#root
  const [scrollY, setScrollY] = useState(0);

  const statsRef = useRef(null);
  const textRef = useRef(null);
  const wrapperRef = useRef(null);

  // ── Listen on window.scroll — reliable now that page scrolls naturally ──
  useEffect(() => {
    function onScroll() {
      setScrollY(window.scrollY);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── AAWAJ position:
  //    - Starts at NAVBAR_HEIGHT + 30px gap below navbar
  //    - Moves DOWN as user scrolls (follows scroll)
  //    - Stops 20px above the stats bar
  function getTextTop() {
    const NAVBAR_HEIGHT = 70;
    const GAP = 30;
    const startTop = NAVBAR_HEIGHT + GAP; // 100px from top of page

    if (!statsRef.current || !textRef.current || !wrapperRef.current) {
      return startTop + scrollY;
    }

    // offsetTop of stats bar relative to the wrapper div
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const statsRect = statsRef.current.getBoundingClientRect();
    const statsAbsoluteTop = statsRect.top + scrollY - wrapperRect.top - scrollY + wrapperRef.current.offsetTop;

    const textHeight = textRef.current.offsetHeight;
    const maxTop = statsAbsoluteTop - textHeight - 20;

    return Math.min(startTop + scrollY, maxTop);
  }

  async function loadFeed() {
    setFeedLoading(true);
    try {
      const reports = await fetchActivityFeed(10);
      setFeed(reports);
      setResolvedCount(reports.filter((r) => r.status === 4).length);
      setLastUpdated(new Date());
    } catch {
      // handled in hook
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

  const textTop = getTextTop();

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        // Page height = background image aspect ratio
        minHeight: `calc(100vw * ${BG_RATIO})`,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center",
        // NO overflowY: auto — let window handle scrolling
      }}
    >

      {/* ── z:1 — AAWAJ — follows scroll, stops above stats bar ── */}
      <div
        ref={textRef}
        style={{
          position: "absolute",
          top: textTop,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 1,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <span
          style={{
            fontFamily: "'Noto Serif', serif",
            fontSize: "230px",
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-4px",
            background: "linear-gradient(-16deg, #A0BAD5 0%, #FFFFFF 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            display: "inline-block",
          }}
        >
          AAWAJ
        </span>
      </div>

      {/* ── z:2 — MOUNTAIN PNG — covers AAWAJ as it scrolls up into it ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          pointerEvents: "none",
          lineHeight: 0,
        }}
      >
        <img
          src={mountainImage}
          alt=""
          style={{ width: "100%", display: "block" }}
        />
      </div>

      {/* ── z:3 — PAGE CONTENT — starts right below mountain base ── */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          // Push content below the mountain: mountain height = vw * MOUNTAIN_RATIO
          paddingTop: `calc(100vw * ${MOUNTAIN_RATIO})`,
        }}
      >

        {/* STATS BAR */}
        <section
          ref={statsRef}
          style={{
            padding: "32px 16px",
            background: "rgba(19,25,41,0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, textAlign: "center" }}>
            <div>
              <p style={{ fontSize: 30, fontWeight: 700, color: "#00c896", margin: 0 }}>
                {totalReports === null
                  ? <span style={{ display: "inline-block", width: 40, height: 32, background: "#374151", borderRadius: 4 }} />
                  : totalReports}
              </p>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Total Reports</p>
            </div>
            <div>
              <p style={{ fontSize: 30, fontWeight: 700, color: "#00c896", margin: 0 }}>{resolvedCount}</p>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Resolved</p>
            </div>
            <div>
              <p style={{ fontSize: 30, fontWeight: 700, color: "#00c896", margin: 0 }}>5+</p>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Active Wards</p>
            </div>
          </div>
        </section>

        {/* LIVE FEED */}
        <section style={{ maxWidth: 768, margin: "0 auto", padding: "48px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "redpulse 1.5s ease-in-out infinite" }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "white", margin: 0 }}>Live on Blockchain</h2>
          </div>
          <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 24 }}>
            Real-time report activity from Polygon Amoy
          </p>
          {feedLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="echo-card">
                  <div style={{ height: 16, background: "#e5e7eb", borderRadius: 4, width: "75%", marginBottom: 12 }} />
                  <div style={{ height: 12, background: "#e5e7eb", borderRadius: 4, width: "50%", marginBottom: 8 }} />
                  <div style={{ height: 12, background: "#e5e7eb", borderRadius: 4, width: "33%" }} />
                </div>
              ))}
            </div>
          ) : feed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
              No reports yet. Be the first to report a problem.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {feed.map((report) => (
                <ActivityFeedCard key={report.id} report={report} />
              ))}
            </div>
          )}
          {lastUpdated && (
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 16, textAlign: "center" }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </section>

        <div style={{ height: 100 }} />
        <NepalNewsSection />
      </div>

      <style>{`
        @keyframes redpulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}