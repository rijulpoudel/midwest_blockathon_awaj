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

  const borderColors = {
    0: "border-l-yellow-400",
    1: "border-l-blue-400",
    2: "border-l-orange-400",
    3: "border-l-orange-500",
    4: "border-l-red-400",
    5: "border-l-red-500",
    6: "border-l-cyan-400",
    7: "border-l-green-400",
    8: "border-l-pink-400",
  };

  return (
    <div
      onClick={() => navigate(`/track?id=${report.id}`)}
      className={`border-l-4 ${borderColors[report.status] || "border-l-gray-300"} cursor-pointer hover:shadow-lg transition-all`}
      style={{
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 14,
        padding: 18,
        borderLeftWidth: 4,
      }}
    >
      <div className="flex items-start gap-3">
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{icon}</span>
            <span
              className="font-semibold text-sm truncate"
              style={{ color: "white" }}
            >
              {report.category}
            </span>
            <span
              className="text-xs rounded px-1.5 py-0.5 font-mono"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              #{report.id}
            </span>
          </div>
          <p
            className="text-xs truncate"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            📍 {report.location}
          </p>
          <div
            className="flex items-center gap-3 mt-2 text-xs"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <span>
              {report.reporter?.slice(0, 6)}...{report.reporter?.slice(-4)}
            </span>
            <span>•</span>
            <span>
              {report.timestamp instanceof Date
                ? timeAgo(report.timestamp)
                : timeAgo(new Date(report.timestamp * 1000))}
            </span>
          </div>
        </div>
        <StatusBadge status={report.status} />
      </div>
    </div>
  );
}
