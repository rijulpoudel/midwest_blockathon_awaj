const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY;

export async function uploadImageToPinata(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Pinata responded with ${res.status}: ${text}`);
    }

    const json = await res.json();
    console.log("Image uploaded to IPFS:", json.IpfsHash);
    return json.IpfsHash;
  } catch (err) {
    throw new Error(`Failed to upload image to Pinata: ${err.message}`);
  }
}

export async function uploadMetadataToPinata(metadata) {
  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({ pinataContent: metadata }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Pinata responded with ${res.status}: ${text}`);
    }

    const json = await res.json();
    console.log("Metadata uploaded to IPFS:", json.IpfsHash);
    return json.IpfsHash;
  } catch (err) {
    throw new Error(`Failed to upload metadata to Pinata: ${err.message}`);
  }
}

export function getIPFSUrl(cid) {
  return `https://${PINATA_GATEWAY}/ipfs/${cid}`;
}
