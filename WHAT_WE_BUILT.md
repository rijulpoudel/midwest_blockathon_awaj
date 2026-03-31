# WHAT WE BUILT — Echo 🇳🇵

A comprehensive guide for our hackathon presentation. Read this before the demo.

---

## 1. What the Smart Contract Does

Our smart contract (`EchoRegistry.sol`) is deployed on Polygon Amoy testnet. It is the single source of truth for every civic report.

### Data Structure

Every report is a `struct` with 11 fields:

| Field               | Type    | Purpose                                                                             |
| ------------------- | ------- | ----------------------------------------------------------------------------------- |
| `id`                | uint256 | Auto-incrementing unique ID                                                         |
| `reporter`          | address | Wallet address of the citizen who submitted                                         |
| `ipfsHash`          | string  | The IPFS CID pointing to evidence metadata                                          |
| `location`          | string  | Where the problem is (e.g., "Lalitpur Ward 5")                                      |
| `category`          | string  | Type of issue (Road Damage, Water Supply, etc.)                                     |
| `status`            | uint8   | 0=Submitted, 1=InReview, 2=Escalated, 3=PendingConfirmation, 4=Resolved, 5=Disputed |
| `timestamp`         | uint256 | Unix timestamp when the report was created                                          |
| `assignedBody`      | string  | Which government body is handling it                                                |
| `escalationLevel`   | uint8   | 0=Ward, 1=Municipality, 2=District, 3=Province, 4=Federal                           |
| `reporterConfirmed` | bool    | Whether the original reporter confirmed the resolution                              |
| `lastUpdated`       | uint256 | Unix timestamp of the most recent status change                                     |

### Functions

1. **`submitReport(ipfsHash, location, category)`** — Called by any citizen. Creates a new report with status 0, escalation level 0. Emits `ReportSubmitted` event.

2. **`updateReportStatus(id, newStatus)`** — Called by government. Changes the status of a report. Emits `StatusUpdated` event.

3. **`escalateReport(id)`** — Called by government. Increases escalation level by 1 (Ward → Municipality → District → Province → Federal). Sets status to 2 (Escalated). Emits `ReportEscalated` event.

4. **`markPendingConfirmation(id)`** — Called by government. Sets status to 3, signaling the reporter should verify the fix. Emits `StatusUpdated` event.

5. **`confirmResolution(id)`** — Called ONLY by the original reporter. Sets status to 4 (Resolved) and `reporterConfirmed` to true. Emits `ResolutionConfirmed` event.

6. **`disputeResolution(id)`** — Called ONLY by the original reporter. Sets status to 5 (Disputed), escalates the report by 1 level. Emits `ResolutionDisputed` event.

7. **`getReport(id)`** — Read-only. Returns all 11 fields. Free to call (no gas).

8. **`getReportCount()`** — Read-only. Returns total number of reports. Free to call.

9. **`getRecentReportIds(count)`** — Read-only. Returns the IDs of the last N reports (up to 20). Used for the live activity feed.

### Events

- `ReportSubmitted(id, reporter, ipfsHash)` — New report created
- `StatusUpdated(id, newStatus, updatedBy)` — Status changed
- `ReportEscalated(id, newLevel, escalatedBy)` — Escalation level increased
- `ResolutionConfirmed(id, reporter)` — Reporter confirmed the fix
- `ResolutionDisputed(id, reporter)` — Reporter rejected the fix
- `AssignedBodyUpdated(id, body)` — Government body assignment changed

---

## 2. What the Pinata Integration Does

### What is IPFS?

IPFS (InterPlanetary File System) is a decentralized storage network. Instead of storing files on one server, files are distributed across many nodes worldwide.

### What is a CID?

A CID (Content Identifier) is a unique fingerprint of a file. It's generated from the file's content using cryptographic hashing. If even one pixel of an image changes, the CID changes completely. This is what "content-addressed" means — the address IS the content's fingerprint.

### Why Pinata?

