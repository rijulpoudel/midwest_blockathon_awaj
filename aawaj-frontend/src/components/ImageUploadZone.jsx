import { useState, useRef } from "react";
import cameraIcon from "../assets/Vector.png"; // ← import the image

/**
 * ImageUploadZone — Reusable drag-and-drop photo upload card
 *
 * Props:
 *   onFileSelect(file: File) — called when a valid image is chosen
 *   preview (string | null)  — object URL to show as preview
 */
export default function ImageUploadZone({ onFileSelect, preview }) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) onFileSelect(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onFileSelect(file);
  }

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="cursor-pointer flex flex-col items-center justify-center gap-4 transition-all duration-200"
      style={{
        background: dragActive ? "rgba(20, 45, 70, 0.3)" : "rgba(180,200,220,0.2)",
        backdropFilter: "blur(7px)",
        WebkitBackdropFilter: "blur(10px)",
        border: dragActive
          ? "1px solid rgba(255,255,255,0.6)"
          : "1px solid rgba(255,255,255,0.25)",
        borderRadius: "24px",
        padding: "100px",
        minHeight: "300px",
      }}
    >
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-64 object-cover rounded-2xl"
        />
      ) : (
        <>
          <img
            src={cameraIcon}
            alt="Camera icon"
            className="w-[78px] h-[70px]" // ← matches Figma dimensions
          />
          <p
            className="text-2xl font-bold text-black text-center"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            click or drag or drop a photo
          </p>
          <p
            className="text-sm text-center"
            style={{ color: "rgba(0,0,0,0.5)" }}
          >
            Will only Accept image files
          </p>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}