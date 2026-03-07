import { useState } from "react";
import useWallet from "../hooks/useWallet";
import useContract from "../hooks/useContract";
import ReportCard from "../components/ReportCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { STATUS_LABELS } from "../constants";

export default function GovDashboardPage() {
  const { account, connectWallet } = useWallet();
  const { fetchReport, updateReportStatus, isLoading, error } = useContract();

  const [reportId, setReportId] = useState("");
  const [report, setReport] = useState(null);
  const [newStatus, setNewStatus] = useState(1);
  const [success, setSuccess] = useState(false);

  async function handleLookup(e) {
    e.preventDefault();
    setSuccess(false);
    setReport(null);
    const id = parseInt(reportId, 10);
    if (isNaN(id) || id <= 0) return;
    const result = await fetchReport(id);
    if (result) setReport(result);
  }

  async function handleUpdate() {
    if (!account) {
      await connectWallet();
      return;
    }
    setSuccess(false);
    const txHash = await updateReportStatus(report.id, newStatus);
    if (txHash) {
      setSuccess(true);
      // Refresh report
      const updated = await fetchReport(report.id);
      if (updated) setReport(updated);
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Government Dashboard
      </h1>
      <p className="text-gray-500 mb-6 text-sm">
        Only the government wallet that deployed the contract can update
        statuses.
      </p>

      {!account && (
        <button
          onClick={connectWallet}
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          Connect Government Wallet
        </button>
      )}

      <form onSubmit={handleLookup} className="flex gap-3 mb-8">
        <input
          type="number"
          min="1"
          value={reportId}
          onChange={(e) => setReportId(e.target.value)}
          placeholder="Report ID"
          required
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          Lookup
        </button>
      </form>

      {isLoading && <LoadingSpinner />}
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {report && (
        <div className="space-y-6">
          <ReportCard report={report} />

          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-800">Update Status</h3>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_LABELS.map((label, i) => (
                    <option key={label} value={i}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleUpdate}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Update On-Chain
              </button>
            </div>
            {success && (
              <p className="text-green-600 text-sm font-medium">
                ✅ Status updated successfully on-chain!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
