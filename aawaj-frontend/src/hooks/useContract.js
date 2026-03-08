import { useState } from "react";
import { getSigner, getContract, getReadOnlyContract } from "../utils/contract";

export default function useContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Submit a new report on-chain.
   * @returns {number|null} The new report ID, or null on failure
   */
  async function submitReport(ipfsHash, location, category) {
    setIsLoading(true);
    setError("");
    try {
      const signer = await getSigner();
      const contract = getContract(signer);
      const tx = await contract.submitReport(ipfsHash, location, category);
      const receipt = await tx.wait();

      // Parse the ReportSubmitted event to extract the report ID
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

  /**
   * Update a report's status on-chain (government action).
   * @returns {string|null} The transaction hash, or null on failure
   */
  async function updateReportStatus(reportId, newStatus) {
    setIsLoading(true);
    setError("");
    try {
      const signer = await getSigner();
      const contract = getContract(signer);
      const feeData = await signer.provider.getFeeData();
      const minTip = 30000000000n; // 30 gwei — above Amoy minimum
      const maxTip =
        feeData.maxPriorityFeePerGas > minTip
          ? feeData.maxPriorityFeePerGas
          : minTip;
      const tx = await contract.updateStatus(reportId, newStatus, {
        maxPriorityFeePerGas: maxTip,
        maxFeePerGas: (feeData.maxFeePerGas || 50000000000n) + maxTip,
      });
      await tx.wait();
      return tx.hash;
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Fetch a report by ID — free read, no signer needed.
   * @returns {Object|null} The formatted report object, or null on failure
   */
  async function fetchReport(reportId) {
    setIsLoading(true);
    setError("");
    try {
      const contract = getReadOnlyContract();
      const result = await contract.getReport(reportId);
      return {
        id: Number(result.id),
        reporter: result.submitter,
        ipfsHash: result.ipfsCid,
        location: result.location,
        category: result.category,
        status: Number(result.status),
        timestamp: new Date(Number(result.timestamp) * 1000),
      };
    } catch (err) {
      setError(`Failed to fetch report: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { submitReport, updateReportStatus, fetchReport, isLoading, error };
}
