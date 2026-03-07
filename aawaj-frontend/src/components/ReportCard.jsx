import StatusBadge from "./StatusBadge";
import { getIPFSUrl } from "../utils/pinata";

export default function ReportCard({ report }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      {report.ipfsHash && (
        <img
          src={getIPFSUrl(report.ipfsHash)}
          alt="Report evidence"
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-500">
            Report #{report.id}
          </span>
          <StatusBadge status={report.status} />
        </div>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Location:</span> {report.location}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Category:</span> {report.category}
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
