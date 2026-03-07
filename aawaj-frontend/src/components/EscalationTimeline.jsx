import { STATUS_LABELS } from "../constants";

const STEP_COLORS = [
  "border-yellow-500 bg-yellow-50",
  "border-blue-500 bg-blue-50",
  "border-green-500 bg-green-50",
  "border-red-500 bg-red-50",
];

export default function EscalationTimeline({ currentStatus }) {
  return (
    <div className="flex flex-col gap-2">
      {STATUS_LABELS.map((label, i) => (
        <div key={label} className="flex items-center gap-3">
          <div
            className={`w-4 h-4 rounded-full border-2 ${
              i <= currentStatus ? STEP_COLORS[i] : "border-gray-300 bg-white"
            }`}
          />
          <span
            className={`text-sm ${
              i <= currentStatus
                ? "font-semibold text-gray-800"
                : "text-gray-400"
            }`}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
