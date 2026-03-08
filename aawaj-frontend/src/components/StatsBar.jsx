import { useEffect, useState } from "react";
import { CheckCircle, Play, Target } from "lucide-react";
import { getReadOnlyContract } from "../utils/contract";

export default function StatsBar() {
  const [total, setTotal] = useState("—");
  const [resolved, setResolved] = useState("—");
  const [wards, setWards] = useState("5+");

  useEffect(() => {
    async function loadStats() {
      try {
        const contract = getReadOnlyContract();
        const count = await contract.getReportCount();
        const totalNum = Number(count);
        setTotal(totalNum);

        // fetch all reports to count resolved (status === 4)
        let resolvedCount = 0;
        const ids = await contract.getRecentReportIds(totalNum);
        for (const rawId of ids) {
          const r = await contract.getReport(Number(rawId));
          if (Number(r.status) === 4) resolvedCount++;
        }
        setResolved(resolvedCount);
      } catch {
        // contract not available, keep defaults
      }
    }
    loadStats();
  }, []);

  const stats = [
    { icon: <CheckCircle size={22} />, value: total, label: "Total Reports" },
    { icon: <Play size={22} />, value: resolved, label: "Resolved" },
    { icon: <Target size={22} />, value: wards, label: "Active Wards" },
  ];

  return (
    <div
      className="w-full rounded-3xl px-8 py-6 flex items-center justify-around"
      style={{
        background: "rgba(180, 195, 210, 0.2)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.25)",
      }}
    >
      {stats.map((stat, i) => (
        <>
          <div key={stat.label} className="flex flex-col items-center gap-1">
            <span className="text-black">{stat.icon}</span>
            <span className="text-black text-3xl font-bold">{stat.value}</span>
            <span className="text-gray-600 text-sm">{stat.label}</span>
          </div>
          {i < stats.length - 1 && (
            <div className="h-10 w-px bg-black/20" />
          )}
        </>
      ))}
    </div>
  );
}