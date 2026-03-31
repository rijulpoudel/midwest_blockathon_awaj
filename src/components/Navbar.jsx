import { Link, useLocation } from "react-router-dom";
import useWallet from "../hooks/useWallet";
import searchIcon from "../assets/home_asset/search.png";

export default function Navbar() {
  const { pathname } = useLocation();
  const { account, connectWallet } = useWallet();

  const links = [
    { to: "/", label: "HOME" },
    { to: "/submit", label: "SUBMIT REPORT" },
    { to: "/track", label: "TRACK REPORT" },
    { to: "/gov", label: "GOV DASHBOARD" },
  ];

  return (
    <nav
      style={{
        background: "rgba(5, 12, 49, 0.35)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: "12px 24px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "94px",
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "25px",
            fontWeight: 700,
            color: "white",
            textDecoration: "none",
            letterSpacing: "0.01em",
            lineHeight: 1,
          }}
        >
          Aawaj
        </Link>

        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: "13px",
              color: pathname === link.to ? "white" : "#7393B5",
              textDecoration: "none",
              transition: "color 0.2s ease",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              if (pathname !== link.to) e.currentTarget.style.color = "#97AED1";
            }}
            onMouseLeave={(e) => {
              if (pathname !== link.to) e.currentTarget.style.color = "#7393B5";
            }}
          >
            {link.label}
          </Link>
        ))}

        <img
          src={searchIcon}
          alt="Search"
          style={{
            width: 34,
            height: 34,
            opacity: 0.7,
            cursor: "pointer",
            display: "block",
          }}
        />

        <button
          onClick={connectWallet}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "13px",
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "10px",
            padding: "6px 16px",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "background 0.2s ease",
            lineHeight: 1,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.14)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
          }
        >
          {account ? (
            <>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#00c896",
                  display: "inline-block",
                  animation: "walletPulse 1.5s ease-in-out infinite",
                }}
              />
              {account.slice(0, 6)}...{account.slice(-4)}
            </>
          ) : (
            "Connect Wallet"
          )}
        </button>
      </div>

      <style>{`
        @keyframes walletPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.85); }
        }
      `}</style>
    </nav>
  );
}
