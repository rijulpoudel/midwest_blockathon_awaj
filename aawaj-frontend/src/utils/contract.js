import { BrowserProvider, JsonRpcProvider, Contract } from "ethers";
import EchoRegistryABI from "../contracts/EchoRegistry.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export function getProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed. Please install MetaMask.");
  }
  return new BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = getProvider();
  return await provider.getSigner();
}

export function getContract(signerOrProvider) {
  return new Contract(CONTRACT_ADDRESS, EchoRegistryABI, signerOrProvider);
}

export function getReadOnlyContract() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("VITE_CONTRACT_ADDRESS is not set in your .env file.");
  }
  const provider = new JsonRpcProvider(import.meta.env.VITE_RPC_URL);
  return new Contract(CONTRACT_ADDRESS, EchoRegistryABI, provider);
}

export async function getContractWithSigner() {
  const signer = await getSigner();
  return getContract(signer);
}
