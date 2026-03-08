import StatusBadge from "./StatusBadge";
import useIPFSImage from "../hooks/useIPFSImage";

export default function ReportCard({ report }) {
  const imageUrl = useIPFSImage(report.ipfsHash);

  return (
    <div className="card overflow-hidden">
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
          <span className="text-sm font-semibold text-accent-blue">
            Report #{report.id}
          </span>
          <StatusBadge status={report.status} />
        </div>
        <p className="text-sm">
          <span className="font-medium text-white">Location:</span>{" "}
          <span className="text-body">{report.location}</span>
        </p>
        <p className="text-sm">
          <span className="font-medium text-white">Category:</span>{" "}
          <span className="text-body">{report.category}</span>
        </p>
        <p className="text-xs text-muted">
          Submitted by: {report.reporter?.slice(0, 6)}...
          {report.reporter?.slice(-4)}
        </p>
        <p className="text-xs text-muted">
          {report.timestamp instanceof Date
            ? report.timestamp.toLocaleString()
            : new Date(report.timestamp * 1000).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
