import { useState, useEffect } from "react";
import { getIPFSUrl } from "../utils/pinata";

export default function useIPFSImage(ipfsHash) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!ipfsHash) return;

    let cancelled = false;

    async function load() {
      const gateways = [
        getIPFSUrl(ipfsHash),
        `https://ipfs.io/ipfs/${ipfsHash}`,
      ];

      // Step 1: Fetch metadata to extract imageCID
      let imageCID = null;
      for (const gw of gateways) {
        try {
          const r = await fetch(gw);
          if (!r.ok) continue;
          const ct = r.headers.get("content-type") || "";
          if (ct.includes("image")) {
            // ipfsHash itself is an image
            if (!cancelled) setImageUrl(gw);
            return;
          }
          const text = await r.text();
          try {
            const meta = JSON.parse(text);
            imageCID = meta.imageCID || meta.image || meta.imagecid;
            if (imageCID) break;
          } catch {
            // Not JSON, skip
          }
        } catch {
          continue;
        }
      }

      if (!imageCID || cancelled) return;

      // Step 2: Use the image CID directly via gateway URL
      const imgUrl = getIPFSUrl(imageCID);
      if (!cancelled) setImageUrl(imgUrl);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [ipfsHash]);

  return imageUrl;
}
