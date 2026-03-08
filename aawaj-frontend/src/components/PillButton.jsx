/**
 * PillButton — Reusable rounded pill button
 *
 * Props:
 *   onClick (function)     — click handler
 *   disabled (boolean)     — disables the button
 *   variant (string)       — "primary" (white bg) | "outline" (transparent + border)
 *   to (string)            — if provided, renders as a Link instead of button
 *   children (ReactNode)   — button label
 *   className (string)     — optional extra Tailwind classes
 */
import { Link } from "react-router-dom";

export default function PillButton({
  onClick,
  disabled = false,
  variant = "primary",
  to,
  children,
  className = "",
}) {
  const base = "rounded-full px-12 py-3 font-medium text-lg transition-all duration-200 inline-block text-center";

  const variants = {
    primary: disabled
      ? "bg-white text-black opacity-50 cursor-not-allowed"
      : "bg-white text-black hover:bg-gray-100 hover:scale-105 hover:shadow-lg cursor-pointer",
    outline:
      "bg-transparent text-white border border-white/20 hover:bg-white/10 cursor-pointer",
  };

  const classes = `${base} ${variants[variant] || variants.primary} ${className}`;
  const style = { fontFamily: "'Inter', sans-serif" };

  // Render as Link if `to` prop is provided
  if (to) {
    return (
      <Link to={to} className={classes} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classes}
      style={style}
    >
      {children}
    </button>
  );
}