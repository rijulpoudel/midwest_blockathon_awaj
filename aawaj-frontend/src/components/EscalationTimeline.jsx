import { STATUS_LABELS, ESCALATION_LEVELS } from "../constants";

/**
 * Full status timeline showing:
 *  Submitted → In Review → Escalation chain (Ward→Muni→Province→Federal) → Resolution
 */
export default function EscalationTimeline({ currentStatus }) {
  // Build the full timeline steps
  const steps = [
    { status: 0, label: "Submitted", icon: "📝" },
    { status: 1, label: "In Review", icon: "🔍" },
    ...ESCALATION_LEVELS,
    { status: 6, label: "Gov Resolved", icon: "✅" },
    ...(currentStatus === 7
      ? [{ status: 7, label: "Confirmed", icon: "🎉" }]
      : currentStatus === 8
        ? [{ status: 8, label: "Disputed", icon: "⚠️" }]
        : currentStatus >= 6
          ? [{ status: -1, label: "Awaiting Citizen", icon: "⏳" }]
          : []),
  ];

  // Figure out where the current status falls in the escalation chain
  // For statuses 2-5, skip levels the report hasn't reached
  const isEscalated = currentStatus >= 2 && currentStatus <= 5;
  const isResolved = currentStatus >= 6;

  return (
    <div className="space-y-1">
      {steps.map((step, i) => {
        let isActive = false;
        let isPast = false;

        if (step.status === -1) {
          // "Awaiting citizen" placeholder — always shown as current
          isActive = true;
        } else if (step.status <= 1) {
          // Submitted / In Review — always past if current > step
          isPast = currentStatus > step.status;
          isActive = currentStatus === step.status;
        } else if (step.status >= 2 && step.status <= 5) {
          // Escalation levels
          if (isEscalated) {
            isPast = step.status < currentStatus;
            isActive = step.status === currentStatus;
          } else if (isResolved) {
            // If resolved, show all escalation up to where it went as past
            // We don't know exactly which levels were hit, so show up to last escalation or skip
            isPast = step.status <= 5 && currentStatus > step.status;
          }
        } else if (step.status === 6) {
          isPast = currentStatus > 6;
          isActive = currentStatus === 6;
        } else if (step.status === 7 || step.status === 8) {
          isActive = currentStatus === step.status;
        }

        const showLine = i < steps.length - 1;

        return (
          <div key={step.status + "-" + i} className="flex items-start gap-3">
            {/* Node */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  isActive
                    ? "border-accent-blue bg-accent-blue text-white"
                    : isPast
                      ? "border-accent-blue bg-accent-blue/20 text-accent-blue"
                      : "border-gray-600 bg-surface-bg text-gray-500"
                }`}
              >
                {isPast ? "✓" : step.icon}
              </div>
              {showLine && (
                <div
                  className={`w-0.5 h-6 ${
                    isPast ? "bg-accent-blue" : "bg-gray-700"
                  }`}
                />
              )}
            </div>

            {/* Label */}
            <div className="pt-1.5">
              <p
                className={`text-sm font-medium ${
                  isActive
                    ? "text-white"
                    : isPast
                      ? "text-accent-blue"
                      : "text-muted"
                }`}
              >
                {step.label}
              </p>
              {isActive && step.status !== -1 && (
                <p className="text-xs text-accent-blue mt-0.5">
                  Current status
                </p>
              )}
              {isActive && step.status === -1 && (
                <p className="text-xs text-yellow-400 mt-0.5">
                  Citizen must confirm or dispute
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
