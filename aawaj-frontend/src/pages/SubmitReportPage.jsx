import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { submitFullReport } from "../utils/submitReport";
import { getIPFSUrl } from "../utils/pinata";
import { REPORT_CATEGORIES } from "../constants";
import LoadingSpinner from "../components/LoadingSpinner";

export default function SubmitReportPage() {
  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState(REPORT_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [reportId, setReportId] = useState(null);
  const [metadataCID, setMetadataCID] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");
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
    setIsLoading(true);
    setError("");

    try {
      const result = await submitFullReport({
        imageFile,
        location,
        category,
        description,
        onProgress: (msg) => setLoadingMessage(msg),
      });

      setIsLoading(false);
      setReportId(result.reportId);
      setMetadataCID(result.metadataCID);
      setTxHash(result.transactionHash);
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
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Report Submitted!
        </h2>
        <p className="text-body mb-2">
          Your evidence is now permanent and tamper-proof.
        </p>
        <p className="text-muted text-sm mb-6">Your Report ID:</p>
        <p
          className="text-5xl font-mono font-bold mb-6"
          style={{ color: "#00c896" }}
        >
          #{reportId}
        </p>

        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 mb-6">
          <p className="text-yellow-400 font-semibold text-sm">
            ⚠️ SAVE THIS NUMBER — you need it to track your report
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          <Link
            to={`/track`}
            className="inline-block text-white font-semibold py-3 px-6 rounded-xl transition shadow-lg"
            style={{ backgroundColor: "#00c896" }}
          >
            Track My Report
          </Link>
        </div>

        <div className="card text-left space-y-3">
          <h4 className="font-semibold text-white text-sm">
            Verification Links
          </h4>
          {metadataCID && (
            <a
              href={getIPFSUrl(metadataCID)}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-accent-blue hover:underline text-sm"
            >
              📦 View Metadata on IPFS →
            </a>
          )}
          {txHash && (
            <a
              href={`https://amoy.polygonscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-accent-blue hover:underline text-sm"
            >
              ⛓️ View Transaction on Polygonscan →
            </a>
          )}
        </div>

        <p className="text-xs text-muted mt-10">
          Powered by Pinata IPFS + Polygon Blockchain
        </p>
      </div>
    );
  }

  // ─── LOADING OVERLAY ──────────────────────────────────────────
  const loadingOverlay = isLoading && (
    <div className="fixed inset-0 z-50 bg-black/50 flex flex-col items-center justify-center">
      <div className="card p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
        <LoadingSpinner />
        <p className="text-body font-medium text-center">{loadingMessage}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      {loadingOverlay}

      <h1 className="text-3xl font-bold text-white mb-2">Submit a Report</h1>
      <p className="text-body mb-6 text-sm">Step {step} of 2</p>

      {/* Error banner */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mb-6 flex items-start justify-between">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-300 ml-4 text-lg leading-none"
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
            className="border-2 border-dashed border-surface-border rounded-xl p-10 text-center cursor-pointer hover:border-accent-blue/30 transition"
          >
            {preview ? (
              <div>
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto rounded-lg max-h-64 object-cover mb-3"
                />
                <p className="text-sm text-muted">{imageFile?.name}</p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">📸</div>
                <p className="text-body font-medium">
                  Click to select or drag & drop a photo
                </p>
                <p className="text-muted text-sm mt-1">
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
            <label className="block text-sm font-medium text-body mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Lalitpur Ward 5, near Sahid Gate"
              required
              className="w-full border rounded-lg px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-body mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 text-sm"
            >
              {REPORT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-body mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem in detail — what happened, when, how it affects people..."
              rows={4}
              className="w-full border rounded-lg px-4 py-2 text-sm resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl font-semibold btn-secondary"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !location}
              className="flex-1 py-3 rounded-xl font-semibold text-lg text-white transition shadow-lg disabled:opacity-40"
              style={{ backgroundColor: "#00c896" }}
            >
              Submit Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
