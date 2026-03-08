import { STATUS_LABELS } from "../constants";

const STATUS_COLORS = [
  "bg-yellow-900 text-yellow-300", // 0 Submitted
  "bg-blue-900 text-blue-300", // 1 In Review
  "bg-orange-900 text-orange-300", // 2 Ward
  "bg-orange-800 text-orange-200", // 3 Municipality
  "bg-red-900 text-red-300", // 4 Province
  "bg-red-800 text-red-200", // 5 Federal
  "bg-cyan-900 text-cyan-300", // 6 Gov Resolved
  "bg-green-900 text-green-300", // 7 Confirmed
  "bg-pink-900 text-pink-300", // 8 Disputed
];

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
        STATUS_COLORS[status] || "bg-gray-800 text-gray-300"
      }`}
    >
      {STATUS_LABELS[status] || "Unknown"}
    </span>
  );
}
