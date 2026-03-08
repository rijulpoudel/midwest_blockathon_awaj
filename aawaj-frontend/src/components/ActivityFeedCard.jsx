import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import useIPFSImage from "../hooks/useIPFSImage";
import { CATEGORY_ICONS } from "../constants";

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ActivityFeedCard({ report }) {
  const navigate = useNavigate();
  const icon = CATEGORY_ICONS[report.category] || "📋";
  const imageUrl = useIPFSImage(report.ipfsHash);

  return (
    <div
      onClick={() => navigate(`/track?id=${report.id}`)}
      className="cursor-pointer hover:scale-[1.01] transition-all duration-200"
      style={{
        background: "rgba(10, 14, 36, 0.60)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1.5px solid rgba(100, 160, 220, 0.35)",
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
        minHeight: 200,
      }}
    >
      {/* Left: Large image */}
      {imageUrl ? (
        <div
          style={{
            width: 260,
            minHeight: 200,
            flexShrink: 0,
            position: "relative",
          }}
        >
          <img
            src={imageUrl}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => {
              e.target.parentElement.style.display = "none";
            }}
          />
        </div>
      ) : (
        <div
          style={{
            width: 260,
            minHeight: 200,
            flexShrink: 0,
            background: "rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
          }}
        >
          {icon}
        </div>
      )}

      {/* Right: Content */}
      <div
        style={{
          flex: 1,
          padding: "28px 32px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 20, color: "#60a5fa" }}>✓</span>
          <span style={{ fontSize: 15, color: "rgba(255,255,255,0.65)" }}>
            📍 {report.location}
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 13,
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
              padding: "2px 10px",
              borderRadius: 999,
              fontFamily: "monospace",
            }}
          >
            #{report.id}
          </span>
        </div>

        <h3
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "white",
            margin: "0 0 10px 0",
            lineHeight: 1.2,
          }}
        >
          {icon} {report.category}
        </h3>

        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {report.reporter?.slice(0, 6)}...{report.reporter?.slice(-4)} ·{" "}
          {report.timestamp instanceof Date
            ? timeAgo(report.timestamp)
            : timeAgo(new Date(report.timestamp * 1000))}
        </p>

        <div style={{ marginTop: 14 }}>
          <StatusBadge status={report.status} />
        </div>
      </div>
    </div>
  );
}
