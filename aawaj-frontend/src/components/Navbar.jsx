import { Link } from "react-router-dom";
import useWallet from "../hooks/useWallet";

export default function Navbar() {
  const { account, connectWallet, isConnecting } = useWallet();

  return (
    <nav className="bg-surface-card text-white px-6 py-4 flex items-center justify-between border-b border-surface-border">
      <Link to="/" className="text-2xl font-bold tracking-wide">
        � AAWAJ
      </Link>

      <div className="hidden md:flex items-center gap-6 text-sm font-medium">
        <Link to="/" className="hover:text-accent-blue transition">
          Home
        </Link>
        <Link to="/submit" className="hover:text-accent-blue transition">
          Submit Report
        </Link>
        <Link to="/track" className="hover:text-accent-blue transition">
          Track Report
        </Link>
        <Link to="/gov" className="hover:text-accent-blue transition">
          Gov Dashboard
        </Link>
      </div>

      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
      >
        {isConnecting
          ? "Connecting..."
          : account
            ? `${account.slice(0, 6)}...${account.slice(-4)}`
            : "Connect Wallet"}
      </button>
    </nav>
  );
}
