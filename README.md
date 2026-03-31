# Echo (Aawaj) — Blockchain Civic Reporting for Nepal

> **Hackathon project — Hack Midwest Blockathon**

Echo is a citizen evidence reporting dApp built on the **Polygon Amoy** blockchain for Nepal. Citizens photograph and report civic problems (broken roads, waste, street lighting, drainage, etc.). Every report is stored immutably on-chain — no government body can delete it or fake a resolution.

**Live Demo:** _[Add your Vercel URL here]_  
**Contract on Polygonscan:** `https://amoy.polygonscan.com/address/<VITE_CONTRACT_ADDRESS>`

---

## What It Does

- **Submit a report** — Upload photo evidence (stored on IPFS via Pinata), add location and category, and write the report to the blockchain. You get a permanent Report ID.
- **Track your report** — Enter your Report ID to see its full status, IPFS evidence image, and escalation level.
- **Escalation chain** — Reports can be escalated from Ward → Municipality → District → Province → Federal level. Every escalation is a permanent on-chain transaction.
- **Reporter confirmation** — When a government body marks an issue as resolved, the original reporter must confirm the fix. If they dispute it, the report is automatically re-escalated.
- **Government dashboard** — Wallet-gated dashboard (whitelist-controlled) for authorized government bodies to load reports and take action.
- **Live activity feed** — Homepage shows the last 10 reports from the blockchain, auto-refreshing every 30 seconds.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite (JavaScript) |
| Styling | TailwindCSS |
| Blockchain | Polygon Amoy testnet |
| Smart Contract | Solidity ^0.8.20 |
| Blockchain Library | ethers.js v6 |
| File Storage | Pinata SDK (IPFS) |
| Routing | react-router-dom v7 |
| Wallet | MetaMask (window.ethereum) |
| Deployment | Vercel (frontend) + Polygon Amoy (contract) |

---

## Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MetaMask](https://metamask.io/) browser extension
- A Pinata account ([pinata.cloud](https://pinata.cloud))
- Polygon Amoy testnet POL (free from [faucet](https://faucet.polygon.technology/))

### Install & Run

```bash
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_PINATA_GATEWAY=your_pinata_gateway_subdomain
VITE_CONTRACT_ADDRESS=deployed_contract_address
VITE_RPC_URL=your_alchemy_polygon_amoy_rpc_url
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## Smart Contract

The contract (`src/contracts/AawajRegistry.sol`) is deployed on **Polygon Amoy testnet**.

### Key Functions

| Function | Who Calls It | Description |
|---|---|---|
| `submitReport(ipfsHash, location, category)` | Citizen | Creates a new report on-chain |
| `updateStatus(reportId, status)` | Government | Updates report status |
| `escalateReport(reportId)` | Government | Escalates to next government tier |
| `markPendingConfirmation(reportId)` | Government | Marks as resolved, awaiting reporter confirmation |
| `confirmResolution(reportId)` | Original reporter only | Confirms the fix — closes the report |
| `disputeResolution(reportId)` | Original reporter only | Disputes the resolution — re-escalates |
| `getRecentReportIds(count)` | Anyone (free read) | Returns last N report IDs for the activity feed |

### Report Status Flow

```
Submitted (0) → In Review (1) → Escalated (2) → Pending Confirmation (3) → Resolved (4)
                                                                          ↘ Disputed (5) → back to Escalated
```

---

## Project Structure

```
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/             # useWallet, useContract
│   ├── pages/             # HomePage, SubmitReportPage, TrackReportPage, GovDashboardPage
│   ├── utils/             # contract.js (ethers), pinata.js (IPFS)
│   ├── constants/         # Status configs, escalation levels, categories
│   └── contracts/         # ABI JSON + Solidity source
├── public/
├── index.html
├── vite.config.js
└── vercel.json
```

---

## Why Blockchain?

Traditional civic reporting apps let government bodies delete complaints or mark issues as resolved without any accountability. Blockchain makes every report and every action **permanent and public**. Nobody can alter the history. The reporter — not the government — has the final say on whether something is actually fixed.

---

## Team

Built at **Hack Midwest Blockathon** by Rijul Poudel.

---

## License

MIT
