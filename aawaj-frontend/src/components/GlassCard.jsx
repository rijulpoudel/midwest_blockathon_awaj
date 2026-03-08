export default function GlassCard({
  label,
  children,
  className = "",
  rounded = "rounded-[24px]",
}) {
  return (
    <div
      className={`relative flex flex-col justify-center p-5 ${rounded} ${className}
        before:content-[''] before:absolute before:inset-0 before:p-[1px] ${rounded}
        before:[background:linear-gradient(169deg,rgba(255,255,255,0.4)_0%,rgba(238,237,237,0.2)_100%)]
        before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]
        before:[-webkit-mask-composite:xor] before:[mask-composite:exclude]
        before:z-[1] before:pointer-events-none`}
      style={{
        background:
          "radial-gradient(50% 50% at 75% 50%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)",
      }}
    >
      {label && (
        <p
          className="text-xs font-medium tracking-widest mb-2"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {label}
        </p>
      )}
      {children}
    </div>
  );
}
