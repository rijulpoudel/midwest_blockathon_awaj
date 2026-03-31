# ECHO — Complete Build Specification for GitHub Copilot

> **Instructions for Copilot:** This is a complete specification for the Echo
> blockchain citizen reporting app. Read this entire file before writing any code.
> Follow every requirement exactly. At the end of all code generation, produce a
> file called `WHAT_WE_BUILT.md` that explains every file, every function, and
> every decision in plain English suitable for a beginner hackathon team to read
> and understand before presenting to judges.

---

## Project Context

Echo is a citizen evidence reporting app built on blockchain for Nepal. Citizens
report civic problems (broken roads, waste, broken lights). Reports are stored
immutably on Polygon Amoy blockchain. Government bodies at different levels
(Ward → Municipality → District → Province → Federal) handle and escalate
reports. Citizens can track their reports and validate resolution.

**The core thesis:** Blockchain makes reports immutable and government
accountability transparent. Nobody can delete a report. Nobody can fake a
resolution. Every action is permanently on-chain.

### What Already Works (DO NOT BREAK THESE)

- `submitReport()` — citizen submits report, photo uploads to Pinata IPFS,
  metadata CID written to smart contract, returns Report ID
- `trackReport()` — citizen enters Report ID, sees report details and IPFS image
- `govDashboard` — government wallet connects and updates report status
- Pinata IPFS integration — photos appear in Pinata dashboard
- MetaMask wallet connection

### What Needs to Be Built (This Spec)

1. Smart contract updates (escalation level + reporter confirmation)
2. Government wallet authorization (whitelist system)
3. Live blockchain activity feed on homepage
4. Escalation chain UI and enforcement
5. Reporter resolution confirmation / dispute system
6. Overall UI polish with consistent design system

---

## Tech Stack (Do Not Change)

```
Frontend:        React (Vite, JavaScript — NOT TypeScript)
Styling:         TailwindCSS only — no other CSS libraries
Blockchain:      Polygon Amoy testnet
Smart Contract:  Solidity ^0.8.20
Blockchain lib:  ethers.js v6 (BrowserProvider, NOT Web3Provider)
File storage:    Pinata SDK ('pinata' npm package)
Routing:         react-router-dom v6
Wallet:          MetaMask via window.ethereum
Deployment:      Vercel (frontend) + Polygon Amoy (contract)
```

---

## Environment Variables (Already Configured)

```
VITE_PINATA_JWT=           ← Pinata JWT token
VITE_PINATA_GATEWAY=       ← Pinata gateway URL
VITE_CONTRACT_ADDRESS=     ← Deployed contract address
VITE_RPC_URL=              ← Alchemy Polygon Amoy RPC URL
```

---

## SECTION 1 — Smart Contract Update

**File:** `contracts/EchoRegistry.sol`

The existing contract needs these additions. Keep all existing functionality
intact. Only add new fields and functions.

### Updated Report Struct

```solidity
struct Report {
    uint256 id;
    address reporter;
    string ipfsHash;
    string location;
    string category;
    uint8 status;           // 0=Submitted 1=InReview 2=Escalated 3=PendingConfirmation 4=Resolved 5=Disputed
    uint256 timestamp;
    address assignedBody;
    uint8 escalationLevel;  // NEW: 0=Ward 1=Municipality 2=District 3=Province 4=Federal
    bool reporterConfirmed; // NEW: true when original reporter confirms fix
    uint256 lastUpdated;    // NEW: timestamp of last status change
}
```

### Status Values (Updated)

- 0 = Submitted
- 1 = InReview
- 2 = Escalated
- 3 = PendingConfirmation (government marked resolved, waiting reporter confirm)
- 4 = Resolved (reporter confirmed)
- 5 = Disputed (reporter disputed the resolution)

### New Functions to Add

```solidity
/**
 * @notice Called by government body to escalate report to next level
 * @dev Increments escalationLevel, sets status to Escalated
 * Only call if escalationLevel < 4
 */
function escalateReport(uint256 reportId) external;

/**
 * @notice Called by government body to mark report as pending confirmation
 * @dev Sets status to PendingConfirmation (3)
 * Government believes they fixed it — now waiting for reporter to confirm
 */
function markPendingConfirmation(uint256 reportId) external;

/**
 * @notice Called ONLY by the original reporter to confirm the fix
 * @dev Requires msg.sender == reports[reportId].reporter
 * Sets status to Resolved (4), sets reporterConfirmed = true
 */
function confirmResolution(uint256 reportId) external;

/**
 * @notice Called ONLY by the original reporter to dispute a resolution
 * @dev Requires msg.sender == reports[reportId].reporter
 * Requires current status == PendingConfirmation (3)
 * Sets status back to Escalated (2)
 */
function disputeResolution(uint256 reportId) external;

/**
 * @notice Get recent report IDs for the activity feed
 * @dev Returns last N report IDs (up to 20)
 */
function getRecentReportIds(uint256 count) external view returns (uint256[] memory);
```