Pinata is an IPFS pinning service. We upload our evidence photos and metadata JSON to Pinata, which pins them on IPFS so they stay available. Pinata gives us a gateway URL to view the files.

### Our Upload Flow

1. Citizen takes a photo → uploaded to Pinata → returns `imageCID`
2. We create a metadata JSON object (image CID, location, category, description, timestamp, reporter address) → uploaded to Pinata → returns `metadataCID`
3. Only the `metadataCID` string is stored on the blockchain (storing images on-chain would cost thousands of dollars in gas)

### Why CID on-chain instead of the image?

Blockchain storage is expensive (~$0.01 per byte on Ethereum). A 1MB photo would cost ~$10,000. Instead, we store the 46-character CID string (~$0.05) and this CID mathematically proves the evidence hasn't been tampered with.

---

## 3. Why We Use Blockchain

**The most common judge question: "Why not just use a regular database?"**

> We use blockchain because civic reports in Nepal are routinely ignored, lost, or deleted by the institutions responsible for addressing them. A traditional database can be modified by its administrator — records can be deleted, timestamps can be changed, and there's no way for citizens to prove a report ever existed. By writing reports to the Polygon blockchain, every submission becomes permanent, timestamped, and publicly verifiable. No government official, no database admin, and no politician can erase a citizen's voice. The blockchain IS the accountability.

---

## 4. How Government Access Control Works

### The Whitelist

In `constants/index.js`, we maintain `AUTHORIZED_GOV_WALLETS` — an array of Ethereum addresses that are allowed to access the Government Dashboard.

When someone navigates to `/gov-dashboard`:

1. We check if their connected wallet address is in the whitelist
2. If NOT authorized → they see a lock screen with "Unauthorized Access"
3. If authorized → they see the full dashboard with action buttons

### Why This is Sufficient for a Hackathon

For a demo, a hardcoded whitelist proves the concept. The government official's wallet address is known and verified offline.

### What Production Would Look Like

In production, you'd implement:

- A governance smart contract where authorized addresses are managed on-chain
- Multi-signature approval for adding new government wallets
- Role-based access (ward-level vs district-level permissions)
- Integration with Nepal's eGovernance system for identity verification

---

## 5. How Reporter Confirmation Works

This is Echo's most innovative feature — it closes the accountability loop.

### The Full Flow

1. **Citizen submits report** → Status: Submitted (0)
2. **Government reviews** → Status: In Review (1)
3. **Government claims it's fixed** → calls `markPendingConfirmation()` → Status: Pending Confirmation (3)
4. **The ORIGINAL reporter (and only them)** gets to verify:
   - **Confirm** → calls `confirmResolution()` → Status: Resolved (4), `reporterConfirmed = true`
   - **Dispute** → calls `disputeResolution()` → Status: Disputed (5), escalation level increases by 1

### Why This Matters

Without reporter confirmation, governments can close tickets without actually fixing anything. Echo forces resolution verification by the person who reported the problem. If they dispute, the report automatically escalates to a higher authority — creating real pressure to actually fix things.

---

## 6. What the Activity Feed Does Technically

### How It Works

The HomePage shows a "Live on Blockchain" feed of recent reports.

1. We call `getRecentReportIds(10)` — this returns the IDs of the last 10 reports
2. For each ID, we call `getReport(id)` to get full details
3. Reports are sorted by timestamp (newest first)
4. The feed auto-refreshes every 30 seconds using `setInterval`

### Why Reads Are Free

On Ethereum/Polygon, there are two types of operations:

- **Write operations** (transactions): Cost gas, change blockchain state, require wallet signature
- **Read operations** (calls): FREE, don't change state, don't need a wallet

Our activity feed only reads data, so it costs nothing and doesn't require MetaMask. Anyone can view the feed without connecting a wallet.

---

## 7. The Escalation Chain

### How It Works

Every report starts at **Ward level** (escalationLevel = 0). Nepal's government structure has 5 levels:

