import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { CATEGORY_ICONS, STATUS_CONFIG, ESCALATION_LEVELS } from "../constants";
import useIPFSImage from "../hooks/useIPFSImage";

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityFeedCard({ report }) {
  const navigate = useNavigate();
  const icon = CATEGORY_ICONS[report.category] || "📋";
  const statusConfig = STATUS_CONFIG[report.status] || {};
  const levelName = ESCALATION_LEVELS[report.escalationLevel]?.name || "Ward";
  const imageUrl = useIPFSImage(report.ipfsHash);

  const borderColors = {
    0: "border-l-yellow-400",
    1: "border-l-blue-400",
    2: "border-l-orange-400",
    3: "border-l-purple-400",
    4: "border-l-green-400",
    5: "border-l-red-400",
  };

  return (
    <div
      onClick={() => navigate(`/track/${report.id}`)}
      className={`echo-card border-l-4 ${borderColors[report.status] || "border-l-gray-300"} cursor-pointer hover:shadow-md transition-shadow`}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Evidence"
          className="w-full h-36 object-cover rounded-lg mb-3"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{icon}</span>
            <span className="font-semibold text-gray-800 text-sm truncate">
              {report.category}
            </span>
            <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 font-mono">
              #{report.id}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate">📍 {report.location}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>
              {report.reporter?.slice(0, 6)}...{report.reporter?.slice(-4)}
            </span>
            <span>•</span>
            <span>{levelName} Level</span>
            <span>•</span>
            <span>{timeAgo(report.timestamp)}</span>
          </div>
        </div>
        <StatusBadge status={report.status} />
      </div>
    </div>
  );
}
