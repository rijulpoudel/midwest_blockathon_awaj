export default function LoadingSpinner({ message, size = "md" }) {
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-14 h-14 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <div
        className={`${sizes[size] || sizes.md} border-[#00c896] border-t-transparent rounded-full animate-spin`}
      />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
}
