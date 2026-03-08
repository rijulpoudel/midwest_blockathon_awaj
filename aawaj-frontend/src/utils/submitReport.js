import { uploadImageToPinata, uploadMetadataToPinata } from "./pinata";
import { submitReportViaRelayer } from "./relayer";

/**
 * Generate a random 8-character alphanumeric confirmation code.
 * Format: AAWAJ-XXXXXXXX
 */
function generateConfirmationCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
  let code = "";
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  for (const byte of arr) {
    code += chars[byte % chars.length];
  }
  return `AAWAJ-${code}`;
}

/**
 * SHA-256 hash a string and return the hex digest.
 */
async function hashCode(code) {
  const encoded = new TextEncoder().encode(code);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Full submission pipeline: IPFS uploads + blockchain write.
 * No wallet needed — uses the relayer.
 *
 * Returns a confirmationCode that the citizen must save — it's the only
 * way to prove identity when confirming/disputing resolution later.
 *
 * @param {Object} params
 * @param {File} params.imageFile - Photo evidence
 * @param {string} params.location - Location description
 * @param {string} params.category - Report category
 * @param {string} params.description - Problem description
 * @param {(msg: string) => void} params.onProgress - Status callback
 * @returns {Promise<{reportId, metadataCID, imageCID, transactionHash, blockNumber, confirmationCode}>}
 */
export async function submitFullReport({
  imageFile,
  location,
  category,
  description,
  onProgress,
}) {
  // Step 1: Upload photo to IPFS
  onProgress("Uploading evidence to IPFS via Pinata...");
  const imageCID = await uploadImageToPinata(imageFile);

  // Step 2: Generate confirmation code + hash
  const confirmationCode = generateConfirmationCode();
  const confirmationHash = await hashCode(confirmationCode);

  // Step 3: Upload metadata to IPFS (includes the hash, NOT the plaintext code)
  onProgress("Uploading report metadata to IPFS...");
  const metadata = {
    imageCID,
    location,
    category,
    description,
    confirmationHash,
    timestamp: new Date().toISOString(),
    appName: "AAWAJ",
    network: "Polygon Amoy",
  };
  const metadataCID = await uploadMetadataToPinata(metadata);

  // Step 4: Write to blockchain via relayer
  onProgress("Recording permanently on blockchain...");
  const { reportId, transactionHash, blockNumber } =
    await submitReportViaRelayer(metadataCID, location, category);

  return {
    reportId,
    metadataCID,
    imageCID,
    transactionHash,
    blockNumber,
    confirmationCode,
  };
}

/**
 * Verify a confirmation code against the hash stored in IPFS metadata.
 * @param {string} code - The plaintext code the user entered
 * @param {string} storedHash - The SHA-256 hash from IPFS metadata
 * @returns {Promise<boolean>}
 */
export async function verifyConfirmationCode(code, storedHash) {
  const hashed = await hashCode(code.trim().toUpperCase());
  return hashed === storedHash;
}
