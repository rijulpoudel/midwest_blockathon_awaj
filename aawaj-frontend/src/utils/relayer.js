import { JsonRpcProvider, Wallet, Contract } from "ethers";
import EchoRegistryABI from "../contracts/EchoRegistry.json";

const RELAYER_KEY = import.meta.env.VITE_RELAYER_PRIVATE_KEY;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const RPC_URL =
  import.meta.env.VITE_RPC_URL || "https://rpc-amoy.polygon.technology";

let _wallet = null;
let _contract = null;

function getRelayerContract() {
  if (_contract) return _contract;
  if (!RELAYER_KEY) throw new Error("Relayer private key not configured");
  if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");

  const provider = new JsonRpcProvider(RPC_URL);
  _wallet = new Wallet(RELAYER_KEY, provider);
  _contract = new Contract(CONTRACT_ADDRESS, EchoRegistryABI, _wallet);
  return _contract;
}

/**
 * Submit a report on-chain using the relayer wallet.
 * Citizens never need MetaMask — the relayer pays gas.
 */
export async function submitReportViaRelayer(ipfsHash, location, category) {
  const contract = getRelayerContract();
  const tx = await contract.submitReport(ipfsHash, location, category);
  const receipt = await tx.wait();

  // Parse ReportSubmitted event to get the report ID
  const event = receipt.logs
    .map((log) => {
      try {
        return contract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((e) => e?.name === "ReportSubmitted");

  const reportId = event ? Number(event.args.id) : null;
  if (reportId === null)
    throw new Error("Transaction succeeded but report ID not found in logs");

  return {
    reportId,
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

/**
 * Confirm resolution via relayer (citizen says "yes, it's fixed").
 * Status 7 = ConfirmedResolved
 */
export async function confirmResolutionViaRelayer(reportId) {
  const contract = getRelayerContract();
  const provider = contract.runner.provider;
  const feeData = await provider.getFeeData();
  const minTip = 30000000000n;
  const maxTip =
    feeData.maxPriorityFeePerGas > minTip
      ? feeData.maxPriorityFeePerGas
      : minTip;
  const tx = await contract.updateStatus(reportId, 7, {
    maxPriorityFeePerGas: maxTip,
    maxFeePerGas: (feeData.maxFeePerGas || 50000000000n) + maxTip,
  });
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Dispute resolution via relayer (citizen says "not fixed").
 * Status 8 = Disputed
 */
export async function disputeResolutionViaRelayer(reportId) {
  const contract = getRelayerContract();
  const provider = contract.runner.provider;
  const feeData = await provider.getFeeData();
  const minTip = 30000000000n;
  const maxTip =
    feeData.maxPriorityFeePerGas > minTip
      ? feeData.maxPriorityFeePerGas
      : minTip;
  const tx = await contract.updateStatus(reportId, 8, {
    maxPriorityFeePerGas: maxTip,
    maxFeePerGas: (feeData.maxFeePerGas || 50000000000n) + maxTip,
  });
  const receipt = await tx.wait();
  return receipt.hash;
}
