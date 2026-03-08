import { useState } from "react";
import useContract from "../hooks/useContract";
import { uploadImageToPinata, uploadMetadataToPinata, getIPFSUrl } from "../utils/pinata";
import { REPORT_CATEGORIES, NEPAL_LOCATIONS } from "../constants";
import ImageUploadZone from "../components/ImageUploadZone";
import PageShell from "../components/PageShell";
import LoadingOverlay from "../components/LoadingOverlay";
import GlassCard from "../components/GlassCard";
import PillButton from "../components/PillButton";          // ← new import

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

  // ── Passed to ImageUploadZone ──
  function handleFileSelect(file) {
    setImageFile(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  }

  // ── Unchanged submit logic ──
  async function handleSubmit() {
    if (!account) {
      await onConnect();
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setLoadingMessage("Uploading evidence to IPFS via Pinata...");
      const imageCID = await uploadImageToPinata(imageFile);

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

      setLoadingMessage("Writing to blockchain — confirm MetaMask popup...");
      const id = await submitReport(mCID, location, category);

      if (id === null || id === undefined) {
        throw new Error("Blockchain transaction failed — check your wallet connection.");
      }

      setIsLoading(false);
      setReportId(id);
      setStep(3);
    } catch (err) {
      setIsLoading(false);
      setError(err.message);
    }
  }

  function resetForm() {
    setStep(1);
    setReportId(null);
    setImageFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setMetadataCID(null);
    setLocation("");
    setDescription("");
    setError("");
  }

  // ─────────────────────────────────────────────────────────────
  //  STEP 3 — Success Screen
  // ─────────────────────────────────────────────────────────────
  if (step === 3 && reportId !== null) {
    return (
      <PageShell overlay="bg-black/60">
        <style>{`@keyframes scaleIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}`}</style>

        <div className="pt-12" style={{ animation: "scaleIn 0.5s ease-out" }}>
          <div className="text-7xl mb-6 text-center">✅</div>
        </div>

        <h2
          className="text-3xl font-bold text-white text-center mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Your Voice is Now Permanent
        </h2>
        <p
          className="text-sm text-center max-w-md mb-10"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Your report has been written to the blockchain and stored permanently
          on IPFS. No one can delete or deny it.
        </p>

        <div className="w-full max-w-lg space-y-4 mb-10">
          <GlassCard label="YOUR REPORT ID — SAVE THIS">
            <p className="text-white font-mono text-3xl font-bold">#{reportId}</p>
          </GlassCard>

          {metadataCID && (
            <GlassCard label="STORED ON IPFS VIA PINATA">
              <a
                href={getIPFSUrl(metadataCID)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline"
                style={{ color: "#6b8cae" }}
              >
                View Metadata on IPFS ↗
              </a>
            </GlassCard>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          <PillButton to={`/track/${reportId}`}>
            Track My Report →
          </PillButton>
          <button
            onClick={resetForm}
            className="text-sm hover:underline"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Submit Another Report
          </button>
        </div>
      </PageShell>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  STEP 1 — Upload Photo
  // ─────────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <PageShell>
        <h1
          className="mt-12 mb-8 text-center"
          style={{
            fontFamily: "'Inter', Helvetica",
            fontSize: "40px",
            fontWeight: "600",
            background: "linear-gradient(to bottom, #A0BAD5, #FFFFFF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          SUBMIT YOUR REPORT
        </h1>

        <div className="w-full max-w-3xl">
          <ImageUploadZone onFileSelect={handleFileSelect} preview={preview} />

          <div className="flex justify-center mt-8">
            <PillButton
              onClick={() => imageFile && setStep(2)}
              disabled={!imageFile}
            >
              Submit Your Report →
            </PillButton>
          </div>
        </div>

        <p className="text-xs mt-12" style={{ color: "rgba(255,255,255,0.25)" }}>
          Powered by Pinata IPFS + Polygon Blockchain
        </p>
      </PageShell>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  STEP 2 — Form Fields
  // ─────────────────────────────────────────────────────────────
  return (
    <PageShell>
      <LoadingOverlay show={isLoading} message={loadingMessage} />

      <h1
          className="mt-4 mb-8 text-center"
          style={{
            fontFamily: "'Inter', Helvetica",
            fontSize: "40px",
            fontWeight: "600",
            background: "linear-gradient(to bottom, #A0BAD5, #FFFFFF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
        SUBMIT YOUR REPORT
      </h1>

      <div className="w-full max-w-3xl space-y-5">
        <div>
          <label className="block text-sm mb-1.5" style={fieldLabelStyle}>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            list="nepal-locations"
            placeholder="District / Ward (e.g. Lalitpur Ward 5)"
            className="w-full px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-white/30"
            style={darkFieldStyle}
          />
          <datalist id="nepal-locations">
            {NEPAL_LOCATIONS.map((loc) => <option key={loc} value={loc} />)}
          </datalist>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm mb-1.5" style={fieldLabelStyle}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none"
            style={darkFieldStyle}
          >
            {REPORT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} style={{ background: "#141b27" }}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm mb-1.5" style={fieldLabelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the problem in detail — what happened, when, how it affects people..."
            rows={4}
            className="w-full px-4 py-3 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-white/30"
            style={darkFieldStyle}
          />
        </div>

        {error && (
          <p className="text-sm" style={{ color: "rgba(239,68,68,1)" }}>{error}</p>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <PillButton variant="outline" onClick={() => setStep(1)} className="px-10">
            ← Back
          </PillButton>
          <PillButton
            onClick={handleSubmit}
            disabled={isLoading || !location}
          >
            {account ? "Submit Your Report" : "Connect Wallet"}
          </PillButton>
        </div>
      </div>

      <p className="text-xs mt-12" style={{ color: "rgba(255,255,255,0.25)" }}>
        Powered by Pinata IPFS + Polygon Blockchain
      </p>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────
//  Shared style objects
// ─────────────────────────────────────────────────────────────
const darkFieldStyle = {
  background: "rgba(20,27,39,0.7)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  fontFamily: "'Inter', sans-serif",
};

const fieldLabelStyle = {
  color: "rgba(255,255,255,0.55)",
  fontFamily: "'Inter', sans-serif",
};
