import { useState, useEffect, useRef } from "react";
import { getReadOnlyContract } from "../utils/contract";
import ActivityFeedCard from "../components/ActivityFeedCard";
import bgImage from "../assets/home_asset/home-page.png";
import mountainImage from "../assets/home_asset/mountain.png";
import yakImage from "../assets/home_asset/yak.png";
import flowerImage from "../assets/home_asset/flower.png";

const MOUNTAIN_RATIO = 1051 / 1440;
const BG_RATIO = 3381 / 1440;
const YAK_W = 450;
const YAK_H = Math.round(450 * (2464 / 2156));
const FLOWER_W = 200;
const FLOWER_H = Math.round(200 * (663 / 288));

// ── Gemini AI Fact Section ─────────────────────────────────────
function GeminiFactSection() {
  const [fact, setFact] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchFact(attempt = 0) {
    setLoading(true);
    setError(null);
    try {
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      if (!API_KEY) {
        setError("hidden");
        setLoading(false);
        return;
      }
      const prompt =
        "Give me one powerful, concise fact (2-3 sentences max) about corruption in Nepal and why transparent citizen reporting matters. Focus on real statistics or situations. Do not use markdown formatting. Just plain text.";
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 400,
            },
          }),
        },
      );
      if (res.status === 429 && attempt < 2) {
        // Rate limited — wait and retry
        await new Promise((r) => setTimeout(r, (attempt + 1) * 5000));
        return fetchFact(attempt + 1);
      }
      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        console.error("Gemini API error:", res.status, errBody);
        throw new Error("Gemini API error");
      }
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      setFact(text.trim());
    } catch {
      setError("Could not load fact.");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchFact();
  }, []);

  if (error === "hidden") return null;

  return (
    <section
      style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px 40px" }}
    >
      <div
        style={{
          borderRadius: 24,
          padding: "56px 56px",
          minHeight: 260,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background:
            "linear-gradient(0deg, rgba(10, 14, 36, 0.35) 0%, rgba(10, 14, 36, 0.22) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1.5px solid rgba(100, 160, 220, 0.30)",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 28 }}>✦</span>
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: "white",
              margin: 0,
              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            Did You Know?
          </h2>
          <span style={{ fontSize: 28 }}>✦</span>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: "70%",
                height: 14,
                background: "rgba(255,255,255,0.15)",
                borderRadius: 4,
              }}
            />
            <div
              style={{
                width: "50%",
                height: 14,
                background: "rgba(255,255,255,0.10)",
                borderRadius: 4,
              }}
            />
          </div>
        ) : error ? (
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            {error}
          </p>
        ) : (
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 20,
              color: "rgba(255,255,255,0.95)",
              lineHeight: 1.8,
              margin: 0,
              maxWidth: 760,
              textShadow: "0 1px 6px rgba(0,0,0,0.3)",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {fact}
          </p>
        )}

        <button
          onClick={fetchFact}
          disabled={loading}
          style={{
            marginTop: 28,
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "white",
            fontSize: 15,
            fontWeight: 600,
            padding: "10px 24px",
            borderRadius: 999,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            transition: "all 0.2s",
          }}
        >
          {loading ? "Loading…" : "↻ New Fact"}
        </button>

        <p
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            marginTop: 16,
          }}
        >
          Powered by Gemini AI
        </p>
      </div>
    </section>
  );
}

function NepalNewsSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        const API_KEY = import.meta.env.VITE_GNEWS_API_KEY;
        if (!API_KEY) {
          setError("hidden");
          setLoading(false);
          return;
        }
        const res = await fetch(
          `https://gnews.io/api/v4/search?q=nepal+government+OR+nepal+civic&lang=en&max=2&apikey=${encodeURIComponent(API_KEY)}`,
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

  if (error === "hidden") return null;

  if (loading) {
    return (
      <section
        style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px 80px" }}
      >
        <div style={{ display: "flex", gap: 100 }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                borderRadius: 16,
                overflow: "hidden",
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(0,200,150,0.18)",
                minHeight: 260,
              }}
            >
              <div style={{ height: 160, background: "#e5e7eb" }} />
              <div style={{ padding: 20 }}>
                <div
                  style={{
                    height: 12,
                    background: "#e5e7eb",
                    borderRadius: 4,
                    width: "75%",
                    marginBottom: 10,
                  }}
                />
                <div
                  style={{
                    height: 12,
                    background: "#e5e7eb",
                    borderRadius: 4,
                    width: "50%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px 80px" }}
      >
        <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
          {error}
        </p>
      </section>
    );
  }

  return (
    <section
      style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px 80px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <span style={{ fontSize: 24 }}>🇳🇵</span>
        <h2
          style={{ fontSize: 24, fontWeight: 700, color: "white", margin: 0 }}
        >
          Nepal in the News
        </h2>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 999,
            background: "rgba(0,200,150,0.12)",
            color: "#00c896",
            marginLeft: 8,
          }}
        >
          Live
        </span>
      </div>
      <div style={{ display: "flex", gap: 100 }}>
        {articles.slice(0, 2).map((article, idx) => (
          <NewsCard key={idx} article={article} />
        ))}
        {articles.length < 2 &&
          Array.from({ length: 2 - articles.length }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              style={{
                flex: 1,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                fontSize: 14,
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
      style={{
        flex: 1,
        display: "block",
        borderRadius: 16,
        overflow: "hidden",
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(0,200,150,0.18)",
        boxShadow: "0 4px 24px rgba(0,200,150,0.07)",
        textDecoration: "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,200,150,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,200,150,0.07)";
      }}
    >
      {article.image ? (
        <div style={{ height: 176, overflow: "hidden", background: "#f3f4f6" }}>
          <img
            src={article.image}
            alt={article.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.target.parentElement.style.display = "none";
            }}
          />
        </div>
      ) : (
        <div
          style={{
            height: 96,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, rgba(0,200,150,0.12), rgba(10,14,26,0.08))",
          }}
        >
          <span style={{ color: "#d1d5db", fontSize: 14 }}>No image</span>
        </div>
      )}
      <div style={{ padding: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          {article.source?.name && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 999,
                background: "rgba(0,200,150,0.12)",
                color: "#00a87a",
              }}
            >
              {article.source.name}
            </span>
          )}
          {date && (
            <span
              style={{ fontSize: 12, color: "#6b7280", marginLeft: "auto" }}
            >
              {date}
            </span>
          )}
        </div>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#1f2937",
            lineHeight: 1.4,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </h3>
        <p
          style={{
            fontSize: 12,
            color: "#9ca3af",
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>📍</span> Nepal
        </p>
      </div>
    </a>
  );
}

export default function HomePage() {
  const [feed, setFeed] = useState([]);
  const [totalReports, setTotalReports] = useState(null);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [feedLoading, setFeedLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [mountainHeightPx, setMountainHeightPx] = useState(
    window.innerWidth * MOUNTAIN_RATIO,
  );
  const textRef = useRef(null);

  useEffect(() => {
    function onScroll() {
      setScrollY(window.scrollY);
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

  function getTextTop() {
    return Math.min(114 + scrollY, 209);
  }

  // Load reports from blockchain events
  async function loadFeed() {
    setFeedLoading(true);
    try {
      const contract = getReadOnlyContract();
      const count = Number(await contract.getReportCount());
      setTotalReports(count);

      const reports = [];
      const start = Math.max(1, count - 9);
      for (let i = count; i >= start; i--) {
        try {
          const r = await contract.getReport(i);
          reports.push({
            id: Number(r.id),
            reporter: r.submitter,
            ipfsHash: r.ipfsCid,
            location: r.location,
            category: r.category,
            status: Number(r.status),
            timestamp: Number(r.timestamp),
          });
        } catch {
          /* skip */
        }
      }
      setFeed(reports);
      setResolvedCount(reports.filter((r) => r.status === 7).length);
      setLastUpdated(new Date());
    } catch {
      /* silent */
    }
    setFeedLoading(false);
  }

  useEffect(() => {
    loadFeed();
    const interval = setInterval(loadFeed, 30000);
    return () => clearInterval(interval);
  }, []);

  const textTop = getTextTop();
  const statsBarTop = mountainHeightPx;
  const yakTop = statsBarTop - YAK_H * 0.6;
  const flowerTop = statsBarTop - FLOWER_H * 0.5;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: `calc(100vw * ${BG_RATIO})`,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "115% auto",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center",
      }}
    >
      {/* z:1 — AAWAJ text */}
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

      {/* z:2 — Mountain PNG */}
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

      {/* z:4 — Yak left */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: yakTop,
          zIndex: 4,
          pointerEvents: "none",
        }}
      >
        <img
          src={yakImage}
          alt="Yak"
          style={{
            width: YAK_W,
            height: YAK_H,
            display: "block",
            objectFit: "contain",
          }}
        />
      </div>

      {/* z:4 — Flower right */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: flowerTop,
          zIndex: 4,
          pointerEvents: "none",
        }}
      >
        <img
          src={flowerImage}
          alt="Flower"
          style={{
            width: FLOWER_W,
            height: FLOWER_H,
            display: "block",
            objectFit: "contain",
          }}
        />
      </div>

      {/* z:3 — Page content */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          paddingTop: `${mountainHeightPx * 0.62}px`,
        }}
      >
        {/* Glossy text box */}
        <div style={{ padding: "0px 60px 10px 70px" }}>
          <div
            style={{
              width: "100%",
              borderRadius: 60,
              padding: "50px 20px",
              background:
                "linear-gradient(0deg, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.55) 100%)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              display: "flex",
              flexDirection: "row",
              gap: 10,
            }}
          >
            <div style={{ flex: 1, padding: "0 24px" }}>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 18,
                  color: "#2F3A43",
                  margin: "0 0 8px 0",
                  letterSpacing: "0.01em",
                }}
              >
                ✧˖°
                <br />
                <strong>Your voice, permanent and loud.</strong>
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  color: "white",
                  margin: 0,
                  lineHeight: 1.75,
                }}
              >
                The people&apos;s record — permanent, tamper-proof, forever.{" "}
                <br />
                When officials deny, when reports disappear, when voices go
                unheard — Aawaj writes it all to the blockchain. Permanently.
              </p>
            </div>
            <div style={{ flex: 1, padding: "0 24px" }}>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 18,
                  color: "#2F3A43",
                  margin: "0 0 10px 0",
                  letterSpacing: "0.01em",
                }}
              >
                ✧˖°
                <br />
                <strong>Speak. Report. Be seen.</strong>
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  color: "white",
                  margin: 0,
                  lineHeight: 1.75,
                }}
              >
                Every complaint deserves a witness. Corruption thrives in
                silence.
                <br />
                Aawaj makes every civic report public, verified, and impossible
                to erase — powered by your community and the blockchain.
              </p>
            </div>
            <div style={{ flex: 1, padding: "0 24px" }}>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 18,
                  color: "#2F3A43",
                  margin: "0 0 10px 0",
                  letterSpacing: "0.01em",
                }}
              >
                ✧˖°
                <br />
                <strong>Because someone has to listen.</strong>
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  color: "white",
                  margin: 0,
                  lineHeight: 1.75,
                }}
              >
                Built for the districts nobody listens to. From Humla to
                Kathmandu, every citizen deserves to be heard. Submit your
                report, get it confirmed by your community, and watch it live
                on-chain — where no one can touch it.
              </p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <section
          style={{
            padding: "20px 16px",
            background: "rgba(10, 14, 36, 0.45)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              maxWidth: 520,
              margin: "0 auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 60,
              textAlign: "center",
            }}
          >
            <div style={{ minWidth: 100 }}>
              <p
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {totalReports === null ? (
                  <span
                    style={{
                      display: "inline-block",
                      width: 40,
                      height: 32,
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: 4,
                    }}
                  />
                ) : (
                  totalReports
                )}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.85)",
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                Total Reports
              </p>
            </div>
            <div
              style={{
                width: 1,
                height: 40,
                background: "rgba(255,255,255,0.25)",
              }}
            />
            <div style={{ minWidth: 100 }}>
              <p
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {resolvedCount}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.85)",
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                Resolved
              </p>
            </div>
            <div
              style={{
                width: 1,
                height: 40,
                background: "rgba(255,255,255,0.25)",
              }}
            />
            <div style={{ minWidth: 100 }}>
              <p
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                5+
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.85)",
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                Active Wards
              </p>
            </div>
          </div>
        </section>

        {/* Live feed */}
        <section
          style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#ef4444",
                display: "inline-block",
                animation: "redpulse 1.5s ease-in-out infinite",
              }}
            />
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "white",
                margin: 0,
              }}
            >
              Live on Blockchain
            </h2>
          </div>
          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.55)",
              marginBottom: 24,
            }}
          >
            Real-time report activity from Polygon Amoy
          </p>

          {feedLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="echo-card">
                  <div
                    style={{
                      height: 16,
                      background: "#e5e7eb",
                      borderRadius: 4,
                      width: "75%",
                      marginBottom: 12,
                    }}
                  />
                  <div
                    style={{
                      height: 12,
                      background: "#e5e7eb",
                      borderRadius: 4,
                      width: "50%",
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      height: 12,
                      background: "#e5e7eb",
                      borderRadius: 4,
                      width: "33%",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : feed.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 0",
                color: "#9ca3af",
              }}
            >
              No reports yet. Be the first to report a problem.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {feed.map((report) => (
                <ActivityFeedCard key={report.id} report={report} />
              ))}
            </div>
          )}

          {lastUpdated && (
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                marginTop: 16,
                textAlign: "center",
              }}
            >
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </section>

        {/* Nepal News */}
        <NepalNewsSection />

        {/* Gemini AI Fact */}
        <GeminiFactSection />

        {/* Footer */}
        <footer
          style={{
            textAlign: "center",
            padding: "32px 16px 24px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p
            style={{
              fontFamily: "'Noto Serif', serif",
              fontSize: 18,
              fontWeight: 700,
              color: "rgba(255,255,255,0.6)",
              margin: 0,
              letterSpacing: 2,
            }}
          >
            AAWAJ
          </p>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.3)",
              marginTop: 6,
            }}
          >
            © {new Date().getFullYear()} Aawaj — Your voice on the blockchain.
          </p>
        </footer>
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
