import defaultBg from "../assets/submit_report.png";

export default function PageShell({ overlay = "bg-black/30", bg = defaultBg, children }) {
  return (
    <div className="relative z-10 flex flex-col items-center px-4 pt-16 pb-16">
      
      <img
      src={bg}
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
      style={{ objectPosition: "center 10%" }}
    />

      <div className={`absolute inset-0 ${overlay}`} />

      <div className="relative z-10 flex flex-col items-center px-4 pt-20 pb-16">
        {children}
      </div>
    </div>
  );
}