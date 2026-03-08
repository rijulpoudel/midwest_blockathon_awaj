import { useState, useEffect, useRef } from "react";
import useContract from "../hooks/useContract";
import { getReadOnlyContract } from "../utils/contract";
import bgImage from "../assets/home_asset/home-page.png";
import mountainImage from "../assets/home_asset/mountain.png";
import yakImage from "../assets/home_asset/yak.png";
import flowerImage from "../assets/home_asset/flower.png";

const MOUNTAIN_RATIO = 1051 / 1440;
const BG_RATIO = 3381 / 1440;

// yak: 2156x2464 → display at ~180px wide, keeps ratio
// flower: 288x663 → display at ~80px wide, keeps ratio
const YAK_W = 450;
const YAK_H = Math.round(450 * (2464 / 2156)); // ~514px
const FLOWER_W = 200;
const FLOWER_H = Math.round(200 * (663 / 288));  // ~460px

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

export default function HomePage({ account, onConnect, navbarRef }) {
  const { fetchActivityFeed } = useContract();
  const [feed, setFeed] = useState([]);
  const [totalReports, setTotalReports] = useState(null);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [feedLoading, setFeedLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [mountainHeightPx, setMountainHeightPx] = useState(
    window.innerWidth * MOUNTAIN_RATIO
  );
  const textRef = useRef(null);

  useEffect(() => {
    function onScroll() {
      const current = window.scrollY;
      setScrollY(current);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onResize() {
      setMountainHeightPx(window.innerWidth * MOUNTAIN_RATIO);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Hardcoded from console: start=114, stop=209
  function getTextTop() {
    return Math.min(114 + scrollY, 209);
  }

  async function loadFeed() {
    setFeedLoading(true);
    try {
      const reports = await fetchActivityFeed(10);
      setFeed(reports);
      setResolvedCount(reports.filter((r) => r.status === 4).length);
      setLastUpdated(new Date());
    } catch {}
    setFeedLoading(false);
  }

  useEffect(() => {
    async function loadCount() {
      try {
        const contract = getReadOnlyContract();
        const count = await contract.getReportCount();
        setTotalReports(Number(count));
      } catch { setTotalReports(0); }
    }
    loadCount();
    loadFeed();
    const interval = setInterval(loadFeed, 30000);
    return () => clearInterval(interval);
  }, []);

  const textTop = getTextTop();

  // Yak and flower sit flanking the stats bar
  // Stats bar starts at mountainHeightPx, vertically center the images on it
  const statsBarTop = mountainHeightPx;
  const yakTop = statsBarTop - YAK_H * 0.6;    // yak bottom overlaps into stats bar
  const flowerTop = statsBarTop - FLOWER_H * 0.5; // flower same

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: `calc(100vw * ${BG_RATIO})`,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center",
      }}
    >

      {/* z:1 — AAWAJ */}
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
            background: "linear-gradient(164deg, #A0BAD5 0%, #FFFFFF 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            display: "inline-block",
          }}
        >
          AAWAJ
        </span>
      </div>

      {/* z:2 — MOUNTAIN PNG */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 2, pointerEvents: "none", lineHeight: 0 }}>
        <img src={mountainImage} alt="" style={{ width: "100%", display: "block" }} />
      </div>

      {/* z:4 — YAK — left side */}
      <div style={{ position: "absolute", left: 0, top: yakTop, zIndex: 4, pointerEvents: "none" }}>
        <img src={yakImage} alt="Yak" style={{ width: YAK_W, height: YAK_H, display: "block", objectFit: "contain" }} />
      </div>

      {/* z:4 — FLOWER — right side */}
      <div style={{ position: "absolute", right: 0, top: flowerTop, zIndex: 4, pointerEvents: "none" }}>
        <img src={flowerImage} alt="Flower" style={{ width: FLOWER_W, height: FLOWER_H, display: "block", objectFit: "contain" }} />
      </div>

      {/* ── FLOW CONTENT — starts below mountain, each box is a normal div ── */}
      <div style={{ position: "relative", zIndex: 3, paddingTop: 439 }}>

        {/* GLOSSY BOX */}
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
          <div
            style={{
              width: "min(1100px, 70vw)",
              borderRadius: 30,
              padding: "20px 13px 20px 43px",
              background: "linear-gradient(135deg, rgba(255,255,255,0.53) 0%, rgba(255,255,255,0.38) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.55)",
              boxShadow: "0 8px 48px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
              display: "flex",
              flexDirection: "row",
              gap: 0,
            }}
          >
            {/* Span 1 */}
            <div style={{ flex: 1, padding: "0 20px" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 600, color: "#2F3A43", margin: "0 0 10px 0", letterSpacing: "0.01em" }}>
                Your voice, permanent and loud.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 400, color: "white", margin: 0, lineHeight: 1.7 }}>
                The people's record permanent, tamper-proof, forever. When officials deny, when reports disappear, when voices go unheard — Awaj writes it all to the blockchain. Permanently.
              </p>
            </div>

            {/* Span 2 */}
            <div style={{ flex: 1, padding: "0 20px" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 600, color: "#2F3A43", margin: "0 0 10px 0", letterSpacing: "0.01em" }}>
                Speak. Report. Be seen.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 400, color: "white", margin: 0, lineHeight: 1.7 }}>
                Every complaint deserves a witness. Corruption thrives in silence. Awaj makes every civic report public, verified, and impossible to erase — powered by your community and the blockchain.
              </p>
            </div>

            {/* Span 3 */}
            <div style={{ flex: 1, padding: "0 20px" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 600, color: "#2F3A43", margin: "0 0 10px 0", letterSpacing: "0.01em" }}>
                Because someone has to listen.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 400, color: "white", margin: 0, lineHeight: 1.7 }}>
                Built for the districts nobody listens to. From Humla to Kathmandu, every citizen deserves to be heard. Submit your report, get it confirmed by your community, and watch it live on-chain — where no one can touch it.
              </p>
            </div>
          </div>
        </div>

        {/* STATS BAR */}
        <section style={{ padding: "32px 16px", background: "rgba(19,25,41,0.75)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
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