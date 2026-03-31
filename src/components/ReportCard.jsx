import StatusBadge from "./StatusBadge";
import useIPFSImage from "../hooks/useIPFSImage";
import { CATEGORY_ICONS } from "../constants";

export default function ReportCard({ report }) {
  const imageUrl = useIPFSImage(report.ipfsHash);
  const icon = CATEGORY_ICONS[report.category] || "📋";

  return (
    <div className="echo-card overflow-hidden">
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Report evidence"
          className="w-full h-48 object-cover rounded-lg mb-4"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      )}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-500">
            Report #{report.id}
          </span>
          <StatusBadge status={report.status} />
        </div>
        <p className="text-sm text-gray-700">
          <span className="font-medium">{icon} Category:</span>{" "}
          {report.category}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">📍 Location:</span> {report.location}
        </p>
        <p className="text-xs text-gray-400">
          Submitted by: {report.reporter?.slice(0, 6)}...
          {report.reporter?.slice(-4)}
        </p>
        <p className="text-xs text-gray-400">
          {report.timestamp instanceof Date
            ? report.timestamp.toLocaleString()
            : new Date(report.timestamp * 1000).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
