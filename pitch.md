# AAWAJ — Hackathon Pitch Bible 🇳🇵

> **"Aawaj" (आवाज) means "Voice" in Nepali.**
> This document is your complete preparation guide. Read it cover to cover before the pitch.
> Every blockchain/Web3 concept is explained from scratch. Nothing is assumed.

---

## TABLE OF CONTENTS

1. [The 60-Second Elevator Pitch](#1-the-60-second-elevator-pitch)
2. [Blockchain 101 — What You MUST Know](#2-blockchain-101--what-you-must-know)
3. [Smart Contracts 101](#3-smart-contracts-101)
4. [Our Smart Contract — AawajRegistry.sol](#4-our-smart-contract--aawajregistrysol)
5. [Polygon Amoy — The Network We Use](#5-polygon-amoy--the-network-we-use)
6. [IPFS & Pinata — Where Evidence Lives](#6-ipfs--pinata--where-evidence-lives)
7. [The Walletless Relayer — Our Biggest Innovation](#7-the-walletless-relayer--our-biggest-innovation)
8. [Confirmation Codes — Identity Without Wallets](#8-confirmation-codes--identity-without-wallets)
9. [The 9-Status Nepal Escalation Chain](#9-the-9-status-nepal-escalation-chain)
10. [The Full Tech Stack](#10-the-full-tech-stack)
11. [MetaMask & Wallets Explained](#11-metamask--wallets-explained)
12. [ethers.js — How Our App Talks to Blockchain](#12-ethersjs--how-our-app-talks-to-blockchain)
13. [Gas Fees — Why Transactions Cost Money](#13-gas-fees--why-transactions-cost-money)
14. [Architecture Diagram — How Everything Connects](#14-architecture-diagram--how-everything-connects)
15. [The 5-Minute Pitch Script](#15-the-5-minute-pitch-script)
16. [The 3-Minute Pitch Script (If Time Is Short)](#16-the-3-minute-pitch-script-if-time-is-short)
17. [Demo Walkthrough](#17-demo-walkthrough)
18. [30 Judge Questions & Answers](#18-30-judge-questions--answers)
19. [Glossary — Every Term You Might Hear](#19-glossary--every-term-you-might-hear)
20. [Emergency Cheat Sheet — Print This Page](#20-emergency-cheat-sheet--print-this-page)

---

## 1. The 60-Second Elevator Pitch

> **"In Nepal, civic complaints disappear. A citizen reports a broken road, and nothing happens. The complaint gets lost. Officials deny it existed. There is no accountability.**
>
> **Aawaj fixes this by putting every report on the blockchain — making it permanent, public, and impossible to delete. Citizens upload photo evidence that gets stored on IPFS, a decentralized storage system, so no single server can take it down. The evidence fingerprint is written to the Polygon blockchain.**
>
> **But here's the truly innovative part: citizens don't need a crypto wallet. We built a walletless relayer system that handles blockchain transactions behind the scenes. A farmer in rural Nepal can submit a report with just a phone and an internet connection — no MetaMask, no private keys, no crypto knowledge.**
>
> **When the government says they fixed the problem, the citizen gets to verify. If they disagree, the report automatically escalates — from Ward to Municipality to Province to Federal. The citizen has the final say, not the bureaucrat.**
>
> **Aawaj means Voice. And once your voice is on the blockchain, it can never be silenced."**

---

## 2. Blockchain 101 — What You MUST Know

### What IS a blockchain?

A blockchain is a **digital ledger** (like a spreadsheet) that is:

- **Distributed**: Copies exist on thousands of computers worldwide, not one company's server
- **Immutable**: Once data is written, it **cannot** be changed or deleted. Ever. By anyone.
- **Transparent**: Anyone can read the ledger. Every entry is public.

Think of it like writing in permanent ink in a notebook that everyone has a copy of. You can add new pages, but you can never rip out old ones or use whiteout.

### Blocks and Chains

- **Block**: A bundle of transactions (like a page in the notebook). Each block contains: transactions, a timestamp, and a reference to the previous block.
- **Chain**: Each block points to the one before it, forming a chain. If you tamper with an old block, every block after it breaks — making tampering obvious.

### Consensus — Why You Can't Cheat

If one person tries to write a fake entry, the other thousands of computers reject it because their copies don't match. This is called **consensus** — the network only accepts data that the majority agrees on.

### Who Runs the Blockchain?

**Nobody and everybody.** There's no CEO, no company, no server room. Thousands of independent computers (called **nodes**) all run the same software. This is why it's called **decentralized** — there is no single point of failure or control.

### Writing vs. Reading

- **Writing** (a transaction): Costs money (gas fees), changes the blockchain state, requires a signature
- **Reading** (a call): FREE, doesn't change anything, doesn't need a signature

**In our app**: Submitting a report = writing (costs gas). Viewing a report = reading (free).

### Why Blockchain for Nepal?

In Nepal, civic reports are routinely:

- **Ignored** — officials simply don't act
- **Lost** — records disappear from filing cabinets or databases
- **Deleted** — administrators erase inconvenient records
- **Denied** — officials claim no report was ever filed

A blockchain makes all of this **impossible**. Once a report is on-chain, no government official, no database admin, no politician can erase it. The blockchain IS the accountability.

---

## 3. Smart Contracts 101

### What IS a Smart Contract?

A smart contract is a **program** that lives on the blockchain. Think of it like a vending machine:

- You put in money → the machine gives you a snack
- The rules are fixed — the machine can't decide to keep your money
- Nobody can reach inside and change how it works

A smart contract works the same way:

- You send a transaction → the contract follows its coded rules
- Once deployed, the code **cannot be changed**
- It executes exactly as written, every time, for everyone

### Solidity

**Solidity** is the programming language used to write smart contracts on Ethereum-compatible blockchains (including Polygon). It looks similar to JavaScript but compiles to bytecode that runs on the blockchain's virtual machine (called the EVM — Ethereum Virtual Machine).

### Deploying a Contract

When you **deploy** a smart contract:

1. You write the code in Solidity
2. You compile it (turn human-readable code into machine code)
3. You send a special transaction that puts that code on the blockchain
4. The blockchain gives you a **contract address** — a unique identifier, like an apartment number
5. From now on, anyone can interact with that contract at that address

Once deployed, the code is permanent. You cannot edit it. You cannot delete it. You can only interact with it using the functions you defined.

### ABI — The Contract's Menu

The **ABI** (Application Binary Interface) is a JSON file that describes what functions the contract has, what parameters they accept, and what they return. Think of it like a restaurant menu — it tells the frontend "here's what you can order."

Our ABI file is `EchoRegistry.json` — it describes the functions of our `AawajRegistry` contract.

---

## 4. Our Smart Contract — AawajRegistry.sol

This is the heart of the entire application. Here's exactly what it does:

### The Status Enum (9 Statuses)

```solidity
enum Status {
    Submitted,              // 0 — Citizen just filed the report
    InReview,               // 1 — Government is looking at it
    EscalatedWard,          // 2 — Sent to Ward level
    EscalatedMunicipality,  // 3 — Sent to Municipality level
    EscalatedProvince,      // 4 — Sent to Province level
    EscalatedFederal,       // 5 — Sent to Federal level
    GovResolved,            // 6 — Government says it's fixed
    ConfirmedResolved,      // 7 — Citizen AGREES it's fixed
    Disputed                // 8 — Citizen DISAGREES, says it's NOT fixed
}
```

This is modeled after Nepal's actual governance hierarchy: Ward → Municipality → Province → Federal.

### The Report Structure

Every report stored on the blockchain has these 7 fields:

| Field       | Type    | What It Stores                                          |
| ----------- | ------- | ------------------------------------------------------- |
| `id`        | uint256 | Auto-incrementing unique report ID (1, 2, 3...)         |
| `submitter` | address | The blockchain address that submitted it                |
| `ipfsCid`   | string  | The IPFS content identifier for the evidence metadata   |
| `location`  | string  | Where the problem is (e.g., "Kathmandu Metropolitan")   |
| `category`  | string  | Type of issue (Road Damage, Water Supply, etc.)         |
| `status`    | Status  | Current status (0–8, using the enum above)              |
| `timestamp` | uint256 | Unix timestamp when the report was created (in seconds) |

### The Functions

**1. `submitReport(ipfsCid, location, category)` → returns report ID**

- Anyone can call this
- Creates a new report with status = Submitted (0)
- Stores the IPFS CID (not the image — just the fingerprint)
- Auto-increments the report counter
- Emits a `ReportSubmitted` event

**2. `updateStatus(reportId, newStatus)` → no return**

- Changes the status of a report to any of the 9 values
- Used by government to escalate, resolve, or review
- Used by citizens to confirm or dispute resolutions
- Emits a `StatusUpdated` event

**3. `getReport(reportId)` → returns the full Report struct**

- Read-only (free to call, no gas)
- Returns all 7 fields of the requested report
- Anyone can call this — reports are public

**4. `getReportCount()` → returns total count**

- Read-only (free)
- Returns how many reports have been submitted total

### Events (Logs on the Blockchain)

Events are special logs that get recorded when something happens. They're cheap to emit and useful for tracking activity.

- **`ReportSubmitted(id, submitter, ipfsCid)`** — Fired when a new report is created
- **`StatusUpdated(id, newStatus)`** — Fired when any status changes

### The Constructor

```solidity
constructor() { government = msg.sender; }
```

When the contract is first deployed, whoever deploys it becomes the `government` address. This address is stored permanently.

---

## 5. Polygon Amoy — The Network We Use

### What is Polygon?

**Polygon** is a **Layer 2** blockchain built on top of Ethereum.

- **Layer 1** = Ethereum (the main chain, expensive, slow)
- **Layer 2** = Polygon (built on top of Ethereum, fast, cheap, inherits Ethereum's security)

Think of it like this:

- Ethereum is the highway (secure but congested and expensive)
- Polygon is the express lane (same destination, but faster and cheaper)

### Why Polygon Instead of Ethereum?

| Feature          | Ethereum    | Polygon                |
| ---------------- | ----------- | ---------------------- |
| Transaction cost | $5–$50      | $0.001–$0.01           |
| Speed            | ~15 seconds | ~2 seconds             |
| Security         | Maximum     | Inherits from Ethereum |
| TPS              | ~15         | ~7,000                 |

For civic reporting where every transaction needs to be cheap, Polygon is perfect. A citizen shouldn't pay $20 to report a broken road.

### What is Amoy?

**Amoy** is Polygon's **testnet** — a practice blockchain with free test tokens.

- **Same technology** as the real Polygon mainnet
- **Same code**, same rules, same smart contract language
- **Free tokens** (test MATIC) — no real money involved
- Used for development and demos

**If a judge asks "Is this real?":**

> "We're on Polygon Amoy testnet — it uses the exact same technology, protocol, and consensus mechanism as Polygon mainnet. Moving to mainnet requires changing only two values: the RPC URL and the chain ID. The smart contract, the frontend, and all the logic are production-ready. We use testnet because real MATIC costs real money, and we're a hackathon team."

### Key Network Details

| Detail         | Value                                 |
| -------------- | ------------------------------------- |
| Chain ID       | 80002                                 |
| Network Name   | Polygon Amoy Testnet                  |
| Currency       | MATIC (test)                          |
| RPC URL        | `https://rpc-amoy.polygon.technology` |
| Block Explorer | `https://amoy.polygonscan.com`        |

---

## 6. IPFS & Pinata — Where Evidence Lives

### What is IPFS?

**IPFS** (InterPlanetary File System) is a **decentralized file storage network**.

Traditional web: Files live on one server (AWS, Google). If that server goes down or the company deletes the file, it's gone.

IPFS: Files are distributed across many computers worldwide. No single entity controls them. No single point of failure.

### Content Addressing (This Is Important!)

On the regular web, you find files by **location** (URL):

- `https://google.com/photo.jpg` — if Google moves or deletes the file, the link breaks

On IPFS, you find files by **content** (CID):

- `QmX4z...abc123` — this hash is generated FROM the file's contents
- If even one pixel changes, the hash changes completely
- The hash IS a mathematical proof that the content hasn't been tampered with

This is called **content addressing** — the address is derived from the content itself.

### CID — Content Identifier

A **CID** is the unique fingerprint of a file on IPFS. It's generated using cryptographic hashing (SHA-256).

Example: `QmT4AjP7Z8Q8Y3G6F2DAK5tRqL2X9BKN7cP8dZ5Rq4E1Fg`

If someone asks "how do you prove the evidence is real?":

> "The CID stored on the blockchain is a cryptographic hash of the evidence. If anyone tampers with the photo — even changing a single pixel — the hash would be completely different. The hash on the blockchain would no longer match the tampered file, proving tampering occurred."

### What is Pinata?

**Pinata** is an IPFS **pinning service**. IPFS nodes can remove data they don't need. Pinning means telling a node "keep this file permanently available." Pinata handles this for us and gives us:

1. A reliable upload API
2. A gateway to access files via HTTP

### Our Upload Flow

```
Citizen takes photo
        ↓
Photo uploaded to Pinata → returns imageCID
        ↓
We create metadata JSON:
{
  title: "Road Damage in Kathmandu",
  description: "Large pothole...",
  location: "Kathmandu Metropolitan City",
  category: "Road Damage",
  imageCID: "QmX4z...abc123",
  timestamp: "2025-07-19T...",
  confirmationCodeHash: "a3f8c9d..."  ← SHA-256 hash (NOT the code itself!)
}
        ↓
Metadata JSON uploaded to Pinata → returns metadataCID
        ↓
metadataCID written to blockchain (via smart contract)
```

### Why Not Store Images On-Chain?

Blockchain storage is astronomically expensive:

- Ethereum: ~$0.01 per byte → a 1MB photo would cost **~$10,000**
- Polygon: cheaper but still impractical for images

Instead, we store only the **46-character CID string** on-chain (~$0.001) and this CID mathematically guarantees the evidence hasn't been tampered with.

---

## 7. The Walletless Relayer — Our Biggest Innovation

### The Problem

To write data to a blockchain, you normally need:

1. A crypto wallet (like MetaMask)
2. Cryptocurrency to pay for gas fees
3. Knowledge of how to sign transactions

**In Nepal:**

- Most citizens have never heard of MetaMask
- They don't own cryptocurrency
- They might be using a borrowed phone
- Asking them to install a browser extension and buy MATIC is a non-starter

### The Solution: The Relayer Pattern

We created a **relayer** — a server-side wallet that submits transactions **on behalf of citizens**.

```
TRADITIONAL WAY (broken for Nepal):
Citizen → MetaMask wallet → signs transaction → pays gas → blockchain

OUR WAY (walletless):
Citizen → fills out form → our relayer wallet signs & pays → blockchain
```

### How It Works Technically

1. Citizen fills out the report form (no wallet needed)
2. Our frontend calls `submitFullReport()` which:
   - Uploads image to IPFS
   - Generates a confirmation code (AAWAJ-XXXXXXXX)
   - Hashes the code with SHA-256
   - Uploads metadata (with hash, NOT the code) to IPFS
   - Calls the relayer with the IPFS CID, location, and category
3. The relayer:
   - Has its own private key stored securely in environment variables
   - Creates an ethers.js `Wallet` connected to Polygon Amoy
   - Signs and submits the transaction using ITS funds (test MATIC)
   - Parses the `ReportSubmitted` event to get the report ID
4. Returns the report ID and confirmation code to the citizen

**The citizen never touches a wallet. They never pay gas. They never sign anything.**

### Why This Matters (For the Pitch)

> "We solved the biggest adoption barrier in blockchain: the wallet problem. Over 4 billion people in developing countries don't have crypto wallets. Our relayer pattern means a farmer in rural Nepal can report corruption with just a phone and an internet connection. They don't need to understand blockchain, gas fees, or private keys. The blockchain works invisibly behind the scenes, providing its guarantees of immutability and transparency without imposing its complexity on the user."

### What About the Government Dashboard?

Government officials DO use MetaMask — they have trained IT staff and dedicated hardware. The wallet requirement is appropriate for officials who need to be identified and held accountable for their status changes. Their wallet address is recorded on-chain with every action.

---

## 8. Confirmation Codes — Identity Without Wallets

### The Problem With Walletless

If citizens don't have wallets, how do we know who submitted a report? How can the **original reporter** (and only them) confirm or dispute a resolution?

With wallets, the blockchain address proves identity. Without wallets, we need another way.

### Our Solution: Confirmation Codes

When a citizen submits a report, we generate a unique **confirmation code**:

```
AAWAJ-X3K7M9P2
```

Format: `AAWAJ-` followed by 8 alphanumeric characters (excluding ambiguous characters like 0/O, 1/I/L to avoid confusion).

### The Security Flow

```
                    CITIZEN SEES:    STORED ON IPFS:    STORED ON-CHAIN:
                    ──────────────   ───────────────    ────────────────
Confirmation code:  AAWAJ-X3K7M9P2  SHA-256 HASH       (nothing)
                                     a3f8c9d2e4...
```

1. **Generation**: `generateConfirmationCode()` creates `AAWAJ-X3K7M9P2`
2. **Hashing**: `hashCode()` runs SHA-256 on it → produces `a3f8c9d2e4...`
3. **Storage**: The **hash** goes into the IPFS metadata. The plaintext code is **NEVER stored anywhere**.
4. **Display**: The code is shown to the citizen ONCE on the success screen. They must save it.
5. **Verification**: When the citizen wants to confirm/dispute, they enter their code. We hash their input and compare it to the hash stored in IPFS. If it matches → they're verified.

### Why This Is Secure

- The actual code is **never stored** (not on server, not in IPFS, not on-chain)
- Only the **SHA-256 hash** is stored, and hashes are one-way (you can't reverse a hash back to the code)
- Even if someone reads the IPFS metadata, they see `a3f8c9d2e4...` — useless without the actual code
- Only the person who was shown the code on the success screen can use it

### If a Judge Asks "What if someone loses their code?"

> "That's by design — it's the same principle as a private key. The confirmation code is the citizen's proof of identity. In production, we'd add optional SMS/email backup delivery. But the security model is sound: the code is shown once, hashed with SHA-256, and only the hash is stored. This is the same approach used by password managers and authentication systems worldwide."

---

## 9. The 9-Status Nepal Escalation Chain

### Why 9 Statuses?

Most complaint systems have 3 statuses: Open, In Progress, Closed. This lets governments quietly close tickets without accountability. Our 9-status system models Nepal's actual governance hierarchy and forces accountability at every level.

### The Complete Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AAWAJ REPORT LIFECYCLE                           │
│                                                                         │
│  (0) Submitted ──→ (1) In Review ──→ Escalation Chain:                 │
│                                       (2) Ward                          │
│                                       (3) Municipality                  │
│                                       (4) Province                      │
│                                       (5) Federal                       │
│                                                                         │
│  At any point after review, government can:                             │
│  ──→ (6) Gov Marked Resolved                                           │
│       │                                                                 │
│       ├──→ Citizen confirms ──→ (7) Confirmed Resolved ✓  DONE         │
│       │                                                                 │
│       └──→ Citizen disputes ──→ (8) Disputed ✗  (escalation continues) │
└─────────────────────────────────────────────────────────────────────────┘
```

### Status Details

| #   | Status                   | Who Triggers It | What It Means                                         |
| --- | ------------------------ | --------------- | ----------------------------------------------------- |
| 0   | Submitted                | Citizen         | Report just filed, waiting for government attention   |
| 1   | In Review                | Government      | Government acknowledged the report                    |
| 2   | Escalated — Ward         | Government      | Assigned to local Ward office                         |
| 3   | Escalated — Municipality | Government      | Moved up to city Municipality                         |
| 4   | Escalated — Province     | Government      | Moved up to Provincial government                     |
| 5   | Escalated — Federal      | Government      | Moved up to Federal/Central government                |
| 6   | Gov Marked Resolved      | Government      | Government claims the issue is fixed                  |
| 7   | Confirmed Resolved       | Citizen         | Citizen AGREES — the problem is actually fixed        |
| 8   | Disputed                 | Citizen         | Citizen DISAGREES — government is lying or incomplete |

### The Escalation Timeline UI

We built a visual timeline that shows exactly where a report is in the escalation chain:

- **Green with checkmark**: Levels already passed through
- **Pulsing green dot**: Current level (animated)
- **Gray and faded**: Future levels not yet reached
- **Horizontal** on desktop, **vertical** on mobile

This timeline reads directly from the blockchain — it's not cosmetic decoration, it's real blockchain state.

### Why the Citizen Has the Final Say

Status 6 (Gov Marked Resolved) is **NOT** the end. The citizen must either:

- **Confirm** (status 7) — agrees the fix is real
- **Dispute** (status 8) — disagrees, says nothing was actually done

This is the accountability loop. A government can't just close a ticket and walk away. If the citizen disputes, the report gets flagged as Disputed and can be escalated further. Every action is recorded on-chain with timestamps.

---

## 10. The Full Tech Stack

### Frontend

| Technology          | Version | What It Does                                       |
| ------------------- | ------- | -------------------------------------------------- |
| **React**           | 19.2.0  | UI framework — renders the web pages               |
| **Vite**            | 7.3.1   | Build tool — bundles the code, runs dev server     |
| **TailwindCSS**     | 3.4.19  | Utility CSS framework — styles without writing CSS |
| **React Router**    | 7.13.1  | Client-side routing — navigates between pages      |
| **lucide-react**    | 0.577.0 | Icon library — camera, search, check icons etc.    |
| **Noto Serif font** | 5.2.9   | Typography — Nepali-appropriate serif font         |

### Blockchain

| Technology       | Version | What It Does                                          |
| ---------------- | ------- | ----------------------------------------------------- |
| **Solidity**     | 0.8.20  | Smart contract language — writes the blockchain logic |
| **ethers.js**    | 6.16.0  | JavaScript library to interact with the blockchain    |
| **Polygon Amoy** | —       | Layer 2 testnet — where the contract is deployed      |
| **MetaMask**     | —       | Browser wallet — used by government officials only    |

### Storage

| Technology | What It Does                                             |
| ---------- | -------------------------------------------------------- |
| **IPFS**   | Decentralized file storage — hosts evidence files        |
| **Pinata** | IPFS pinning service — keeps files permanently available |

### Design Components

| Component              | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| **PageShell**          | Full-page background images with dark overlay   |
| **GlassCard**          | Glassmorphism cards with gradient border mask   |
| **ImageUploadZone**    | Drag-and-drop photo upload with camera icon     |
| **PillButton**         | Rounded pill-shaped buttons (primary/outline)   |
| **LoadingOverlay**     | Full-screen dark blurred loading spinner        |
| **EscalationTimeline** | Horizontal/vertical escalation chain visualizer |

---

## 11. MetaMask & Wallets Explained

### What is a Crypto Wallet?

A crypto wallet is software that stores your **keys**:

- **Public Key** (your address): Like your email address — anyone can see it, anyone can send to it. Example: `0xf474e6...5152`
- **Private Key**: Like your email password — NEVER share it. Whoever has it controls the wallet.

The public key is derived from the private key using math (elliptic curve cryptography). You cannot reverse it.

### What is MetaMask?

MetaMask is a **browser extension** that:

1. Stores your private key securely
2. Shows your balance
3. Pops up when a website wants to do something on the blockchain (like signing a transaction)
4. You click "Confirm" or "Reject" — you're in control

### Who Uses MetaMask in Aawaj?

**Only government officials.** Citizens don't need MetaMask at all because of our relayer pattern.

Government officials need MetaMask because:

- Their wallet address is recorded on-chain (accountability)
- We check their address against an allowlist (access control)
- Only approved addresses can access the Government Dashboard

### The Gov Wallet Allowlist

In our code, we have:

```js
AUTHORIZED_GOV_WALLETS = [
  "0xf474e6Cbf4B9eaF381f2E16BEE244c45aF7A5152",
  "0x9E857799F66979A224A18DAE376387807C0672D2",
];
```

If your wallet isn't on this list → you see a lock screen. If it is → you see the full dashboard.

---

## 12. ethers.js — How Our App Talks to Blockchain

### What is ethers.js?

ethers.js is a **JavaScript library** that lets web applications interact with Ethereum-compatible blockchains. It's the bridge between our React frontend and the Polygon blockchain.

### Key Concepts

**Provider**: A read-only connection to the blockchain. Like a phone line — you can listen, but you can't change anything.

```js
// Anyone can read blockchain data — no wallet needed
const provider = new ethers.JsonRpcProvider(
  "https://rpc-amoy.polygon.technology",
);
```

**Signer**: A wallet that can sign transactions. Like having a checkbook — you can authorize payments.

```js
// For writes — needs MetaMask or a private key
const signer = await provider.getSigner(); // from MetaMask
// OR
const signer = new ethers.Wallet(privateKey, provider); // from private key (relayer)
```

**Contract**: A JavaScript object that represents the smart contract. You call its methods like regular JavaScript functions.

```js
const contract = new ethers.Contract(contractAddress, abi, signerOrProvider);
const report = await contract.getReport(1); // calls the getReport function on-chain
```

### In Our App

- **For citizens (walletless)**: We use a `Wallet` created from the relayer's private key. The citizen never interacts with ethers.js directly.
- **For government**: We use `BrowserProvider` connected to MetaMask. The official signs transactions with their own wallet.
- **For public reads** (home feed, tracking): We use `JsonRpcProvider` — no wallet needed, anyone can read.

---

## 13. Gas Fees — Why Transactions Cost Money

### What is Gas?

**Gas** is the unit that measures computational work on the blockchain. Every operation has a gas cost:

- Storing a number: ~20,000 gas
- Storing a string: ~20,000+ gas (depends on length)
- A simple transfer: ~21,000 gas
- Our `submitReport()`: ~100,000–200,000 gas

### How Gas Becomes Money

```
Transaction cost = Gas used × Gas price

Example:
120,000 gas × 30 gwei = 3,600,000 gwei = 0.0036 MATIC ≈ $0.003
```

**Gwei** is a tiny fraction of MATIC (1 MATIC = 1,000,000,000 gwei).

### Why Does Gas Exist?

Without gas fees, anyone could spam the network with infinite transactions, grinding it to a halt. Gas creates an economic cost for computation, preventing abuse.

### On Polygon Amoy

Gas on Polygon Amoy is paid with **test MATIC** — free tokens that have no real-world value. On Polygon mainnet, it would cost real money, but still extremely cheap (fractions of a cent per transaction).

### Our Gas Strategy

In the relayer code, we set minimum gas tips:

```js
const minTip = 30000000000n; // 30 gwei minimum priority fee
```

This ensures our transactions are processed quickly on the Amoy testnet, which sometimes has slow block times if the tip is too low.

---

## 14. Architecture Diagram — How Everything Connects

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CITIZEN'S BROWSER                          │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐    │
│  │  Submit       │  │  Track       │  │  Home Page              │    │
│  │  Report Page  │  │  Report Page │  │  (Live Feed)           │    │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬───────────┘    │
│         │                  │                        │                │
│         │ NO WALLET        │ NO WALLET              │ NO WALLET     │
│         │ NEEDED           │ NEEDED                 │ NEEDED        │
│         ▼                  │                        │                │
│  ┌──────────────┐          │                        │                │
│  │  Relayer      │          │                        │                │
│  │  (signs tx    │          │                        │                │
│  │   for citizen)│          │                        │                │
│  └──────┬───────┘          │                        │                │
│         │                  │                        │                │
└─────────┼──────────────────┼────────────────────────┼────────────────┘
          │ WRITE            │ READ (free)            │ READ (free)
          ▼                  ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     POLYGON AMOY BLOCKCHAIN                         │
│                                                                     │
│  ┌──────────────────────────────────────────────────┐               │
│  │              AawajRegistry.sol                    │               │
│  │                                                    │               │
│  │  submitReport()    updateStatus()                  │               │
│  │  getReport()       getReportCount()                │               │
│  │                                                    │               │
│  │  Storage: Report structs + ipfsCid strings         │               │
│  └──────────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ ipfsCid points to:
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         IPFS (via Pinata)                           │
│                                                                     │
│  ┌──────────────────┐    ┌──────────────────────────┐              │
│  │  Metadata JSON    │    │  Evidence Photo           │              │
│  │  {                │    │  (original image file)    │              │
│  │    imageCID,      │───▶│                           │              │
│  │    location,      │    └──────────────────────────┘              │
│  │    category,      │                                               │
│  │    codeHash,      │                                               │
│  │    timestamp      │                                               │
│  │  }                │                                               │
│  └──────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     GOV OFFICIAL'S BROWSER                          │
│                                                                     │
│  ┌────────────────────────────────────────────┐                    │
│  │         Government Dashboard                │                    │
│  │  (requires MetaMask + allowlisted wallet)   │                    │
│  └──────────────────────┬─────────────────────┘                    │
│                          │                                          │
│                          │ WRITE (via MetaMask — wallet recorded)   │
│                          ▼                                          │
│              Polygon Amoy Blockchain                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 15. The 5-Minute Pitch Script

**Read this out loud, practice it 3 times. Time yourself.**

---

### Opening — The Problem (45 seconds)

"Nepal has a corruption problem. According to Transparency International, Nepal ranks 110th out of 180 countries on the Corruption Perception Index. Civic complaints — broken roads, contaminated water, stolen public funds — are routinely ignored, lost, or deleted by the very institutions responsible for addressing them.

There is zero accountability. A citizen reports a destroyed road. Six months later, the record is gone. The official says 'we have no such complaint.' The citizen has no proof it ever existed.

We built Aawaj — which means 'Voice' in Nepali — to fix this."

### The Solution — What Aawaj Does (45 seconds)

"Aawaj is a citizen evidence reporting platform powered by blockchain and IPFS.

Citizens photograph civic problems, upload evidence, and file reports that get permanently written to the Polygon blockchain. The evidence is stored on IPFS — a decentralized storage system — so no single server controls it. The IPFS content fingerprint is recorded on-chain, mathematically proving the evidence hasn't been tampered with.

Once a report is on the blockchain, no government official, no database administrator, and no politician can erase it. The report exists forever, publicly verifiable by anyone."

### The Innovation — Walletless Design (60 seconds)

"But here's our key insight: blockchain apps have a fatal adoption problem. You need a wallet, you need cryptocurrency, you need to understand gas fees. That works in San Francisco. It doesn't work in rural Nepal.

We built a **walletless relayer system**. Citizens submit reports without ever touching a crypto wallet. Behind the scenes, our relayer wallet signs and pays for the blockchain transaction on their behalf. A farmer in rural Nepal can use Aawaj with just a phone and internet access.

For identity verification, we generate a unique confirmation code — a code like AAWAJ-X3K7M9P2. This code is shown to the citizen once. We store only its SHA-256 hash in the metadata. When the citizen later needs to verify their identity — to confirm or dispute a resolution — they enter their code, we hash it, and compare. No wallet needed. No signup required."

### The Accountability Loop (45 seconds)

"Our 9-status system models Nepal's actual governance hierarchy: Ward, Municipality, Province, Federal.

When the government says they fixed a problem, we don't just close the ticket. The citizen — the person who reported it — must verify. If they agree it's fixed, the report is confirmed resolved. If they disagree, the report is marked as Disputed and can be escalated to a higher authority.

The citizen has the final say. Not the bureaucrat. This is real accountability."

### The Demo (90 seconds)

[See Section 17 — Demo Walkthrough]

### Closing — Impact (15 seconds)

"Aawaj means Voice. We built it because in Nepal, millions of voices go unheard. With Aawaj, once your voice is on the blockchain, it can never be silenced.

Thank you."

---

## 16. The 3-Minute Pitch Script (If Time Is Short)

"Nepal has a corruption and accountability crisis. Civic complaints are routinely ignored, lost, or deleted. Citizens have no proof a report was ever filed.

Aawaj — meaning 'Voice' in Nepali — puts citizen reports on the Polygon blockchain, making them permanent, public, and impossible to delete. Photo evidence is stored on IPFS through Pinata, and the cryptographic fingerprint goes on-chain, proving evidence integrity.

Our key innovation is the walletless design. Citizens don't need MetaMask or cryptocurrency. Our relayer system handles blockchain transactions invisibly. A farmer in rural Nepal can submit a report with just a phone. For identity, we generate confirmation codes verified through SHA-256 hashing — no wallet, no signup.

Our 9-status system models Nepal's real governance: Ward, Municipality, Province, Federal. When the government claims they fixed something, the citizen verifies. If they dispute, the report escalates to a higher authority. The citizen has the final say.

We used React 19, Vite, TailwindCSS, Solidity 0.8.20 on Polygon Amoy, ethers.js v6, and Pinata for IPFS.

Aawaj means Voice. Once your voice is on the blockchain, it can never be silenced."

---

## 17. Demo Walkthrough

### Before the Demo

- [ ] App running (deployed on Vercel or localhost:5173)
- [ ] MetaMask installed with a government wallet (address in AUTHORIZED_GOV_WALLETS)
- [ ] A sample photo ready (pothole, flooded road, anything visual)
- [ ] Contract deployed on Polygon Amoy (via Remix IDE)
- [ ] Test MATIC in the relayer wallet

### Step 1: Home Page (30 seconds)

- Show the hero section — "This is Aawaj, a citizen voice platform for Nepal"
- Scroll to the live feed — "Every card here is a real blockchain record. No database. These are read directly from the Polygon blockchain in real-time."
- Point to stats — "These numbers come from the smart contract"

### Step 2: Submit a Report (90 seconds)

- Click "Submit a Report"
- **KEY POINT**: "Notice — there's NO wallet connection. No MetaMask popup. The citizen doesn't need crypto."
- Upload a photo: "This photo is stored permanently on IPFS through Pinata"
- Fill in location (Kathmandu Metropolitan City), category (Road Damage), description
- Click Submit
- While loading: "Three things are happening right now: photo going to IPFS, metadata with the evidence hash going to IPFS, and then the content fingerprint is being written to the Polygon blockchain"
- Show success screen: "Report #X — this number is permanent. And notice the confirmation code: AAWAJ-XXXXXXXX. The citizen saves this code. It's their proof of identity. We store only the SHA-256 hash."

### Step 3: Track the Report (30 seconds)

- Go to Track Report
- Enter the report ID
- "Everything here comes from the blockchain and IPFS — the image, the location, the status, the timeline."
- Point to the escalation timeline: "This shows where the report is in Nepal's government hierarchy"

### Step 4: Government Dashboard (60 seconds)

- Switch MetaMask to the government wallet
- Go to `/gov-dashboard`
- "Only authorized government wallets can access this. My address is on the allowlist."
- Load the report
- Click "Mark In Review" → "That just went to the blockchain"
- Click "Mark as Resolved" → "Now watch — the government says it's fixed. But that's not enough."

### Step 5: Citizen Verification (30 seconds)

- Go back to Track Report, enter the report ID
- "See — it says 'Gov Marked Resolved.' But the citizen has to verify."
- Enter the confirmation code
- Click "Dispute" → "The citizen says NO — it's not fixed. Watch the status change to Disputed."
- "THAT is accountability. The government can't just close tickets."

---

## 18. 30 Judge Questions & Answers

### Category: Why Blockchain?

**Q1: "Why not just use a regular database?"**

> "A database administrator can delete, modify, or forge records. In Nepal, this is exactly what happens — complaints disappear. On the blockchain, once a report is written, no one can delete or modify it. Not us, not the government, not anyone. The blockchain's immutability IS the entire value proposition. We don't use blockchain because it's trendy — we use it because for civic accountability, a mutable database is worse than useless."

**Q2: "Isn't blockchain overkill for this?"**

> "For a San Francisco complaint system, yes. For Nepal, no. The specific problem we're solving is that authorities delete records. A traditional database doesn't solve this because the authority controls the database. Blockchain is the only technology that guarantees no single entity can control or censor the data. It's not overkill — it's the minimum necessary technology for the problem."

**Q3: "What about data privacy? Everything is public on blockchain."**

> "In civic reporting, transparency is a feature. These are public infrastructure complaints — not private medical records. The citizen wants the government to be publicly accountable. However, we protect reporter identity: citizens submit through our relayer (their personal wallet is never exposed), and confirmation codes use SHA-256 hashing. The only on-chain data is the relayer's address, the IPFS CID, location, category, and status."

### Category: Technical

**Q4: "What's your tech stack?"**

> "React 19 and Vite for the frontend. Solidity 0.8.20 for the smart contract, deployed on Polygon Amoy testnet. ethers.js v6 for blockchain interaction. Pinata REST API for IPFS storage. TailwindCSS for styling. The whole frontend is a static site deployable on Vercel."

**Q5: "Why Polygon and not Ethereum mainnet?"**

> "Cost and speed. Ethereum transactions cost $5–$50. Polygon transactions cost fractions of a cent. For a civic reporting tool where thousands of citizens need to submit reports, Ethereum's fees are prohibitive. Polygon is an Ethereum Layer 2 — same security model, same smart contract language, 1000x cheaper. Moving from Amoy testnet to Polygon mainnet requires changing only two configuration values."

**Q6: "Is this on a real blockchain?"**

> "Yes. Polygon Amoy is a real blockchain with real consensus, real blocks, real immutability. It's a testnet — meaning the tokens have no monetary value — but the technology is identical to mainnet. The code is production-ready. Moving to mainnet is a configuration change, not a code change."

**Q7: "How do you handle the smart contract being immutable? What if there's a bug?"**

> "For a hackathon demo, the contract is simple enough that we've tested all paths. In production, we'd use an upgradeable proxy pattern (like OpenZeppelin's TransparentProxy), which allows upgrading the logic while preserving the stored data. We'd also add a multi-sig governance mechanism for upgrades."

**Q8: "Why ethers.js and not web3.js?"**

> "ethers.js v6 is the modern standard. It's smaller, faster, has better TypeScript support, and separates Provider (read) from Signer (write) cleanly. web3.js is the older library with a larger bundle size. For new projects, ethers.js is the industry recommendation."

### Category: The Relayer

**Q9: "How does the walletless relayer work?"**

> "Citizens fill out a form — no wallet needed. Our frontend calls a relayer function that has its own Ethereum wallet with a private key. This wallet signs the transaction and pays the gas fee on behalf of the citizen. The citizen never interacts with MetaMask, never owns crypto, never signs anything. It's like having a postal service that pays for the stamp."

**Q10: "Isn't the relayer a centralization point?"**

> "The relayer is centralized for writes — but all reads are decentralized. Anyone can verify reports on the blockchain without going through us. If our relayer goes down, existing reports remain permanent and publicly accessible. The data integrity doesn't depend on us. In production, we'd decentralize the relayer using a network of relayers or gasless meta-transactions (EIP-2771)."

**Q11: "What if the relayer wallet runs out of funds?"**

> "On testnet, we can refill from Polygon's faucet for free. On mainnet, at $0.001 per transaction, 1 MATIC covers about 1,000 reports. Annual cost for 100,000 reports would be about $100 — trivially fundable by NGOs, government budgets, or grants."

**Q12: "What prevents someone from spamming reports through the relayer?"**

> "Currently, we rely on the human effort of uploading a photo and filling out a form. In production, we'd add rate limiting (per IP and per device fingerprint), CAPTCHA challenges, and optionally require phone number verification. The relayer is an API endpoint and can implement standard abuse prevention."

### Category: IPFS & Evidence

**Q13: "How is evidence stored?"**

> "Photos go to IPFS via Pinata, returning a CID — a content fingerprint. We create a metadata JSON object (with the image CID, location, category, description, and confirmation code hash) and upload that too. Only the metadata CID string goes on the blockchain. This keeps costs at fractions of a cent while mathematically guaranteeing evidence integrity."

**Q14: "How do you prove evidence hasn't been tampered with?"**

> "The CID stored on-chain is a cryptographic hash of the evidence. If anyone changes even a single pixel of the photo, the hash would be completely different and wouldn't match the on-chain CID. It's mathematically impossible to tamper with the evidence without the mismatch being detectable."

**Q15: "What if Pinata goes down?"**

> "If Pinata the company disappears, the files still exist on the IPFS network as long as at least one node pins them. We could also use multiple pinning services (Infura, Fleek, web3.storage) for redundancy. The CID on-chain is provider-agnostic — it works with any IPFS gateway."

**Q16: "IPFS doesn't guarantee persistence. What if files get unpinned?"**

> "Files stay on IPFS as long as at least one node pins them. Pinata's business model is pinning — they keep files available. For extra safety, we could pin with multiple services. But even if the file becomes temporarily unavailable, the CID on-chain remains as proof that specific content existed. Re-pinning with the original file would make it available again with the same CID."

### Category: Identity & Security

**Q17: "How do you verify who submitted a report?"**

> "Through confirmation codes. When a citizen submits a report, we generate a unique code like AAWAJ-X3K7M9P2. We hash this code with SHA-256 and store only the hash in the IPFS metadata. The plaintext code is shown to the citizen once. To confirm or dispute a resolution later, they enter their code — we hash their input and compare it to the stored hash. This is the same security model used by password systems."

**Q18: "What if someone fabricates evidence?"**

> "Aawaj proves evidence hasn't been changed after submission. It doesn't prevent someone from photographing something fake. However, reports include location, timestamp, and category. Government reviewers can cross-reference. In production, we'd add GPS metadata from the phone's camera and AI-powered image analysis to detect common manipulation patterns."

**Q19: "What about Sybil attacks — one person making many fake identities?"**

> "Each report goes through our relayer, which can implement rate limiting and abuse detection. In production, we'd add phone number verification (one report per number per time window) or integration with Nepal's digital identity system. The blockchain itself doesn't prevent Sybil attacks — that's handled at the application layer."

### Category: The Escalation System

**Q20: "What happens if the government ignores a report?"**

> "Reports can be escalated through Nepal's governance hierarchy: Ward → Municipality → Province → Federal. Each escalation is recorded on-chain as a permanent status change. A Disputed resolution also flags the report publicly. The pressure of visible, unresolved reports climbing the governance chain creates accountability. The report can never be deleted."

**Q21: "What actually forces the government to respond?"**

> "Nothing forces them technically — this is true of any reporting system. What Aawaj adds is permanent public evidence. Reports are visible to journalists, NGOs, and higher government bodies. The escalation chain means ignored reports at the Ward level become visible at the Provincial and Federal level. The social and political pressure of a permanent, public ledger of unresolved complaints is the enforcement mechanism."

**Q22: "Can the government abuse the system? Just change all statuses to Resolved?"**

> "They can set status to Gov Marked Resolved (6), but that's not the end. The citizen must confirm. If citizens dispute, the report status becomes Disputed (8) — visible to everyone. Every government action is recorded on-chain with their wallet address and timestamp. They can't hide what they did. The blockchain is the audit trail."

### Category: Scalability & Production

**Q23: "How would this scale to all of Nepal?"**

> "Polygon handles ~7,000 transactions per second at fractions of a cent. Nepal's population is 30 million. Even if every citizen filed one report per month, that's ~12 TPS — well within Polygon's capacity. IPFS scales through additional pinning nodes. The frontend is a static site deployable on any CDN."

**Q24: "What's the cost at scale?"**

> "At $0.001 per transaction on Polygon mainnet: 1 million reports per year = $1,000. Pinata charges $20/month for 50GB of storage. Total annual infrastructure cost for a national deployment: roughly $1,250. Compare that to the corrupt systems currently in place."

**Q25: "How would you monetize this?"**

> "This isn't a profit play — it's a public good. Funding models include: government adoption (integrated into Nepal's eGovernance), international development grants (UNDP, World Bank), NGO sponsorship (Transparency International), or social enterprise model with premium analytics for government bodies."

### Category: Design & UX

**Q26: "Why the glassmorphism design?"**

> "We designed for Nepal's context. The frosted glass cards float over full-page photographs of Nepali landscapes and scenes. It creates an immersive, emotionally resonant experience that connects the technology to the country it serves. The design language communicates trust and modernity."

**Q27: "Is the UI accessible on low-end devices?"**

> "Yes. The frontend is optimized with React 19's concurrent features and Vite's efficient bundling. Glassmorphism uses CSS backdrop-filter which is GPU-accelerated. The app is mobile-responsive — critical in Nepal where most internet access is via mobile phones."

### Category: Team & Process

**Q28: "What was the hardest technical challenge?"**

> "The walletless relayer pattern. Traditional blockchain apps assume users have wallets. We had to architect a system where the blockchain's guarantees (immutability, transparency) are preserved while removing the blockchain's complexity (wallets, gas, signing) from the citizen's experience. The confirmation code system for identity verification without wallets was the key breakthrough."

**Q29: "How did you divide work?"**

> [Customize this based on your actual team roles — who did frontend, who did design, who did research, etc.]

**Q30: "What would you build next?"**

> "Three priorities: (1) Deploy to Polygon mainnet with real economic value, (2) Add SMS notification integration so citizens in areas with limited internet get updates via text, (3) Build a public analytics dashboard showing resolution rates by region — making government performance data transparent and comparable across municipalities."

---

## 19. Glossary — Every Term You Might Hear

**If a judge uses a word you don't know, don't panic. Check this list.**

| Term                          | Plain English                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Blockchain**                | A shared digital ledger spread across thousands of computers. Data can be added but never deleted.                 |
| **Block**                     | A batch of transactions bundled together. New blocks are added every few seconds.                                  |
| **Transaction (tx)**          | A single action that changes blockchain state — like submitting a report. Has a unique hash.                       |
| **Transaction Hash (txHash)** | A unique ID for a transaction. Can be looked up on a block explorer.                                               |
| **Smart Contract**            | A program deployed on the blockchain. Runs automatically according to its code. Can't be changed after deployment. |
| **Solidity**                  | The programming language for writing smart contracts on Ethereum/Polygon.                                          |
| **EVM**                       | Ethereum Virtual Machine — the "computer" inside the blockchain that runs smart contracts.                         |
| **ABI**                       | Application Binary Interface — a JSON file describing a contract's functions. Like an API spec.                    |
| **Gas**                       | The unit measuring computational work on-chain. Each operation costs a certain amount of gas.                      |
| **Gas Fee**                   | The actual money (MATIC) you pay. Calculated as: gas used × gas price.                                             |
| **Gwei**                      | A tiny fraction of MATIC (1 MATIC = 1 billion gwei). Gas prices are quoted in gwei.                                |
| **MATIC**                     | The cryptocurrency used on Polygon to pay gas fees. On testnet, it's free.                                         |
| **Testnet**                   | A practice blockchain with free fake tokens. Same technology as mainnet, no real money.                            |
| **Mainnet**                   | The real blockchain where tokens have actual monetary value.                                                       |
| **Layer 1 (L1)**              | The base blockchain (e.g., Ethereum). Secure but expensive.                                                        |
| **Layer 2 (L2)**              | A faster/cheaper chain built on top of L1 (e.g., Polygon). Inherits L1's security.                                 |
| **Wallet**                    | Software that stores cryptographic keys. Used to sign transactions and prove identity.                             |
| **MetaMask**                  | A popular browser-extension crypto wallet.                                                                         |
| **Private Key**               | A secret string that controls a wallet. Whoever has it can spend the funds. NEVER share it.                        |
| **Public Key / Address**      | The visible identifier of a wallet (like an email address). Safe to share.                                         |
| **Signer**                    | A wallet connected to a blockchain library, ready to sign transactions.                                            |
| **Provider**                  | A read-only connection to the blockchain. Can read data but can't write.                                           |
| **ethers.js**                 | A JavaScript library for interacting with Ethereum/Polygon blockchains.                                            |
| **IPFS**                      | InterPlanetary File System — decentralized file storage. No single server controls the data.                       |
| **CID**                       | Content Identifier — a cryptographic fingerprint of a file on IPFS. Changes if the file changes.                   |
| **Pinata**                    | An IPFS pinning service. Keeps files available and provides a download gateway.                                    |
| **Pinning**                   | Telling an IPFS node to keep a file permanently available (so it doesn't get garbage collected).                   |
| **Content Addressing**        | Finding files by WHAT they are (their hash), not WHERE they are (a URL).                                           |
| **SHA-256**                   | A cryptographic hash function. Produces a unique 256-bit fingerprint of any input. One-way: can't reverse it.      |
| **Relayer**                   | A wallet that submits transactions on behalf of someone else and pays the gas.                                     |
| **Walletless**                | A design pattern where end users don't need crypto wallets.                                                        |
| **Enum**                      | A Solidity data type that defines a set of named values (like our 9 statuses).                                     |
| **Struct**                    | A Solidity data type that groups fields together (like our Report structure).                                      |
| **Mapping**                   | A key-value store in Solidity (like a dictionary). We use `mapping(uint256 => Report)`.                            |
| **Event**                     | A log emitted by a smart contract when something happens. Cheap and useful for tracking.                           |
| **Deploy**                    | Publishing a smart contract to the blockchain. After deployment, it has a permanent address.                       |
| **Remix IDE**                 | A browser-based IDE for writing and deploying Solidity smart contracts.                                            |
| **Block Explorer**            | A website (like Polygonscan) where you can look up transactions, contracts, and addresses.                         |
| **RPC**                       | Remote Procedure Call — the protocol for communicating with a blockchain node.                                     |
| **dApp**                      | Decentralized Application — a web app that interacts with a blockchain.                                            |
| **DeFi**                      | Decentralized Finance — financial services on blockchain. NOT what we're doing (we're civic tech).                 |
| **NFT**                       | Non-Fungible Token — unique digital asset. NOT what we're doing.                                                   |
| **Web3**                      | The vision of a decentralized internet built on blockchain technology. Aawaj is a Web3 application.                |
| **Consensus**                 | The process by which blockchain nodes agree on the truth. Prevents any single node from cheating.                  |
| **Immutability**              | The property that data cannot be changed or deleted once written to the blockchain.                                |
| **Decentralized**             | No single entity controls the system. Power is distributed across many participants.                               |
| **Faucet**                    | A website that gives free testnet tokens for development and testing.                                              |
| **React**                     | A JavaScript framework for building user interfaces.                                                               |
| **Vite**                      | A fast build tool for web projects.                                                                                |
| **TailwindCSS**               | A CSS framework that uses utility classes for styling.                                                             |
| **Glassmorphism**             | A UI design trend using frosted glass effects (blur + transparency).                                               |
| **Parallax**                  | A visual effect where background elements move slower than foreground elements on scroll.                          |

---

## 20. Emergency Cheat Sheet — Print This Page

### If You Forget Everything, Remember These 5 Points:

1. **Aawaj puts citizen reports on the blockchain so they can NEVER be deleted**
2. **Citizens DON'T need a crypto wallet — our relayer handles it**
3. **Evidence is on IPFS — decentralized, tamper-proof (proven by CID hash)**
4. **The citizen has the FINAL SAY — they confirm or dispute government resolutions**
5. **9 statuses model Nepal's real government: Ward → Municipality → Province → Federal**

### The One-Liner:

> "Aawaj is a walletless blockchain platform that makes citizen civic reports in Nepal permanent, tamper-proof, and accountable through a 9-level Nepal governance escalation system — all without requiring citizens to own a crypto wallet."

### If Asked "Why Blockchain?":

> "Because a database admin can delete records. The blockchain can't. That's the whole point."

### If Asked Something You Don't Know:

**Don't panic. Say:**

> "That's a great question. Our current implementation is focused on [what we built]. For [the thing they asked], we've identified that as a priority for our next iteration, and we have a clear technical path — [mention one plausible approach]."

### Quick Stats to Memorize:

- **9** statuses in the escalation chain
- **Polygon Amoy** testnet (chain ID 80002)
- **< $0.01** per transaction cost on Polygon
- **SHA-256** hash for confirmation codes
- **ethers.js v6** for blockchain interaction
- **React 19 + Vite 7 + Tailwind 3** for frontend
- **Solidity 0.8.20** for the smart contract
- **IPFS via Pinata** for evidence storage
- **4 pages**: Home, Submit Report, Track Report, Gov Dashboard
- **0 wallets needed** by citizens (walletless relayer)
- **8 report categories**: Road Damage, Water Supply, Electricity, Waste Management, Public Safety, Corruption, Environmental, Other

### The Strongest Lines (Use During Pitch):

- _"Once your voice is on the blockchain, it can never be silenced."_
- _"The citizen has the final say. Not the bureaucrat."_
- _"We solved blockchain's biggest adoption problem — the wallet problem."_
- _"A farmer in rural Nepal can use this with just a phone."_
- _"You can't close a ticket without the citizen's permission."_
- _"Every action is a permanent blockchain record with a timestamp and wallet address."_

---

**Good luck tomorrow. You built something real. Own it. 🇳🇵**