| Level | Name         | Icon | Description             |
| ----- | ------------ | ---- | ----------------------- |
| 0     | Ward         | 🏘️   | Local ward office       |
| 1     | Municipality | 🏙️   | City municipality       |
| 2     | District     | 🏛️   | District administration |
| 3     | Province     | 🏗️   | Provincial government   |
| 4     | Federal      | 🇳🇵   | Central government      |

### Escalation Triggers

- **Government escalates manually**: Clicks "Escalate to [Next Level]" on dashboard
- **Reporter disputes resolution**: Automatically escalates by 1 level

### The Timeline UI

The `EscalationTimeline` component renders all 5 levels:

- **Past levels**: Green with checkmark ✓
- **Current level**: Pulsing green dot (animated)
- **Future levels**: Gray and faded
- **Horizontal on desktop**, vertical on mobile

The timeline directly reflects the `escalationLevel` value stored on-chain — it's not cosmetic, it's real blockchain state.

---

## 8. Answers to 10 Likely Judge Questions

### Q1: "Why blockchain? Why not a regular database?"

See Section 3. Short version: A database admin can delete records. Blockchain can't. For civic accountability, immutability isn't a feature — it's the whole point.

### Q2: "How is evidence stored?"

Photos go to IPFS via Pinata (decentralized storage). Only the CID (content fingerprint) goes on-chain. This keeps costs low while guaranteeing evidence integrity through content-addressing.

### Q3: "What happens if the government ignores a report?"

The report escalates. It starts at the Ward level. If unresolved, it moves to Municipality, then District, then Province, then Federal. A disputed resolution automatically escalates. The report can never be deleted.

### Q4: "Is this on a real blockchain?"

Yes. We're on Polygon Amoy testnet — same technology as Polygon mainnet, but with free test tokens. Moving to mainnet requires only changing the RPC URL and chain ID. The code is production-ready.

### Q5: "How do you prevent fake reports?"

Every report is tied to a wallet address. Submitting requires a MetaMask transaction, which costs gas. This creates a small economic barrier against spam. In production, you could add staking requirements or reputation scores.

### Q6: "Can the government cheat the system?"

Government can change statuses, but every action is recorded on-chain with timestamps and wallet addresses. They cannot delete reports or forge timestamps. If they mark something resolved and the reporter disputes it, the dispute is publicly visible and the report escalates.

### Q7: "How much does it cost to use?"

On Polygon, each transaction costs less than $0.01. Reading data (tracking reports, viewing the feed) is completely free. IPFS storage via Pinata's free tier handles our demo needs.

### Q8: "What's your tech stack?"

React 19 + Vite for the frontend. Solidity 0.8.20 for the smart contract. ethers.js v6 for blockchain interaction. Pinata REST API for IPFS storage. Polygon Amoy testnet. TailwindCSS for styling.

### Q9: "How would this scale to all of Nepal?"

Polygon handles thousands of transactions per second at fractions of a cent. IPFS scales through more pinning nodes. The frontend is a static site deployable on Vercel's CDN. The bottleneck would be government adoption, not technology.

### Q10: "What makes Echo different from existing complaint systems?"

Three things: (1) Immutability — reports can't be deleted, (2) Reporter confirmation — citizens verify fixes, not bureaucrats, (3) Escalation — ignored reports automatically climb the government hierarchy. No existing system in Nepal has any of these.

---

## 9. Glossary

