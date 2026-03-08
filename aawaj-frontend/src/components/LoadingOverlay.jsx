import LoadingSpinner from "./LoadingSpinner";

/**
 * LoadingOverlay — Dark fullscreen overlay with spinner + message
 *
 * Props:
 *   show (boolean)    — whether to render the overlay
 *   message (string)  — text shown below the spinner
 */
export default function LoadingOverlay({ show, message }) {
  if (!show) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div
        className="rounded-2xl p-8 flex flex-col items-center gap-4 max-w-sm mx-4"
        style={{
          background: "rgba(20,27,39,0.9)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <LoadingSpinner />
        <p className="text-white font-medium text-center text-sm">{message}</p>
      </div>
    </div>
  );
}