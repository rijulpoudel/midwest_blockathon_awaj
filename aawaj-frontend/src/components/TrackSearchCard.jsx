import { useState } from "react";
import { Search } from "lucide-react";

export default function TrackSearchCard({ onSearch }) {
  const [reportId, setReportId] = useState("");

  function handleSearch() {
    if (!reportId.trim()) return;
    onSearch?.(reportId.trim());
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div
      className="w-full max-w-5xl rounded-3xl p-10 flex flex-col items-center gap-4 justify-center"
      style={{
        background: "rgba(180, 195, 210, 0.2)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.25)",
      }}
    >
      <h2 className="text-2xl font-bold text-black tracking-widest text-center">
        SEARCH WITH YOUR ID
      </h2>
      <p className="text-sm text-gray-600 text-center">
        Your report ID only!
      </p>

      <input
        type="text"
        value={reportId}
        onChange={(e) => setReportId(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your ID"
        className="w-full bg-white text-gray-800 rounded-xl px-4 py-3 text-base focus:outline-none placeholder-gray-400"
      />
    </div>
  );
}