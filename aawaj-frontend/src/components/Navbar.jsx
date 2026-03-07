import { Link } from "react-router-dom";
import useWallet from "../hooks/useWallet";

export default function Navbar() {
  const { account, connectWallet, isConnecting } = useWallet();

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <Link to="/" className="text-2xl font-bold tracking-wide">
        🔊 Echo
      </Link>

      <div className="hidden md:flex items-center gap-6 text-sm font-medium">
        <Link to="/" className="hover:text-blue-400 transition">
          Home
        </Link>
        <Link to="/submit" className="hover:text-blue-400 transition">
          Submit Report
        </Link>
        <Link to="/track" className="hover:text-blue-400 transition">
          Track Report
        </Link>
        <Link to="/gov" className="hover:text-blue-400 transition">
          Gov Dashboard
        </Link>
      </div>

      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition"
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
