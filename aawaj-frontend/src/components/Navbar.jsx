import { Link, useLocation } from "react-router-dom";

export default function Navbar({ account, onConnect }) {
  const { pathname } = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/submit", label: "Submit Report" },
    { to: "/track", label: "Track Report" },
  ];

  return (
    <nav className="bg-[#0a0e1a] text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <Link
        to="/"
        className="text-2xl font-bold tracking-wide"
        style={{ color: "#00c896" }}
      >
        ECHO 🇳🇵
      </Link>

      <div className="hidden md:flex items-center gap-6 text-sm font-medium">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`transition pb-1 ${
              pathname === link.to
                ? "text-white border-b-2 border-[#00c896]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <button
        onClick={onConnect}
        className="flex items-center gap-2 bg-[#00c896] hover:bg-[#00a67d] px-4 py-2 rounded-lg text-sm font-medium transition"
      >
        {account ? (
          <>
            <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            {account.slice(0, 6)}...{account.slice(-4)}
          </>
        ) : (
          "Connect Wallet"
        )}
      </button>
    </nav>
  );
}
