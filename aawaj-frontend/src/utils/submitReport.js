import { uploadImageToPinata, uploadMetadataToPinata } from "./pinata";
import { submitReportViaRelayer } from "./relayer";

/**
 * Full submission pipeline: IPFS uploads + blockchain write.
 * No wallet needed — uses the relayer.
 *
 * @param {Object} params
 * @param {File} params.imageFile - Photo evidence
 * @param {string} params.location - Location description
 * @param {string} params.category - Report category
 * @param {string} params.description - Problem description
 * @param {(msg: string) => void} params.onProgress - Status callback
 * @returns {Promise<{reportId, metadataCID, imageCID, transactionHash, blockNumber}>}
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

  // Step 2: Upload metadata to IPFS
  onProgress("Uploading report metadata to IPFS...");
  const metadata = {
    imageCID,
    location,
    category,
    description,
    timestamp: new Date().toISOString(),
    appName: "AAWAJ",
    network: "Polygon Amoy",
  };
  const metadataCID = await uploadMetadataToPinata(metadata);

  // Step 3: Write to blockchain via relayer
  onProgress("Recording permanently on blockchain...");
  const { reportId, transactionHash, blockNumber } =
    await submitReportViaRelayer(metadataCID, location, category);

  return { reportId, metadataCID, imageCID, transactionHash, blockNumber };
}
