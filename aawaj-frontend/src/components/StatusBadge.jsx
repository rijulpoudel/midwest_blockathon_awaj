import { STATUS_LABELS } from "../constants";

const STATUS_COLORS = [
  "bg-yellow-100 text-yellow-800", // Submitted
  "bg-blue-100 text-blue-800", // In Review
  "bg-orange-100 text-orange-800", // Escalated
  "bg-green-100 text-green-800", // Resolved
];

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
        STATUS_COLORS[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {STATUS_LABELS[status] || "Unknown"}
    </span>
  );
}
