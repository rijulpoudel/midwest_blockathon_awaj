const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY;

/**
 * Upload an image file to Pinata IPFS (v1 pinning API — browser-safe).
 * @param {File} file - A File object from a file input
 * @returns {Promise<string>} The IPFS CID of the uploaded image
 */
export async function uploadImageToPinata(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Pinata responded with ${res.status}: ${text}`);
    }

    const json = await res.json();
    console.log("Image uploaded to IPFS — CID:", json.IpfsHash);
    return json.IpfsHash;
  } catch (err) {
    throw new Error(`Failed to upload image to Pinata: ${err.message}`);
  }
}

/**
 * Upload a JSON metadata object to Pinata IPFS (v1 pinning API — browser-safe).
 * @param {Object} metadataObject - A plain JS object to store as JSON
 * @returns {Promise<string>} The IPFS CID of the uploaded metadata
 */
export async function uploadMetadataToPinata(metadataObject) {
  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({ pinataContent: metadataObject }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Pinata responded with ${res.status}: ${text}`);
    }

    const json = await res.json();
    console.log("Metadata uploaded to IPFS — CID:", json.IpfsHash);
    return json.IpfsHash;
  } catch (err) {
    throw new Error(`Failed to upload metadata to Pinata: ${err.message}`);
  }
}

/**
 * Build a gateway URL for an IPFS CID.
 * @param {string} cid - The IPFS CID
 * @returns {string} The full IPFS gateway URL
 */
export function getIPFSUrl(cid) {
  return `https://${PINATA_GATEWAY}/ipfs/${cid}`;
}
