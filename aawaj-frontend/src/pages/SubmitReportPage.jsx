import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import useContract from "../hooks/useContract";
import {
  uploadImageToPinata,
  uploadMetadataToPinata,
  getIPFSUrl,
} from "../utils/pinata";
import { REPORT_CATEGORIES, NEPAL_LOCATIONS } from "../constants";
import LoadingSpinner from "../components/LoadingSpinner";

export default function SubmitReportPage({ account, onConnect }) {
  const { submitReport } = useContract();

  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState(REPORT_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [reportId, setReportId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");
  const [metadataCID, setMetadataCID] = useState(null);
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    setImageFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function handleDrop(e) {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("image/")) {
      setImageFile(dropped);
      setPreview(URL.createObjectURL(dropped));
    }
  }

  async function handleSubmit() {
    if (!account) {
      await onConnect();
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Step 1: Upload image to IPFS
      setLoadingMessage("Uploading evidence to IPFS via Pinata...");
      const imageCID = await uploadImageToPinata(imageFile);

      // Step 2: Upload metadata to IPFS
      setLoadingMessage("Uploading report metadata to IPFS...");
      const metadata = {
        imageCID,
        location,
        category,
        description,
        timestamp: new Date().toISOString(),
        appName: "Echo",
        network: "Polygon Amoy",
        reporterAddress: account,
      };
      const mCID = await uploadMetadataToPinata(metadata);
      setMetadataCID(mCID);

      // Step 3: Write to blockchain
      setLoadingMessage("Writing to blockchain — confirm MetaMask popup...");
      const id = await submitReport(mCID, location, category);

      if (id === null || id === undefined) {
        throw new Error(
          "Blockchain transaction failed — check your wallet connection and contract address.",
        );
      }

      setIsLoading(false);
      setReportId(id);
      setStep(3);
    } catch (err) {
      setIsLoading(false);
      setError(err.message);
    }
  }

  // ─── STEP 3: Success Screen ───────────────────────────────────
  if (step === 3 && reportId !== null) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center px-4">
        <div
          className="text-6xl mb-4"
          style={{ animation: "scaleIn 0.5s ease-out" }}
        >
          ✅
        </div>
        <style>{`@keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Report Submitted!
        </h2>
        <p className="text-gray-600 mb-6">Your Report ID:</p>
        <p
          className="text-5xl font-mono font-bold mb-6"
          style={{ color: "#00c896" }}
        >
          #{reportId}
        </p>

        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-semibold text-sm">
            ⚠️ SAVE THIS NUMBER — you need it to track your report
          </p>
        </div>

        {metadataCID && (
          <div className="mb-6">
            <a
              href={getIPFSUrl(metadataCID)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View Metadata on IPFS ↗
            </a>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            to={`/track/${reportId}`}
            className="echo-btn-primary inline-block font-semibold py-3 px-6 rounded-xl shadow-lg"
          >
            Track My Report →
          </Link>
          <a
            href={`https://amoy.polygonscan.com/address/${import.meta.env.VITE_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            View on Polygonscan ↗
          </a>
        </div>

        <p className="text-xs text-gray-400 mt-10">
          Powered by Pinata IPFS + Polygon Blockchain
        </p>
      </div>
    );
  }

  // ─── LOADING OVERLAY ──────────────────────────────────────────
  const loadingOverlay = isLoading && (
    <div className="fixed inset-0 z-50 bg-black/50 flex flex-col items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
        <LoadingSpinner />
        <p className="text-gray-700 font-medium text-center">
          {loadingMessage}
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      {loadingOverlay}

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit a Report</h1>
      <p className="text-gray-500 mb-6 text-sm">Step {step} of 2</p>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6 flex items-start justify-between">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => setError("")}
            className="text-red-400 hover:text-red-600 ml-4 text-lg leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── STEP 1: Photo Upload ─────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-gray-400 transition"
          >
            {preview ? (
              <div>
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto rounded-lg max-h-64 object-cover mb-3"
                />
                <p className="text-sm text-gray-500">{imageFile?.name}</p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">📸</div>
                <p className="text-gray-600 font-medium">
                  Click to select or drag & drop a photo
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Accepts image files only
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!imageFile}
            className="w-full py-3 rounded-xl font-semibold text-lg text-white transition shadow-lg disabled:opacity-40"
            style={{ backgroundColor: "#00c896" }}
          >
            Next →
          </button>
        </div>
      )}

      {/* ─── STEP 2: Report Details ───────────────────────────── */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              list="nepal-locations"
              placeholder="e.g. Lalitpur Ward 5, near Sahid Gate"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <datalist id="nepal-locations">
              {NEPAL_LOCATIONS.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {REPORT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem in detail — what happened, when, how it affects people..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !location}
              className="flex-1 py-3 rounded-xl font-semibold text-lg text-white transition shadow-lg disabled:opacity-40"
              style={{ backgroundColor: "#00c896" }}
            >
              {account ? "Submit Report" : "Connect Wallet"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
