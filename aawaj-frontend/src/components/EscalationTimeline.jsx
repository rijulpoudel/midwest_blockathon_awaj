import { ESCALATION_LEVELS } from "../constants";

export default function EscalationTimeline({ escalationLevel, status }) {
  return (
    <>
      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-center justify-between w-full">
        {ESCALATION_LEVELS.map((lvl, i) => {
          const isPast = i < escalationLevel;
          const isCurrent = i === escalationLevel;
          const isFuture = i > escalationLevel;

          return (
            <div
              key={lvl.level}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm ${
                    isPast
                      ? "bg-green-500 border-green-500 text-white"
                      : isCurrent
                        ? "bg-[#00c896] border-[#00c896] text-white animate-pulse"
                        : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {isPast ? "✓" : lvl.icon}
                </div>
                <span
                  className={`text-xs mt-1 whitespace-nowrap ${
                    isCurrent
                      ? "font-bold text-gray-900"
                      : isFuture
                        ? "text-gray-400"
                        : "text-gray-600"
                  }`}
                >
                  {lvl.name}
                </span>
              </div>
              {i < ESCALATION_LEVELS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${i < escalationLevel ? "bg-green-500" : "bg-gray-300"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden flex flex-col gap-3">
        {ESCALATION_LEVELS.map((lvl, i) => {
          const isPast = i < escalationLevel;
          const isCurrent = i === escalationLevel;

          return (
            <div key={lvl.level} className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs ${
                  isPast
                    ? "bg-green-500 border-green-500 text-white"
                    : isCurrent
                      ? "bg-[#00c896] border-[#00c896] text-white animate-pulse"
                      : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {isPast ? "✓" : lvl.icon}
              </div>
              <span
                className={`text-sm ${isCurrent ? "font-bold text-gray-900" : isPast ? "text-gray-600" : "text-gray-400"}`}
              >
                {lvl.name}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
