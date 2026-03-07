export const REPORT_CATEGORIES = [
  "Road Damage",
  "Water Supply",
  "Waste Management",
  "Street Lighting",
  "Drainage",
  "Public Property",
  "Environmental Hazard",
  "Other",
];

export const STATUS_CONFIG = {
  0: {
    label: "Submitted",
    color: "bg-yellow-100 text-yellow-800",
    dot: "bg-yellow-400",
  },
  1: {
    label: "In Review",
    color: "bg-blue-100 text-blue-800",
    dot: "bg-blue-400",
  },
  2: {
    label: "Escalated",
    color: "bg-orange-100 text-orange-800",
    dot: "bg-orange-400",
  },
  3: {
    label: "Pending Confirmation",
    color: "bg-purple-100 text-purple-800",
    dot: "bg-purple-400",
  },
  4: {
    label: "Resolved",
    color: "bg-green-100 text-green-800",
    dot: "bg-green-400",
  },
  5: { label: "Disputed", color: "bg-red-100 text-red-800", dot: "bg-red-400" },
};

export const ESCALATION_LEVELS = [
  { level: 0, name: "Ward", icon: "🏘️", description: "Local ward office" },
  {
    level: 1,
    name: "Municipality",
    icon: "🏙️",
    description: "City municipality",
  },
  { level: 2, name: "District", icon: "🏛️", description: "District office" },
  { level: 3, name: "Province", icon: "🏗️", description: "Provincial office" },
  { level: 4, name: "Federal", icon: "🇳🇵", description: "Central government" },
];

export const AUTHORIZED_GOV_WALLETS = [
  "0xf474e6Cbf4B9eaF381f2E16BEE244c45aF7A5152",
].map((addr) => addr.toLowerCase());

export const CATEGORY_ICONS = {
  "Road Damage": "🛣️",
  "Water Supply": "💧",
  "Waste Management": "🗑️",
  "Street Lighting": "💡",
  Drainage: "🌊",
  "Public Property": "🏚️",
  "Environmental Hazard": "⚠️",
  Other: "📋",
};

export const NEPAL_LOCATIONS = [
  "Lalitpur Ward 5",
  "Lalitpur Ward 12",
  "Bhaktapur Ward 1",
  "Bhaktapur Ward 8",
  "KMC Ward 32",
  "KMC Ward 15",
  "Pokhara Ward 11",
  "Pokhara Ward 6",
  "Biratnagar Ward 4",
  "Dharan Ward 9",
];