### New Events to Add

```solidity
event ReportEscalated(uint256 indexed id, uint8 newLevel, address escalatedBy);
event ResolutionPending(uint256 indexed id, address markedBy);
event ResolutionConfirmed(uint256 indexed id, address confirmedBy);
event ResolutionDisputed(uint256 indexed id, address disputedBy);
```

### Important Contract Rules

- `confirmResolution` must revert if `msg.sender != reports[reportId].reporter`
  with message: "Only the original reporter can confirm resolution"
- `disputeResolution` must revert if `msg.sender != reports[reportId].reporter`
  with message: "Only the original reporter can dispute resolution"
- `disputeResolution` must revert if status is not PendingConfirmation (3)
  with message: "Report is not pending confirmation"
- `escalateReport` must revert if escalationLevel is already 4
  with message: "Already at highest escalation level"
- All functions must update `lastUpdated = block.timestamp`

---

## SECTION 2 — Constants File

**File:** `src/constants/index.js`

```javascript
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

// Status numeric values mapped to display info
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

// Escalation hierarchy
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

// GOVERNMENT WALLET WHITELIST
// These are the ONLY wallet addresses allowed to access the Gov Dashboard
// For the hackathon demo, add your two MetaMask wallet addresses here
// In production this would be an on-chain registry
export const AUTHORIZED_GOV_WALLETS = [
  "0xYOUR_PRIMARY_WALLET_ADDRESS_HERE",
  "0xYOUR_SECONDARY_WALLET_ADDRESS_HERE",
  // Add more as needed for demo
].map((addr) => addr.toLowerCase()); // normalize to lowercase for comparison

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

// Nepal ward names for dropdown suggestions
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
```

---

## SECTION 3 — Utility Files

### 3.1 `src/utils/pinata.js`

```javascript
// Requirements:
// - Import PinataSDK from 'pinata'
// - Initialize with VITE_PINATA_JWT and VITE_PINATA_GATEWAY
// - Export three functions:

// uploadImageToPinata(file: File) => Promise<string>
//   Uses pinata.upload.public.file(file)
//   Returns CID string
//   console.log the CID on success: "Image uploaded to IPFS: [CID]"
//   Throw descriptive error on failure

// uploadMetadataToPinata(metadata: object) => Promise<string>
//   Uses pinata.upload.public.json(metadata)
//   Returns CID string
//   console.log the CID on success: "Metadata uploaded to IPFS: [CID]"
//   Throw descriptive error on failure

// getIPFSUrl(cid: string) => string
//   Returns: `https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${cid}`
```

### 3.2 `src/utils/contract.js`

```javascript
// Requirements:
// - Import ethers from 'ethers' (v6)
// - Import ABI from '../contracts/EchoRegistry.json'
// - Contract address from import.meta.env.VITE_CONTRACT_ADDRESS

// getProvider() => BrowserProvider
//   Throws "MetaMask not installed. Please install MetaMask." if no window.ethereum

// getSigner() => Promise<Signer>
//   Calls getProvider(), returns provider.getSigner()

// getContract(signerOrProvider) => Contract
//   Returns new Contract(address, ABI, signerOrProvider)

// getReadOnlyContract() => Contract
//   Uses new JsonRpcProvider(import.meta.env.VITE_RPC_URL)
//   Returns Contract with this provider
//   Used for free reads — no MetaMask needed

// getContractWithSigner() => Promise<Contract>
//   Convenience: getSigner then getContract
//   Used for all write operations
```

---

## SECTION 4 — Custom Hooks

### 4.1 `src/hooks/useWallet.js`

State: `{ account, isConnecting, error }`
Functions: `connectWallet()`

Requirements:

- On mount: silent check via `eth_accounts` (no popup)
- `connectWallet`: uses `eth_requestAccounts`
- Listen for `accountsChanged` event, update account state
- If accounts array becomes empty, clear account state
- If `window.ethereum` undefined: error = "MetaMask not installed. Please install MetaMask to use Echo."
- If user rejects: error = "Wallet connection rejected. Please try again."
- Return: `{ account, isConnecting, error, connectWallet }`
- Export as default

### 4.2 `src/hooks/useContract.js`

Import: `getContractWithSigner`, `getReadOnlyContract` from `utils/contract.js`

State: `{ isLoading, error }`

**submitReport(ipfsHash, location, category)**

- Get contract with signer
- Call `contract.submitReport(ipfsHash, location, category)`
- Wait for `tx.wait()`
- Parse `ReportSubmitted` event from `receipt.logs` to extract `id` as Number
- Return the report ID
- setIsLoading true → false

**updateReportStatus(reportId, newStatus)**

- Get contract with signer
- Call `contract.updateStatus(reportId, newStatus)`
- Wait for `tx.wait()`
- Return `receipt.hash`

**escalateReport(reportId)**

- Get contract with signer
- Call `contract.escalateReport(reportId)`
- Wait for `tx.wait()`
- Return `receipt.hash`

**markPendingConfirmation(reportId)**

- Get contract with signer
- Call `contract.markPendingConfirmation(reportId)`
- Wait for `tx.wait()`
- Return `receipt.hash`

**confirmResolution(reportId)**

- Get contract with signer
- Call `contract.confirmResolution(reportId)`
- Wait for `tx.wait()`
- Return `receipt.hash`

**disputeResolution(reportId)**

- Get contract with signer
- Call `contract.disputeResolution(reportId)`
- Wait for `tx.wait()`
- Return `receipt.hash`

**fetchReport(reportId)**

- Uses `getReadOnlyContract()` — NO signer
- Calls `contract.getReport(reportId)`
- Returns formatted object:

```javascript
{
  id:                Number(result.id),
  reporter:          result.reporter,
  ipfsHash:          result.ipfsHash,
  location:          result.location,
  category:          result.category,
  status:            Number(result.status),
  timestamp:         new Date(Number(result.timestamp) * 1000),
  assignedBody:      result.assignedBody,
  escalationLevel:   Number(result.escalationLevel),
  reporterConfirmed: result.reporterConfirmed,
  lastUpdated:       new Date(Number(result.lastUpdated) * 1000),
}
```

**fetchActivityFeed(count = 10)**

- Uses `getReadOnlyContract()`
- Calls `contract.getRecentReportIds(count)`
- For each ID, calls `contract.getReport(id)`
- Returns array of formatted report objects sorted by timestamp descending
- This powers the homepage live feed

Return from hook: `{ submitReport, updateReportStatus, escalateReport,
markPendingConfirmation, confirmResolution, disputeResolution,
fetchReport, fetchActivityFeed, isLoading, error }`

---

## SECTION 5 — Components

### 5.1 `src/components/Navbar.jsx`

Props: `{ account, onConnect }`

Requirements:

