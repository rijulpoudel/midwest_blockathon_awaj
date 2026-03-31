import { BrowserProvider, JsonRpcProvider, Contract } from "ethers";
import EchoRegistryABI from "../contracts/EchoRegistry.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

/**
 * Get a BrowserProvider connected to MetaMask.
 * Use this when the user needs to sign transactions (submit, update).
 */
export function getProvider() {
  if (!window.ethereum) {
    throw new Error(
      "MetaMask not detected. Please install MetaMask to use this app.",
    );
  }
  return new BrowserProvider(window.ethereum);
}

/**
 * Get a signer from MetaMask — needed for any write transaction.
 * Use getSigner() when the user is submitting or updating a report.
 */
export async function getSigner() {
  const provider = getProvider();
  return await provider.getSigner();
}

/**
 * Build a Contract instance with a given signer or provider.
 * @param {Signer|Provider} signerOrProvider
 */
export function getContract(signerOrProvider) {
  return new Contract(CONTRACT_ADDRESS, EchoRegistryABI, signerOrProvider);
}

/**
 * Get a read-only Contract instance using a public JSON-RPC URL.
 * Use this for free reads (getReport, getReportCount) — no MetaMask needed.
 */
export function getReadOnlyContract() {
  const provider = new JsonRpcProvider(import.meta.env.VITE_RPC_URL);
  return new Contract(CONTRACT_ADDRESS, EchoRegistryABI, provider);
}
