import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
        🔊 Echo
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mb-2">
        Citizen Evidence Reporting for Nepal
      </p>
      <p className="text-gray-500 max-w-xl mb-10">
        Submit evidence of civic issues directly to the blockchain. Your report
        is permanent, transparent, and tamper-proof — powered by Polygon and
        IPFS.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition shadow-lg"
        >
          Submit a Report
        </Link>
        <Link
          to="/track"
          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl text-lg font-semibold transition"
        >
          Track a Report
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <FeatureCard
          icon="📸"
          title="Upload Evidence"
          desc="Photos are stored permanently on IPFS via Pinata — nobody can delete them."
        />
        <FeatureCard
          icon="⛓️"
          title="On-Chain Record"
          desc="Every report is written to the Polygon blockchain for full transparency."
        />
        <FeatureCard
          icon="🏛️"
          title="Gov Accountability"
          desc="Government officials update statuses on-chain. All actions are public."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-left border border-gray-100">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}