| Term                 | Plain English Definition                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gas**              | The fee you pay to write data to the blockchain. Like postage for sending a letter.                                                                       |
| **CID**              | Content Identifier — a unique fingerprint generated from a file's contents. Changes if even one bit changes.                                              |
| **ABI**              | Application Binary Interface — a JSON file that tells our frontend what functions the smart contract has and how to call them. Like an API specification. |
| **Signer**           | A connected wallet (MetaMask) that can sign transactions. Required for any operation that writes to the blockchain.                                       |
| **Provider**         | A connection to the blockchain network. Read-only — doesn't need a wallet. Like a phone line to the blockchain.                                           |
| **Event**            | A log entry emitted by the smart contract when something happens. Cheap to emit, useful for tracking activity.                                            |
| **Struct**           | A custom data structure in Solidity. Like a class or object — groups related fields together.                                                             |
| **Mapping**          | A key-value store in Solidity. Like a dictionary or hash map. We use `mapping(uint256 => Report)` to store reports by ID.                                 |
| **Testnet**          | A practice blockchain with free fake tokens. Same code, same rules, no real money. We use Polygon Amoy testnet.                                           |
| **IPFS**             | InterPlanetary File System — a decentralized network for storing files. No single server owns the data.                                                   |
| **Pinata**           | A service that pins (keeps alive) files on IPFS and provides gateway URLs to access them.                                                                 |
| **MetaMask**         | A browser extension wallet for interacting with blockchains. Stores your private keys and signs transactions.                                             |
| **Polygon**          | A Layer 2 blockchain built on Ethereum. Same security, much cheaper and faster.                                                                           |
| **Smart Contract**   | A program deployed on the blockchain. Once deployed, the code can't be changed. It runs exactly as written.                                               |
| **Transaction Hash** | A unique ID for every blockchain transaction. Can be used to look up the transaction on a block explorer.                                                 |

---

## 10. How to Demo the App

### Setup Before Demo

1. Have MetaMask installed with two wallets:
   - **Citizen wallet**: Any wallet with some Amoy test MATIC
   - **Government wallet**: The wallet address listed in `AUTHORIZED_GOV_WALLETS`
2. Have the app running at `localhost:5173` or deployed on Vercel
3. Have a sample photo ready on your computer (a pothole, broken road, anything)

### Demo Script (5 minutes)

**Step 1: Show the Homepage (30 seconds)**

- "This is Echo — a citizen evidence reporting platform for Nepal"
- Point out the live activity feed: "Every card here is a real blockchain record"
- Point out stats: "These numbers come directly from the smart contract"

**Step 2: Submit a Report as a Citizen (2 minutes)**

- Click "Submit a Report"
- Connect the citizen wallet via MetaMask
- Upload a photo: "This photo is about to be stored permanently on IPFS"
- Fill in location (show the autocomplete), category, description
- Click Submit: "Watch — three things happen: photo goes to IPFS, metadata goes to IPFS, then the CID is written to the blockchain"
- Watch the loading states
- Show the success screen: "Report #X — this number is permanent and can never be deleted"
- Click "View on IPFS" to show the stored metadata

**Step 3: Track the Report as a Citizen (30 seconds)**

- Go to Track Report
- Enter the report ID
- Show all the details: evidence image, escalation timeline at Ward level, status badge
- "Everything you see here is read directly from the blockchain — no database"

**Step 4: Government Dashboard (1.5 minutes)**

- Switch MetaMask to the government wallet
- Go to `/gov-dashboard`
- "Notice — only authorized government wallets can access this"
- Load the report by ID
- Click "Mark In Review" → show status update on-chain
- Click "Mark as Resolved (Pending Confirmation)" → "Now the citizen has to verify"

**Step 5: Reporter Confirmation (30 seconds)**

- Switch back to citizen wallet
- Go to Track Report, enter the ID
- "See — it says Pending Confirmation. The government says it's fixed."
- Show the Confirm/Dispute buttons
- Click Dispute: "The citizen doesn't agree — watch what happens"
- "The report just escalated to Municipality level AND the status changed to Disputed"
- "This is real accountability — you can't close a ticket without the citizen agreeing"

### Key Talking Points During Demo

- "Every action is a blockchain transaction — permanent and public"
- "The citizen has the final say, not the government"
- "This costs less than one cent per report on Polygon"
- "The evidence is on IPFS — no server can take it down"
- "If the government ignores it, it automatically escalates up the chain"
