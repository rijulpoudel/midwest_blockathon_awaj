import { useState, useEffect, useCallback } from "react";

export default function useWallet() {
  const [account, setAccount] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask not installed. Please install MetaMask to continue.");
      return;
    }
    setIsConnecting(true);
    setError("");
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (err) {
      if (err.code === 4001) {
        setError("Connection rejected. Please try again.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // On mount: silent check if already connected (no popup)
  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts.length > 0) setAccount(accounts[0]);
    });

    // Listen for account changes
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount("");
      } else {
        setAccount(accounts[0]);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return { account, isConnecting, error, connectWallet };
}
