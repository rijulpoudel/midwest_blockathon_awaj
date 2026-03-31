import { STATUS_CONFIG } from "../constants";

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: "Unknown",
    color: "bg-gray-100 text-gray-800",
    dot: "bg-gray-400",
  };
  const showPulse = status === 0 || status === 6;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.color}`}
    >
      {showPulse && (
        <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      )}
      {config.label}
    </span>
  );
}
