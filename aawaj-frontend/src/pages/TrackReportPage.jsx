import { useState } from "react";
import useContract from "../hooks/useContract";
import ReportCard from "../components/ReportCard";
import EscalationTimeline from "../components/EscalationTimeline";
import LoadingSpinner from "../components/LoadingSpinner";

export default function TrackReportPage() {
  const { fetchReport, isLoading, error } = useContract();
  const [reportId, setReportId] = useState("");
  const [report, setReport] = useState(null);
  const [notFound, setNotFound] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setNotFound(false);
    setReport(null);
    const id = parseInt(reportId, 10);
    if (isNaN(id) || id <= 0) return;
    const result = await fetchReport(id);
    if (result) {
      setReport(result);
    } else {
      setNotFound(true);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Track a Report</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="number"
          min="1"
          value={reportId}
          onChange={(e) => setReportId(e.target.value)}
          placeholder="Enter Report ID"
          required
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          Search
        </button>
      </form>

      {isLoading && <LoadingSpinner />}

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {notFound && (
        <p className="text-gray-500 text-center py-8">
          No report found with that ID.
        </p>
      )}

      {report && (
        <div className="space-y-6">
          <ReportCard report={report} />
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">
              Status Timeline
            </h3>
            <EscalationTimeline currentStatus={report.status} />
          </div>
        </div>
      )}
    </div>
  );
}
