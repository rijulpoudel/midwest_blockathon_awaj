import { Link, useLocation } from "react-router-dom";
import searchIcon from "../assets/home_asset/search.png";

const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

export default function Navbar({ account, onConnect }) {
  const { pathname } = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/submit", label: "Submit Report" },
    { to: "/track", label: "Track Report" },
  ];

  return (
    <nav
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "transparent",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "4px",
        paddingTop: "32px",
        paddingBottom: "6px",
        paddingLeft: "24px",
        paddingRight: "24px",
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
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "30px",
            fontWeight: 700,
            color: "white",
            textDecoration: "none",
            letterSpacing: "0.01em",
            lineHeight: 1,
          }}
        >
          Aawaj
        </Link>

        {/* Nav links */}
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: "15px",
              lineHeight: 1,
              color: pathname === link.to ? "white" : "#7393B5",
              textDecoration: "none",
              transition: "color 0.4s ease",
            }}
            onMouseEnter={(e) => {
              if (pathname !== link.to)
                e.currentTarget.style.color = "#97AED1";
            }}
            onMouseLeave={(e) => {
              if (pathname !== link.to)
                e.currentTarget.style.color = "#7393B5";
            }}
          >
            {link.label}
          </Link>
        ))}

        {/* Search icon — 18px, sits flush with text */}
        <img
          src={searchIcon}
          alt="Search"
          style={{
            width: 27,
            height: 27,
            opacity: 0.7,
            cursor: "pointer",
            transition: "opacity 0.3s ease",
            display: "block",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.7)}
        />

        {/* Wallet button */}
        <button
          onClick={onConnect}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "15px",
            lineHeight: 1,
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
            transition: "background 0.4s ease",
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
                  background: "#7393B5",
                  display: "inline-block",
                  animation: "pulse7393 1.5s ease-in-out infinite",
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
        @keyframes pulse7393 {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.85); }
        }
      `}</style>
    </nav>
  );
}