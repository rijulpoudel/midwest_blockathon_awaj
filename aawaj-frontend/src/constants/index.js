// Polygon Amoy testnet
export const CHAIN_ID = 80002;
export const CHAIN_NAME = "Polygon Amoy Testnet";
export const RPC_URL = "https://rpc-amoy.polygon.technology";
export const BLOCK_EXPLORER = "https://amoy.polygonscan.com";

// Report status labels (match smart contract uint8 enum)
export const STATUS_LABELS = [
  "Submitted", // 0
  "In Review", // 1
  "Escalated — Ward", // 2
  "Escalated — Municipality", // 3
  "Escalated — Province", // 4
  "Escalated — Federal", // 5
  "Gov Marked Resolved", // 6
  "Confirmed Resolved", // 7
  "Disputed", // 8
];

// Nepal escalation chain (status indices 2-5)
export const ESCALATION_LEVELS = [
  { status: 2, label: "Ward", icon: "🏘️" },
  { status: 3, label: "Municipality", icon: "🏙️" },
  { status: 4, label: "Province", icon: "🗺️" },
  { status: 5, label: "Federal", icon: "🏛️" },
];

// Gov-only statuses (gov can set these)
export const GOV_STATUSES = [1, 2, 3, 4, 5, 6];
// Citizen-only statuses via relayer (confirm/dispute after GovResolved)
export const CITIZEN_STATUSES = [7, 8];

// Authorized government wallet addresses (lowercase)
// These wallets can access the Gov Dashboard and update report statuses
export const AUTHORIZED_GOV_WALLETS = [
  "0xf474e6Cbf4B9eaF381f2E16BEE244c45aF7A5152", // Contract deployer
  "0x9E857799F66979A224A18DAE376387807C0672D2", // Gov official 1
].map((a) => a.toLowerCase());

// Report categories for Nepal
export const REPORT_CATEGORIES = [
  "Road Damage",
  "Water Supply",
  "Electricity",
  "Waste Management",
  "Public Safety",
  "Corruption",
  "Environmental",
  "Other",
];
