import { ESCALATION_LEVELS } from "../constants";

export default function EscalationTimeline({ currentStatus }) {
  const steps = [
    { status: 0, label: "Submitted", icon: "📝" },
    { status: 1, label: "In Review", icon: "🔍" },
    ...ESCALATION_LEVELS.map((l) => ({
      status: l.status,
      label: l.label,
      icon: l.icon,
    })),
    { status: 6, label: "Gov Resolved", icon: "✅" },
    ...(currentStatus === 7
      ? [{ status: 7, label: "Confirmed", icon: "🎉" }]
      : currentStatus === 8
        ? [{ status: 8, label: "Disputed", icon: "⚠️" }]
        : currentStatus >= 6
          ? [{ status: -1, label: "Awaiting Citizen", icon: "⏳" }]
          : []),
  ];

  const isEscalated = currentStatus >= 2 && currentStatus <= 5;
  const isResolved = currentStatus >= 6;

  return (
    <>
      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-center justify-between w-full">
        {steps.map((step, i) => {
          const { isActive, isPast } = getStepState(
            step,
            currentStatus,
            isEscalated,
            isResolved,
          );
          return (
            <div
              key={step.status + "-" + i}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm ${
                    isPast
                      ? "bg-green-500 border-green-500 text-white"
                      : isActive
                        ? "bg-[#00c896] border-[#00c896] text-white animate-pulse"
                        : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {isPast ? "✓" : step.icon}
                </div>
                <span
                  className={`text-xs mt-1 whitespace-nowrap ${
                    isActive
                      ? "font-bold text-gray-900"
                      : isPast
                        ? "text-gray-600"
                        : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${isPast ? "bg-green-500" : "bg-gray-300"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden flex flex-col gap-3">
        {steps.map((step, i) => {
          const { isActive, isPast } = getStepState(
            step,
            currentStatus,
            isEscalated,
            isResolved,
          );
          return (
            <div
              key={step.status + "-" + i}
              className="flex items-center gap-3"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs ${
                  isPast
                    ? "bg-green-500 border-green-500 text-white"
                    : isActive
                      ? "bg-[#00c896] border-[#00c896] text-white animate-pulse"
                      : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {isPast ? "✓" : step.icon}
              </div>
              <span
                className={`text-sm ${isActive ? "font-bold text-gray-900" : isPast ? "text-gray-600" : "text-gray-400"}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function getStepState(step, currentStatus, isEscalated, isResolved) {
  let isActive = false;
  let isPast = false;

  if (step.status === -1) {
    isActive = true;
  } else if (step.status <= 1) {
    isPast = currentStatus > step.status;
    isActive = currentStatus === step.status;
  } else if (step.status >= 2 && step.status <= 5) {
    if (isEscalated) {
      isPast = step.status < currentStatus;
      isActive = step.status === currentStatus;
    } else if (isResolved) {
      isPast = step.status <= 5 && currentStatus > step.status;
    }
  } else if (step.status === 6) {
    isPast = currentStatus > 6;
    isActive = currentStatus === 6;
  } else if (step.status === 7 || step.status === 8) {
    isActive = currentStatus === step.status;
  }

  return { isActive, isPast };
}
