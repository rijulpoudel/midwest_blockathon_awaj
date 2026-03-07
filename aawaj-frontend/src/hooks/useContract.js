import { useState } from "react";
import { getContractWithSigner, getReadOnlyContract } from "../utils/contract";

export default function useContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitReport(ipfsHash, location, category) {
    setIsLoading(true);
    setError("");
    try {
      const contract = await getContractWithSigner();
      const tx = await contract.submitReport(ipfsHash, location, category);
      const receipt = await tx.wait();

      const event = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e) => e?.name === "ReportSubmitted");

      return event ? Number(event.args.id) : null;
    } catch (err) {
      setError(`Failed to submit report: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function updateReportStatus(reportId, newStatus) {
    setIsLoading(true);
    setError("");
    try {
      const contract = await getContractWithSigner();
      const tx = await contract.updateStatus(reportId, newStatus);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function escalateReport(reportId) {
    setIsLoading(true);
    setError("");
    try {
      const contract = await getContractWithSigner();
      const tx = await contract.escalateReport(reportId);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (err) {
      setError(`Failed to escalate report: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function markPendingConfirmation(reportId) {
    setIsLoading(true);
    setError("");
    try {
      const contract = await getContractWithSigner();
      const tx = await contract.markPendingConfirmation(reportId);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (err) {
      setError(`Failed to mark pending confirmation: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function confirmResolution(reportId) {
    setIsLoading(true);
    setError("");
    try {
      const contract = await getContractWithSigner();
      const tx = await contract.confirmResolution(reportId);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (err) {
      setError(`Failed to confirm resolution: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function disputeResolution(reportId) {
    setIsLoading(true);
    setError("");
    try {
      const contract = await getContractWithSigner();
      const tx = await contract.disputeResolution(reportId);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (err) {
      setError(`Failed to dispute resolution: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchReport(reportId) {
    setIsLoading(true);
    setError("");
    try {
      const contract = getReadOnlyContract();
      const result = await contract.getReport(reportId);
      return {
        id: Number(result.id),
        reporter: result.reporter,
        ipfsHash: result.ipfsHash,
        location: result.location,
        category: result.category,
        status: Number(result.status),
        timestamp: new Date(Number(result.timestamp) * 1000),
        assignedBody: result.assignedBody,
        escalationLevel: Number(result.escalationLevel),
        reporterConfirmed: result.reporterConfirmed,
        lastUpdated: new Date(Number(result.lastUpdated) * 1000),
      };
    } catch (err) {
      setError(`Failed to fetch report: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchActivityFeed(count = 10) {
    setIsLoading(true);
    setError("");
    try {
      const contract = getReadOnlyContract();
      const ids = await contract.getRecentReportIds(count);
      const reports = [];
      for (const rawId of ids) {
        const result = await contract.getReport(Number(rawId));
        reports.push({
          id: Number(result.id),
          reporter: result.reporter,
          ipfsHash: result.ipfsHash,
          location: result.location,
          category: result.category,
          status: Number(result.status),
          timestamp: new Date(Number(result.timestamp) * 1000),
          assignedBody: result.assignedBody,
          escalationLevel: Number(result.escalationLevel),
          reporterConfirmed: result.reporterConfirmed,
          lastUpdated: new Date(Number(result.lastUpdated) * 1000),
        });
      }
      reports.sort((a, b) => b.timestamp - a.timestamp);
      return reports;
    } catch (err) {
      setError(`Failed to fetch activity feed: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }

  return {
    submitReport,
    updateReportStatus,
    escalateReport,
    markPendingConfirmation,
    confirmResolution,
    disputeResolution,
    fetchReport,
    fetchActivityFeed,
    isLoading,
    error,
  };
}