- Left: "ECHO 🇳🇵" in green (#00c896), bold, large
- Center: navigation links — Home, Submit Report, Track Report
- Right: Connect Wallet button OR shortened address (0x1234...5678) with green dot
- Active route highlighted with green underline
- Dark background (#0a0e1a), white text
- On mobile: hide center links, keep logo and wallet button
- Export as default

### 5.2 `src/components/StatusBadge.jsx`

Props: `{ status: number }`

Requirements:

- Import STATUS_CONFIG from constants
- Render colored pill: `rounded-full px-3 py-1 text-xs font-semibold`
- Use STATUS_CONFIG[status].color for className
- Show STATUS_CONFIG[status].label as text
- Show pulsing dot for status 0 (Submitted) and 3 (PendingConfirmation)
- Export as default

### 5.3 `src/components/EscalationTimeline.jsx`

Props: `{ escalationLevel: number, status: number }`

Requirements:

- Import ESCALATION_LEVELS from constants
- Horizontal timeline showing all 5 levels
- Past levels: green checkmark, filled circle
- Current level: pulsing green circle, label bold
- Future levels: grey empty circle
- Connecting lines between circles: green for passed, grey for future
- Below each circle: icon + name
- On mobile: vertical layout instead of horizontal
- Export as default

### 5.4 `src/components/ActivityFeedCard.jsx`

Props: `{ report: object }`

This is the card used in the homepage live feed.

Requirements:

- Show: category icon + category name (bold)
- Show: location in grey
- Show: "Report #[id]" as small badge
- Show: StatusBadge component
- Show: relative timestamp ("2 hours ago", "just now", "3 days ago")
- Show: shortened reporter address
- Show: escalation level name (e.g. "Ward Level")
- Clicking the card navigates to `/track/[id]`
- Card has subtle left border colored by status
- Hover: slight elevation shadow
- Export as default

### 5.5 `src/components/LoadingSpinner.jsx`

Props: `{ message: string, size: 'sm'|'md'|'lg' }`

Requirements:

- Spinning circle using Tailwind `animate-spin`
- Green border top color
- Optional message below
- Default size 'md'
- Export as default

### 5.6 `src/components/ReporterActions.jsx`

Props: `{ report: object, account: string, onConfirm: fn, onDispute: fn, isLoading: bool }`

This component appears on the Track Report page when the connected
wallet is the original reporter AND status is PendingConfirmation (3).

Requirements:

- Show a prominent banner: "Government has marked this as resolved. Is it actually fixed?"
- Green "✓ Yes, it's fixed — Confirm Resolution" button
  - calls onConfirm when clicked
  - triggers confirmResolution in the hook
- Red "✗ No, it's not fixed — Dispute" button
  - calls onDispute when clicked
  - triggers disputeResolution in the hook
  - shows warning: "Disputing will escalate this report back to government"
- Only render this component if:
  `account.toLowerCase() === report.reporter.toLowerCase()`
  AND `report.status === 3`
- Show isLoading spinner on buttons while processing
- Export as default

---

## SECTION 6 — Pages

### 6.1 `src/pages/HomePage.jsx`

Props: `{ account, onConnect }`

This page has four sections:

**SECTION A — Hero**

- Full-width dark background (#0a0e1a)
- Large heading: "Make Your Voice Heard"
- Subheading: "Report civic problems in Nepal. Every report is permanent, public, and impossible to ignore."
- Two CTA buttons: "Submit a Report" (green, links to /submit) and "Track Your Report" (outline, links to /track)
- Small text below: "Powered by Polygon Blockchain + Pinata IPFS"

**SECTION B — Stats Bar**

- Three stats in a horizontal row:
  - Total Reports (call getReportCount() on mount, display real number)
  - Resolved Reports (count reports with status 4 from activity feed)
  - Active Wards ("5+" hardcoded for demo)
- Dark card background, green numbers, grey labels
- Real blockchain data for total reports — show loading skeleton while fetching

**SECTION C — Live Activity Feed**

- Heading: "🔴 Live on Blockchain" with pulsing red dot
- Subheading: "Real-time report activity from Polygon Amoy"
- Auto-fetches last 10 reports on mount using `fetchActivityFeed(10)`
- Auto-refreshes every 30 seconds (useEffect with setInterval)
- Shows ActivityFeedCard for each report
- If no reports yet: show empty state "No reports yet. Be the first to report a problem."
- Show "Last updated: [time]" below feed
- Show loading skeleton (3 grey placeholder cards) while fetching
- This section is the Reddit-style feed — chronological, most recent first

**SECTION D — How It Works**

- Three steps in cards:
  1. 📸 "Report It" — Take a photo, describe the problem, submit
  2. ⛓️ "Blockchain Records It" — Immutably stored on Polygon, impossible to delete
  3. ✅ "Track Resolution" — Follow your report as government responds
- Clean card layout, icon above, title, description

Export as default.

### 6.2 `src/pages/SubmitReportPage.jsx`

Props: `{ account, onConnect }`

Three-step form. DO NOT change working Pinata + contract submission logic.
Only improvements:

**Step 1 — Photo Upload (KEEP EXISTING, minor polish)**

- Drag and drop zone with dashed border
- Click to select image
- Show preview after selection
- "Next →" button disabled until image selected

**Step 2 — Details (KEEP EXISTING, add location datalist)**

- Location input: add `<datalist>` with NEPAL_LOCATIONS as options
  so user gets autocomplete suggestions
- Category dropdown: use REPORT_CATEGORIES
- Description textarea
- Back and Submit buttons

**Loading overlay (KEEP EXISTING loading messages)**

- "Uploading evidence to IPFS via Pinata..."
- "Uploading report metadata to IPFS..."
- "Writing to blockchain — confirm MetaMask popup..."
- "Waiting for blockchain confirmation..."

**Step 3 — Success (IMPROVE)**

- Large green checkmark animation (CSS keyframe, scale from 0 to 1)
- "Report Submitted!" heading
- Giant bold Report ID: "#7" style
- Yellow warning box: "⚠️ Save this number — you need it to track your report"
- Show the IPFS gateway link to the metadata
- Show Polygonscan link to the transaction
- "Powered by Pinata IPFS" badge with Pinata logo text
- "Track My Report →" button links to `/track/[reportId]`

handleSubmit logic (KEEP EXACTLY, just add these metadata fields):

```javascript
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
```

Export as default.

### 6.3 `src/pages/TrackReportPage.jsx`

Props: `{ account, onConnect }`

**URL handling:**

- Read `:reportId` from URL params using `useParams()`
- If param exists, auto-fetch on mount
- Input field still shown so user can search different IDs

**Report display (EXPAND existing):**

- Report ID badge
- Category icon + name
- Location
- StatusBadge
- Timestamp: "Submitted on [full date]" + "Last updated [relative time]"
- Shortened reporter address
- "Is this your report?" — if `account === report.reporter`, show green badge "Your Report"

**EscalationTimeline component:**

- Pass `escalationLevel` and `status` props
- Show full Ward → Federal chain with current level highlighted

**Evidence section:**

- Load image from `getIPFSUrl(report.ipfsHash)`
- Show "Evidence stored on IPFS via Pinata — content-addressed and tamper-proof" below image
- Link to IPFS: "View on IPFS →"

**ReporterActions component:**

- Render `<ReporterActions>` below the evidence section
- Pass report, account, onConfirm, onDispute, isLoading
- onConfirm: calls `confirmResolution(report.id)` then re-fetches report
- onDispute: calls `disputeResolution(report.id)` then re-fetches report

**Verification links:**

- "Verify on Polygonscan →" linking to:
  `https://amoy.polygonscan.com/address/${import.meta.env.VITE_CONTRACT_ADDRESS}`

Export as default.

### 6.4 `src/pages/GovDashboardPage.jsx`

Props: `{ account, onConnect }`

**ACCESS CONTROL — This is the most important addition:**

On mount and whenever `account` changes:

```javascript
const isAuthorized =
  account && AUTHORIZED_GOV_WALLETS.includes(account.toLowerCase());
```

If NOT authorized, show full-page unauthorized screen:

- Dark background
- Lock icon (🔒)
- "Unauthorized Access" heading in red
- "This dashboard is restricted to verified government bodies."
- "Connected wallet: [account or 'Not connected']"
- "If you are a government official, contact the Echo administrator."
- Connect Wallet button if not connected
- DO NOT show any dashboard content

If authorized, show the dashboard:

**Header:**

- Green "✓ Authorized Government Body" badge
- Show which wallet is connected
- Show which escalation level this body represents (use a dropdown or just
  show based on wallet — for demo, hardcode: wallet 1 = Ward, wallet 2 = Municipality)

**Load Report section:**

- Input for Report ID + "Load Report" button
- Fetch and display full report details on submit

**Loaded report shows:**

- All report details
- EscalationTimeline component
- Current status with StatusBadge
- IPFS evidence image

**Action buttons (show based on current status):**

If status is 0 (Submitted) or 1 (InReview):

- "Mark In Review" button → calls `updateReportStatus(id, 1)`
- "Escalate to Next Level" button → calls `escalateReport(id)`
  - Disabled if escalationLevel is already 4
  - Button label changes: "Escalate to Municipality", "Escalate to District", etc.
    based on current escalationLevel + 1

If status is 1 (InReview) or 2 (Escalated):

- "Mark as Resolved (Pending Confirmation)" button → calls `markPendingConfirmation(id)`
  - Show tooltip: "The original reporter will be asked to confirm the fix"

If status is 3 (PendingConfirmation):

- Show info banner: "Waiting for reporter to confirm resolution"
- Show reporter address so government knows who will confirm

If status is 5 (Disputed):

- Show red banner: "Reporter has disputed this resolution"
- "Re-open Investigation" button → calls `updateReportStatus(id, 1)`

**After any action:**

- Show green success banner with transaction hash
- Link to Polygonscan transaction
- Re-fetch the report automatically to show updated status
- All action buttons show LoadingSpinner while isLoading

**Warning banner always visible:**
"⚠️ All actions on this dashboard are permanently recorded on the Polygon blockchain and cannot be undone."

Export as default.

---

## SECTION 7 — App.jsx

```javascript
// Requirements:
// - Import BrowserRouter, Routes, Route, Navigate from react-router-dom
// - Import useWallet from hooks/useWallet
// - Import all four pages
// - Call useWallet() at top level
// - Wrap in BrowserRouter
// - Routes:
//   /                    → HomePage (pass account, onConnect=connectWallet)
//   /submit              → SubmitReportPage (pass account, onConnect=connectWallet)
//   /track               → TrackReportPage (pass account, onConnect=connectWallet)
//   /track/:reportId     → TrackReportPage (pass account, onConnect=connectWallet)
//   /gov-dashboard       → GovDashboardPage (pass account, onConnect=connectWallet)
//   *                    → Navigate to /
// - No other logic in App.jsx — keep it as a pure router
```

---

## SECTION 8 — Design System

Apply these design tokens consistently across ALL components and pages.
Add these CSS variables to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --echo-green: #00c896;
  --echo-green-dark: #00a67d;
  --echo-bg: #0a0e1a;
  --echo-surface: #131929;
  --echo-border: #1e2640;
  --echo-text: #e8eaf0;
  --echo-muted: #6b7280;
}

body {
  background-color: #f8fafc;
  font-family: "Inter", system-ui, sans-serif;
}

.echo-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.echo-btn-primary {
  background: #00c896;
  color: white;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.echo-btn-primary:hover {
  background: #00a67d;
}
.echo-btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.echo-btn-secondary {
  background: transparent;
  color: #374151;
  font-weight: 500;
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  cursor: pointer;
}

.echo-btn-danger {
  background: #dc2626;
  color: white;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
```

---

## SECTION 9 — Deployment Files

### `vercel.json` (create at project root)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This fixes React Router on Vercel — without it, refreshing any page other
than `/` gives a 404.

### `.gitignore` additions (verify these exist)

```
.env
.env.local
node_modules/
dist/
```

---

## SECTION 10 — After All Code Is Generated

Generate a file called `WHAT_WE_BUILT.md` in the project root.

This file must explain the following in plain English for a beginner team
presenting at a hackathon:

1. **What the smart contract does** — explain every function, who calls it,
   what gets stored, what events are emitted, why each function exists

2. **What the Pinata integration does** — explain IPFS, CIDs, why we store
   the CID on-chain instead of the image itself, what "content-addressed" means
   in simple terms

3. **Why we use blockchain** — the core answer to the most common judge
   question. 3-4 sentences, compelling, honest

4. **How the government access control works** — explain the whitelist,
   why it's sufficient for a hackathon, what production would look like

5. **How reporter confirmation works** — explain the full flow from government
   marking resolved to reporter confirming or disputing, why this matters

6. **What the activity feed does technically** — explain event querying,
   why reads are free, how auto-refresh works

7. **The escalation chain** — explain Ward → Federal, what escalationLevel
   means in the contract, how the timeline UI reflects on-chain state

8. **Answers to 10 likely judge questions** with clear responses

9. **A glossary** of every technical term used (gas, CID, ABI, signer,
   provider, event, struct, mapping, testnet) in one plain-English sentence each

10. **How to demo the app** — exact step by step walkthrough of the live demo,
    which wallet to use for each action, what to say at each step

---

## Critical Rules for Copilot

1. **Never break existing working functionality.** The submit report flow,
   Pinata upload, and basic tracking already work. Improve, don't replace.

2. **JavaScript only.** No TypeScript, no type annotations, no `.ts` files.

3. **ethers.js v6 syntax only.** `BrowserProvider` not `Web3Provider`.
   `provider.getSigner()` not `provider.getSigner(0)`.

4. **All blockchain reads use `getReadOnlyContract()`** (no MetaMask needed).
   All blockchain writes use `getContractWithSigner()` (MetaMask required).

5. **All errors must be human-readable.** No raw error objects shown to users.
   Catch blocks must set a string error message, never `error.toString()`.

6. **Every component exports as default.**

7. **No inline styles.** Tailwind classes only. Use the custom classes defined
   in Section 8 for consistency.

8. **The `.env` file is never modified or committed.** All env access via
   `import.meta.env.VITE_*`.

9. **The smart contract must be fully redeployable.** After Copilot generates
   the updated contract, provide exact Remix deployment instructions.

10. **Generate `WHAT_WE_BUILT.md` last**, after all code is complete.
    This file is non-negotiable — the team needs it to present confidently.
