# 📖 Echo — Complete Beginner's Guide to Every Line of Code

> **Who is this for?** If you're 15, if you've never coded before, if you have no idea what "blockchain" or "React" means — this document will walk you through **every single file** in this project, line by line, in plain English.

---

## 📋 Table of Contents

1. [What is Echo?](#1-what-is-echo)
2. [Big Picture — How the App Works](#2-big-picture--how-the-app-works)
3. [The Tech Stack (What Tools We Used)](#3-the-tech-stack-what-tools-we-used)
4. [Folder Structure](#4-folder-structure)
5. [The Smart Contract — `EchoRegistry.sol`](#5-the-smart-contract--echoregistrysol)
6. [Config Files (The Boring but Necessary Stuff)](#6-config-files-the-boring-but-necessary-stuff)
7. [The Entry Point — `main.jsx` and `index.html`](#7-the-entry-point--mainjsx-and-indexhtml)
8. [The Router — `App.jsx`](#8-the-router--appjsx)
9. [Constants — `constants/index.js`](#9-constants--constantsindexjs)
10. [Utility: Pinata IPFS Uploads — `utils/pinata.js`](#10-utility-pinata-ipfs-uploads--utilspinatajs)
11. [Utility: Contract Connection — `utils/contract.js`](#11-utility-contract-connection--utilscontractjs)
12. [Hook: Wallet Connection — `hooks/useWallet.js`](#12-hook-wallet-connection--hooksusewalletjs)
13. [Hook: Contract Interactions — `hooks/useContract.js`](#13-hook-contract-interactions--hooksusecontractjs)
14. [Component: Navbar — `components/Navbar.jsx`](#14-component-navbar--componentsnavbarjsx)
15. [Component: StatusBadge — `components/StatusBadge.jsx`](#15-component-statusbadge--componentsstatusbadgejsx)
16. [Component: ReportCard — `components/ReportCard.jsx`](#16-component-reportcard--componentsreportcardjsx)
17. [Component: EscalationTimeline — `components/EscalationTimeline.jsx`](#17-component-escalationtimeline--componentsescalationtimelinejsx)
18. [Component: LoadingSpinner — `components/LoadingSpinner.jsx`](#18-component-loadingspinner--componentsloadingspinnerjsx)
19. [Page: Home Page — `pages/HomePage.jsx`](#19-page-home-page--pageshomepagejsx)
20. [Page: Submit Report — `pages/SubmitReportPage.jsx`](#20-page-submit-report--pagessubmitreportpagejsx)
21. [Page: Track Report — `pages/TrackReportPage.jsx`](#21-page-track-report--pagestrackreportpagejsx)
22. [Page: Government Dashboard — `pages/GovDashboardPage.jsx`](#22-page-government-dashboard--pagesgovdashboardpagejsx)
23. [Environment Variables — `.env`](#23-environment-variables--env)
24. [How to Run the App](#24-how-to-run-the-app)

---

## 1. What is Echo?

**Echo** is a web app built for Nepal that lets ordinary citizens report civic problems (like broken roads, water issues, corruption) directly to the **blockchain**.

Think of it like a complaint box — except:

- Nobody can delete your complaint (it's permanent on the blockchain)
- Nobody can change what you wrote (it's tamper-proof)
- Everyone can see it (it's transparent)
- The photo evidence is stored on IPFS (a global file storage system), so it can't be taken down

**The name "Echo"** means: your voice echoes — it can't be silenced.

---

## 2. Big Picture — How the App Works

Here's the journey of a single report, step by step:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  1. Citizen   │───▶│  2. Upload   │───▶│  3. Write to │───▶│  4. Track &  │
│  takes photo  │    │  to IPFS     │    │  blockchain  │    │  get updates │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

1. **Citizen takes a photo** of the problem (e.g., a destroyed road)
2. **The photo gets uploaded to IPFS** (a permanent storage system) via a service called Pinata
3. **The report gets written to the blockchain** (Polygon Amoy), which creates a permanent, public record
4. **Anyone can track the report** by its ID, and government officials can update the status

### The Three Key Technologies

| Technology               | What it does                            | Real-world analogy                        |
| ------------------------ | --------------------------------------- | ----------------------------------------- |
| **React**                | Builds the website you see and click on | The paint and walls of a house            |
| **IPFS (Pinata)**        | Stores the photo permanently            | A global photo album that nobody can burn |
| **Blockchain (Polygon)** | Stores the report data permanently      | A stone tablet that nobody can erase      |

---

## 3. The Tech Stack (What Tools We Used)

Here's every tool/library and why we need it:

| Tool                 | Version           | Why we need it                                                                                                          |
| -------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **React**            | 19.2              | The framework that creates our website. It lets us build "components" (reusable pieces of UI like buttons, cards, etc.) |
| **Vite**             | 7.3.1             | The build tool — it takes our code and turns it into a fast website. It also runs the dev server                        |
| **JavaScript (JSX)** | ES2020+           | The programming language everything is written in. JSX is a mix of JavaScript + HTML                                    |
| **TailwindCSS**      | 3.4.19            | A CSS framework — lets us style things by adding class names like `text-red-500` instead of writing CSS files           |
| **ethers.js**        | v6                | A JavaScript library that lets our website talk to the blockchain (sending transactions, reading data)                  |
| **react-router-dom** | 7.13.1            | Handles page navigation — so `/submit` shows the submit page, `/track` shows the track page, etc.                       |
| **Pinata**           | REST API v1       | A service that uploads files to IPFS. We use their API directly with `fetch()`                                          |
| **MetaMask**         | browser extension | A crypto wallet in your browser. Users need it to sign blockchain transactions                                          |
| **Solidity**         | 0.8.20            | The programming language for writing smart contracts (the blockchain code)                                              |
| **Polygon Amoy**     | testnet           | A test version of the Polygon blockchain. Free to use — perfect for hackathons                                          |

---

## 4. Folder Structure

Here's every file in the project and what it does:

```
aawaj-frontend/
├── index.html                    ← The ONE HTML file (React fills it with content)
├── package.json                  ← Lists all the npm packages (libraries) we installed
├── vite.config.js                ← Tells Vite how to build the app
├── tailwind.config.js            ← Tells TailwindCSS where to look for classes
├── postcss.config.js             ← Tells PostCSS to run TailwindCSS (boilerplate)
├── eslint.config.js              ← Code quality rules (catches common mistakes)
├── .env                          ← SECRET keys and config (never share this!)
├── .gitignore                    ← Tells Git which files to NOT upload (like .env)
│
├── contracts/
│   └── EchoRegistry.sol          ← The Solidity smart contract (the blockchain code)
│
├── public/                       ← Static files served as-is (favicon, etc.)
│
└── src/                          ← ALL of our React code lives here
    ├── main.jsx                  ← The very first file that runs — boots up React
    ├── App.jsx                   ← Sets up the router (which URL shows which page)
    ├── index.css                 ← Imports TailwindCSS styles
    ├── App.css                   ← Extra CSS (mostly empty)
    │
    ├── constants/
    │   └── index.js              ← Shared values (chain ID, category list, status labels)
    │
    ├── contracts/
    │   └── EchoRegistry.json     ← The ABI — a "menu" of what the smart contract can do
    │
    ├── utils/                    ← Helper functions (not React-specific)
    │   ├── pinata.js             ← Functions to upload files/JSON to Pinata IPFS
    │   └── contract.js           ← Functions to connect to the smart contract
    │
    ├── hooks/                    ← React hooks (reusable logic for components)
    │   ├── useWallet.js          ← Hook for connecting MetaMask wallet
    │   └── useContract.js        ← Hook for calling smart contract functions
    │
    ├── components/               ← Reusable UI pieces
    │   ├── Navbar.jsx            ← The navigation bar at the top
    │   ├── ReportCard.jsx        ← Displays a single report with its image
    │   ├── StatusBadge.jsx       ← A colored pill showing the report status
    │   ├── EscalationTimeline.jsx← A vertical timeline of status steps
    │   └── LoadingSpinner.jsx    ← A spinning circle for loading states
    │
    └── pages/                    ← Full-page views (one per URL route)
        ├── HomePage.jsx          ← Landing page with hero section
        ├── SubmitReportPage.jsx  ← 3-step form to submit a report
        ├── TrackReportPage.jsx   ← Search and view a report by ID
        └── GovDashboardPage.jsx  ← Government page to update report status
```

---

## 5. The Smart Contract — `EchoRegistry.sol`

> This is the **blockchain code**. It runs on Polygon (not on your computer). Once deployed, it's permanent — nobody can change it.

### What is a Smart Contract?

Imagine a vending machine:

- You put in money → you get a snack
- The rules are built into the machine — no human decides if you get the snack
- Everyone can see the machine and how it works

A smart contract is exactly like that, but on the blockchain. The "rules" are code, and once deployed, they run automatically.

### Full Code with Explanations

```solidity
// SPDX-License-Identifier: MIT
```

This line is a **license identifier**. MIT means "anyone can use this code for free." It's required by Solidity — without it, the compiler gives a warning.

```solidity
pragma solidity ^0.8.20;
```

This tells the Solidity compiler: "This code was written for version 0.8.20 or higher." It's like saying "this recipe requires an oven that goes to at least 350°F."

```solidity
contract EchoRegistry {
```

This creates a new **contract** called `EchoRegistry`. Think of it like creating a class in regular programming — it's a container for all our data and functions.

### The Report Struct

```solidity
struct Report {
    uint256 id;            // Unique report ID (1, 2, 3, ...)
    address reporter;      // The wallet address of whoever submitted this
    string ipfsHash;       // The IPFS CID — a "fingerprint" pointing to the uploaded files
    string location;       // Where the problem is, like "Lalitpur Ward 5"
    string category;       // What kind of problem, like "Road Damage"
    uint8 status;          // A number 0-3: 0=Submitted, 1=InReview, 2=Escalated, 3=Resolved
    uint256 timestamp;     // When it was submitted (seconds since Jan 1 1970)
    address assignedBody;  // Which government wallet last touched this report
}
```

A **struct** is like a template or a form. Every report will have all these fields filled in. Think of it like a paper form where you fill in your name, address, phone number, etc.

- `uint256` = a very big positive number (can hold numbers up to 2^256)
- `uint8` = a small number (0-255), enough for our 4 status codes
- `address` = a blockchain wallet address (like `0x1234...abcd`)
- `string` = text (like "Lalitpur Ward 5")

### State Variables

```solidity
uint256 public reportCount;
```

This keeps track of how many reports have been submitted **ever**. It starts at 0 and goes up by 1 every time someone submits. The `public` keyword means anyone can read this number.

```solidity
mapping(uint256 => Report) public reports;
```

A **mapping** is like a dictionary or address book. You give it a number (the report ID), and it gives you back the full Report. Like: "Give me report #3" → returns all the details of report #3.

### Events

```solidity
event ReportSubmitted(uint256 indexed id, address indexed reporter, string ipfsHash);
event StatusUpdated(uint256 indexed id, uint8 newStatus, address indexed updatedBy);
```

**Events** are like announcements. When something happens (a new report, a status update), the blockchain "announces" it. Our frontend listens for these announcements to know what happened.

The `indexed` keyword means you can search/filter by that field later. It's like adding a tag to make things searchable.

### submitReport Function

```solidity
function submitReport(
    string calldata _ipfsHash,
    string calldata _location,
    string calldata _category
) external returns (uint256) {
```

This is the function citizens call to submit a report.

- `external` = can only be called from outside the contract (from our website)
- `returns (uint256)` = it gives back a number (the new report ID)
- `calldata` = a gas-efficient way to pass strings (saves money on transaction fees)
- The `_underscore` prefix is a Solidity convention to distinguish function parameters from state variables

```solidity
    reportCount++;
```

Increase the report counter by 1. If there were 5 reports, now there are 6.

```solidity
    reports[reportCount] = Report({
        id: reportCount,
        reporter: msg.sender,
        ipfsHash: _ipfsHash,
        location: _location,
        category: _category,
        status: 0,
        timestamp: block.timestamp,
        assignedBody: address(0)
    });
```

Create a new Report and store it in our mapping.

- `msg.sender` = the wallet address of whoever called this function. The blockchain automatically knows who's calling.
- `block.timestamp` = the current time on the blockchain
- `address(0)` = `0x0000...0000` — means "nobody" (no government body assigned yet)
- `status: 0` = "Submitted" (the first status)

```solidity
    emit ReportSubmitted(reportCount, msg.sender, _ipfsHash);
    return reportCount;
```

Announce the event and return the new ID.

### updateStatus Function

```solidity
function updateStatus(uint256 _reportId, uint8 _newStatus) external {
    require(_reportId > 0 && _reportId <= reportCount, "Report does not exist");
```

The `require` line is a safety check — if the report ID doesn't exist, the whole transaction fails with the message "Report does not exist". Think of it like a bouncer at a club checking your ID.

```solidity
    reports[_reportId].status = _newStatus;
    reports[_reportId].assignedBody = msg.sender;
    emit StatusUpdated(_reportId, _newStatus, msg.sender);
```

Update the status number, record who made the update, and announce it.

> **Note:** In a real production app, we'd add access control (only specific wallets can update). We skipped that for the hackathon to keep things simple.

### getReport Function

```solidity
function getReport(uint256 _reportId) external view returns (Report memory) {
    require(_reportId > 0 && _reportId <= reportCount, "Report does not exist");
    return reports[_reportId];
}
```

- `view` = this function only **reads** data, it doesn't change anything. That means it's **free** — you don't pay any gas fees.
- `memory` = return the data as a temporary copy (not a permanent reference)

### getReportCount Function

```solidity
function getReportCount() public view returns (uint256) {
    return reportCount;
}
```

Simply returns how many reports exist. Also free to call.

---

## 6. Config Files (The Boring but Necessary Stuff)

### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Echo — Citizen Evidence Reporting</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

This is the **only HTML file** in the entire app. React takes over the `<div id="root"></div>` and fills it with all the content. The `<script>` tag loads our React code. That's it — React does everything else.

### `package.json` (Key Parts)

```json
{
  "dependencies": {
    "ethers": "^6.16.0", // Talks to the blockchain
    "react": "^19.2.0", // UI framework
    "react-dom": "^19.2.0", // Connects React to the browser
    "react-router-dom": "^7.13.1" // Page navigation (URL routing)
  }
}
```

This file lists every library (package) our app needs. When you run `npm install`, it reads this file and downloads everything.

### `tailwind.config.js`

Tells TailwindCSS to scan all `.js` and `.jsx` files in `src/` for class names. That way, Tailwind only includes the CSS we actually use (keeps the file size small).

### `vite.config.js`

Tells Vite to use the React plugin. Vite is our build tool — it bundles all our files into a fast website.

### `index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

These three lines import TailwindCSS. That's the entire CSS file. Tailwind generates all the styles from the class names we use in our JSX.

---

## 7. The Entry Point — `main.jsx` and `index.html`

### `main.jsx`

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
```

**Line by line:**

- `StrictMode` — A React wrapper that helps catch bugs during development. It doesn't do anything in production.
- `createRoot` — The React 19 way to start a React app. It "mounts" React onto a DOM element.
- `./index.css` — Imports our TailwindCSS styles.
- `App` — Imports our main App component (the whole app).

```jsx
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

This says: "Find the HTML element with `id="root"` (from `index.html`), and render our `<App />` component inside of it." That's how React takes over the page.

---

## 8. The Router — `App.jsx`

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SubmitReportPage from "./pages/SubmitReportPage";
import TrackReportPage from "./pages/TrackReportPage";
import GovDashboardPage from "./pages/GovDashboardPage";
```

We import the router tools and all our pages.

```jsx
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pb-12">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/submit" element={<SubmitReportPage />} />
            <Route path="/track" element={<TrackReportPage />} />
            <Route path="/gov" element={<GovDashboardPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
```

**What this does:**

- `<BrowserRouter>` — Enables URL-based navigation. Without this, clicking links wouldn't change the page.
- `<Navbar />` — Shows on **every page** (it's outside `<Routes>`).
- `<Routes>` — A container for all our page routes.
- Each `<Route>` says: "When the URL is `X`, show component `Y`."
  - `/` → Home page
  - `/submit` → Submit Report page
  - `/track` → Track Report page
  - `/gov` → Government Dashboard

The `className="min-h-screen bg-gray-50"` makes the whole page at least full-screen height with a light gray background.

---

## 9. Constants — `constants/index.js`

```js
// Polygon Amoy testnet
export const CHAIN_ID = 80002;
export const CHAIN_NAME = "Polygon Amoy Testnet";
export const RPC_URL = "https://rpc-amoy.polygon.technology";
export const BLOCK_EXPLORER = "https://amoy.polygonscan.com";
```

These are **configuration values** for the Polygon Amoy blockchain:

- `CHAIN_ID` — Every blockchain has a unique ID number. Polygon Amoy is 80002.
- `RPC_URL` — The URL to communicate with the blockchain (like a phone number for the blockchain).
- `BLOCK_EXPLORER` — A website where you can view all transactions (like a public receipt viewer).

```js
export const STATUS_LABELS = [
  "Submitted", // index 0
  "In Review", // index 1
  "Escalated", // index 2
  "Resolved", // index 3
];
```

The smart contract stores status as a number (0, 1, 2, 3). Humans don't want to see numbers, so this array converts them to readable labels. `STATUS_LABELS[0]` = "Submitted", `STATUS_LABELS[2]` = "Escalated", etc.

```js
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
```

The list of issue categories. These show up in the dropdown when submitting a report. They're specific to Nepal's civic issues.

---

## 10. Utility: Pinata IPFS Uploads — `utils/pinata.js`

> **What is IPFS?** A global, decentralized file storage system. Instead of storing files on one company's server, IPFS spreads them across many computers worldwide. Nobody can delete them.
>
> **What is Pinata?** A service that makes it easy to upload files to IPFS. They provide an API (a way for code to talk to their servers).
>
> **What is a CID?** A "Content IDentifier" — a unique fingerprint for every file on IPFS. Like a tracking number for your package.

```js
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY;
```

Read the secret API key and gateway URL from the `.env` file. `import.meta.env` is how Vite gives us environment variables. The `VITE_` prefix is required by Vite.

### uploadImageToPinata

```js
export async function uploadImageToPinata(file) {
```

This function takes a **File object** (from a file input or drag-and-drop) and uploads it to IPFS via Pinata. It's `async` because uploading takes time (it talks to the internet).

```js
  try {
    const formData = new FormData();
    formData.append("file", file);
```

`FormData` is a built-in browser object designed for sending files over the internet. We put our image file into it.

```js
const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${PINATA_JWT}`,
  },
  body: formData,
});
```

This sends the file to Pinata's API:

- `fetch()` — The built-in browser function for making HTTP requests (like a web browser visiting a URL, but from code).
- `method: "POST"` — We're **sending** data (not requesting it). GET = requesting, POST = sending.
- `Authorization: Bearer ${PINATA_JWT}` — This proves to Pinata that we have permission to upload. The JWT is like a password.
- `body: formData` — The actual file data we're sending.

```js
if (!res.ok) {
  const text = await res.text();
  throw new Error(`Pinata responded with ${res.status}: ${text}`);
}
```

If something went wrong (bad password, file too big, etc.), we throw an error with the details.

```js
const json = await res.json();
console.log("Image uploaded to IPFS — CID:", json.IpfsHash);
return json.IpfsHash;
```

Pinata responds with JSON that includes `IpfsHash` — the CID (unique fingerprint) of our uploaded file. We log it to the browser console (for debugging) and return it.

### uploadMetadataToPinata

```js
export async function uploadMetadataToPinata(metadataObject) {
```

This uploads a **JSON object** (not a file) to IPFS. The metadata contains info like the image CID, location, category, description, and timestamp.

```js
const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${PINATA_JWT}`,
  },
  body: JSON.stringify({ pinataContent: metadataObject }),
});
```

Similar to the image upload, but:

- We use a different URL (`pinJSONToIPFS` instead of `pinFileToIPFS`)
- We set `Content-Type: application/json` because we're sending JSON, not a file
- `JSON.stringify()` converts our JavaScript object into a JSON string
- Pinata's API requires the data to be wrapped in `{ pinataContent: ... }`

### getIPFSUrl

```js
export function getIPFSUrl(cid) {
  return `https://${PINATA_GATEWAY}/ipfs/${cid}`;
}
```

This takes a CID and builds a full URL that a browser can load. For example:

- CID: `QmXyz123`
- Result: `https://your-gateway.mypinata.cloud/ipfs/QmXyz123`

This URL loads the file from IPFS through your Pinata gateway.

---

## 11. Utility: Contract Connection — `utils/contract.js`

> This file creates connections between our website and the smart contract on the blockchain.

```js
import { BrowserProvider, JsonRpcProvider, Contract } from "ethers";
import EchoRegistryABI from "../contracts/EchoRegistry.json";
```

We import three things from **ethers.js** (our blockchain library):

- `BrowserProvider` — Connects to MetaMask (the user's wallet in the browser)
- `JsonRpcProvider` — Connects to a public blockchain node (no wallet needed, read-only)
- `Contract` — Creates a JavaScript object that can call the smart contract's functions

`EchoRegistryABI` is the ABI (Application Binary Interface) — a JSON file that describes what functions the smart contract has and what parameters they take. It's like a "menu" for the contract.

```js
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
```

The blockchain address where our contract lives. Think of it like a street address for a building.

### getProvider

```js
export function getProvider() {
  if (!window.ethereum) {
    throw new Error(
      "MetaMask not detected. Please install MetaMask to use this app.",
    );
  }
  return new BrowserProvider(window.ethereum);
}
```

- `window.ethereum` — When MetaMask is installed, it injects this object into every website. It's how websites talk to MetaMask.
- `BrowserProvider(window.ethereum)` — Creates an ethers.js provider connected to MetaMask.
- If MetaMask isn't installed, we throw an error.

A **Provider** is like a phone line to the blockchain — it can read data but can't send transactions.

### getSigner

```js
export async function getSigner() {
  const provider = getProvider();
  return await provider.getSigner();
}
```

A **Signer** is like a provider that also has your private key — it can **sign transactions** (spend money, write data). This asks MetaMask for the user's signer, which is why MetaMask pops up asking for permission.

### getContract

```js
export function getContract(signerOrProvider) {
  return new Contract(CONTRACT_ADDRESS, EchoRegistryABI, signerOrProvider);
}
```

Creates a **Contract object** that lets us call the smart contract's functions from JavaScript. It needs:

1. The contract's address (where it lives)
2. The ABI (what functions it has)
3. A signer (if we want to write) or provider (if we only want to read)

After this, we can do things like `contract.submitReport(...)` from JavaScript!

### getReadOnlyContract

```js
export function getReadOnlyContract() {
  const provider = new JsonRpcProvider(import.meta.env.VITE_RPC_URL);
  return new Contract(CONTRACT_ADDRESS, EchoRegistryABI, provider);
}
```

Creates a contract connection that **doesn't need MetaMask**. It uses a public RPC URL to read data. This is used for free operations like `getReport()` that don't cost money.

---

## 12. Hook: Wallet Connection — `hooks/useWallet.js`

> **What is a React Hook?** A function that starts with `use` and provides reusable logic with state management. Multiple components can use the same hook to share the same type of behavior.

```js
import { useState, useEffect, useCallback } from "react";
```

- `useState` — Lets a component remember values between re-renders (like a notepad)
- `useEffect` — Runs code when the component first appears or when values change
- `useCallback` — Creates a function that doesn't get recreated every render (performance optimization)

```js
export default function useWallet() {
  const [account, setAccount] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
```

Three pieces of state:

- `account` — The user's wallet address (`""` if not connected, `"0x1234..."` if connected)
- `isConnecting` — `true` while MetaMask is showing its popup, `false` otherwise
- `error` — Any error message (`""` if no error)

### connectWallet

```js
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask not installed. Please install MetaMask to continue.");
      return;
    }
```

First check: is MetaMask even installed? If not, show an error.

```js
    setIsConnecting(true);
    setError("");
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
```

`eth_requestAccounts` is a special MetaMask command that pops up the MetaMask window asking the user to connect. When they approve, it returns an array of their wallet addresses. We take the first one (`accounts[0]`).

```js
    } catch (err) {
      if (err.code === 4001) {
        setError("Connection rejected. Please try again.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);
```

- Error code `4001` = the user clicked "Cancel" on the MetaMask popup
- `finally` = runs no matter what (success or error) — we always stop the "connecting" state

### Auto-detect on mount

```js
  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts.length > 0) setAccount(accounts[0]);
    });
```

When the component first loads (`useEffect` with `[]` runs once), we **silently** check if the user is already connected. `eth_accounts` (unlike `eth_requestAccounts`) does NOT show a popup — it just checks. If they're already connected from a previous visit, we set their account automatically.

```js
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount("");
      } else {
        setAccount(accounts[0]);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);
```

This listens for when the user switches accounts in MetaMask. If they switch, we update `account`. If they disconnect, we clear it. The `return () => { ... }` is a **cleanup function** — it removes the listener when the component goes away (prevents memory leaks).

```js
return { account, isConnecting, error, connectWallet };
```

Return everything so any component can use it: the current account, whether it's connecting, any error, and the connect function.

---

## 13. Hook: Contract Interactions — `hooks/useContract.js`

> This hook provides three functions for interacting with the smart contract: submitting reports, updating status, and reading reports.

```js
export default function useContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
```

Two shared state values: loading indicator and error message.

### submitReport

```js
  async function submitReport(ipfsHash, location, category) {
    setIsLoading(true);
    setError("");
    try {
      const signer = await getSigner();
      const contract = getContract(signer);
      const tx = await contract.submitReport(ipfsHash, location, category);
      const receipt = await tx.wait();
```

Step by step:

1. Get the signer (MetaMask wallet) — this triggers the MetaMask popup
2. Create a contract instance with that signer
3. Call `submitReport` on the smart contract — this sends a blockchain transaction
4. `tx.wait()` waits until the transaction is confirmed (mined into a block). This takes a few seconds.

```js
const event = receipt.logs
  .map((log) => {
    try {
      return contract.interface.parseLog(log);
    } catch {
      return null;
    }
  })
  .find((e) => e?.name === "ReportSubmitted");

return event ? Number(event.args.id) : null;
```

After the transaction confirms, we dig through the **transaction receipt** to find the `ReportSubmitted` event. Remember — our smart contract emits this event with the new report ID. We:

1. Loop through all logs in the receipt
2. Try to parse each one using the contract's ABI
3. Find the one named "ReportSubmitted"
4. Extract the `id` from it

This is how we know what report ID was assigned!

### updateReportStatus

```js
  async function updateReportStatus(reportId, newStatus) {
    ...
    const tx = await contract.updateStatus(reportId, newStatus);
    await tx.wait();
    return tx.hash;
    ...
  }
```

Similar flow: get signer, build contract, call `updateStatus`, wait for confirmation, return the transaction hash (a unique ID for the blockchain transaction).

### fetchReport

```js
  async function fetchReport(reportId) {
    ...
    const contract = getReadOnlyContract();
    const result = await contract.getReport(reportId);
    return {
      id: Number(result.id),
      reporter: result.reporter,
      ipfsHash: result.ipfsHash,
      location: result.location,
      category: result.category,
      status: Number(result.status),
      timestamp: new Date(Number(result.timestamp) * 1000),
      assignedBody: result.assignedBody,
    };
    ...
  }
```

This one uses `getReadOnlyContract()` — no MetaMask needed! It's a free read.

The smart contract returns data in a raw format, so we convert it:

- `Number(result.id)` — Converts from BigInt (blockchain number) to regular JavaScript number
- `new Date(Number(result.timestamp) * 1000)` — Converts from Unix timestamp (seconds) to a JavaScript Date. We multiply by 1000 because JavaScript uses milliseconds.

```js
return { submitReport, updateReportStatus, fetchReport, isLoading, error };
```

Return all three functions plus the shared loading/error state.

---

## 14. Component: Navbar — `components/Navbar.jsx`

```jsx
import { Link } from "react-router-dom";
import useWallet from "../hooks/useWallet";
```

`Link` from react-router-dom works like `<a>` tags but doesn't reload the page — it's faster.

```jsx
export default function Navbar() {
  const { account, connectWallet, isConnecting } = useWallet();
```

Use our wallet hook to get the current account and the connect function.

```jsx
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
```

A dark gray nav bar with white text, padding (`px-6 py-4`), items spread between left and right (`justify-between`), vertically centered (`items-center`).

```jsx
<Link to="/" className="text-2xl font-bold tracking-wide">
  🔊 Echo
</Link>
```

The logo/brand name that links to the home page.

```jsx
<div className="hidden md:flex items-center gap-6 text-sm font-medium">
  <Link to="/" className="hover:text-blue-400 transition">
    Home
  </Link>
  <Link to="/submit" className="hover:text-blue-400 transition">
    Submit Report
  </Link>
  <Link to="/track" className="hover:text-blue-400 transition">
    Track Report
  </Link>
  <Link to="/gov" className="hover:text-blue-400 transition">
    Gov Dashboard
  </Link>
</div>
```

Navigation links. `hidden md:flex` means: hidden on phone screens, visible (as flexbox) on medium screens and up. This is Tailwind's responsive design — one class handles mobile vs desktop.

```jsx
<button
  onClick={connectWallet}
  disabled={isConnecting}
  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition"
>
  {isConnecting
    ? "Connecting..."
    : account
      ? `${account.slice(0, 6)}...${account.slice(-4)}`
      : "Connect Wallet"}
</button>
```

The wallet button shows three different texts:

1. "Connecting..." — while MetaMask popup is open
2. `"0x1234...abcd"` — after connecting (first 6 + last 4 chars of the address)
3. "Connect Wallet" — before connecting

`account.slice(0, 6)` takes the first 6 characters, `account.slice(-4)` takes the last 4.

---

## 15. Component: StatusBadge — `components/StatusBadge.jsx`

```jsx
const STATUS_COLORS = [
  "bg-yellow-100 text-yellow-800", // 0 = Submitted
  "bg-blue-100 text-blue-800", // 1 = In Review
  "bg-orange-100 text-orange-800", // 2 = Escalated
  "bg-green-100 text-green-800", // 3 = Resolved
];
```

Each status number gets a matching color scheme. Yellow for submitted, blue for in review, orange for escalated, green for resolved.

```jsx
export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
        STATUS_COLORS[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {STATUS_LABELS[status] || "Unknown"}
    </span>
  );
}
```

A small colored pill/badge. `rounded-full` makes it fully rounded (pill shape). It takes a `status` number (0-3) and shows the matching label and color. If the status is somehow outside 0-3, it falls back to gray with "Unknown".

---

## 16. Component: ReportCard — `components/ReportCard.jsx`

```jsx
import StatusBadge from "./StatusBadge";
import { getIPFSUrl } from "../utils/pinata";
```

It uses the StatusBadge (from above) and the IPFS URL builder.

```jsx
export default function ReportCard({ report }) {
```

Takes a `report` object (from `fetchReport`) as a prop.

```jsx
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      {report.ipfsHash && (
        <img
          src={getIPFSUrl(report.ipfsHash)}
          alt="Report evidence"
          className="w-full h-48 object-cover"
        />
      )}
```

If there's an IPFS hash, show the image from IPFS. `object-cover` makes the image fill the space without distortion (like "cover" in background-size). `overflow-hidden` clips the image to the card's rounded corners.

```jsx
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-500">
            Report #{report.id}
          </span>
          <StatusBadge status={report.status} />
        </div>
```

Shows the report ID on the left and the status badge on the right.

```jsx
        <p className="text-sm text-gray-700">
          <span className="font-medium">Location:</span> {report.location}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Category:</span> {report.category}
        </p>
        <p className="text-xs text-gray-400">
          Submitted by: {report.reporter?.slice(0, 6)}...{report.reporter?.slice(-4)}
        </p>
        <p className="text-xs text-gray-400">
          {report.timestamp instanceof Date
            ? report.timestamp.toLocaleString()
            : new Date(report.timestamp * 1000).toLocaleString()}
        </p>
      </div>
```

Shows location, category, the reporter's wallet (shortened), and the date. The timestamp check handles both `Date` objects and raw numbers.

The `?.` is **optional chaining** — it prevents a crash if `reporter` is null or undefined.

---

## 17. Component: EscalationTimeline — `components/EscalationTimeline.jsx`

```jsx
const STEP_COLORS = [
  "border-yellow-500 bg-yellow-50", // Submitted
  "border-blue-500 bg-blue-50", // In Review
  "border-green-500 bg-green-50", // Escalated
  "border-red-500 bg-red-50", // Resolved
];
```

Each step in the timeline gets its own color.

```jsx
export default function EscalationTimeline({ currentStatus }) {
  return (
    <div className="flex flex-col gap-2">
      {STATUS_LABELS.map((label, i) => (
        <div key={label} className="flex items-center gap-3">
          <div
            className={`w-4 h-4 rounded-full border-2 ${
              i <= currentStatus ? STEP_COLORS[i] : "border-gray-300 bg-white"
            }`}
          />
          <span
            className={`text-sm ${
              i <= currentStatus
                ? "font-semibold text-gray-800"
                : "text-gray-400"
            }`}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
```

A vertical list of 4 circles + labels (Submitted → In Review → Escalated → Resolved). Steps that have been reached are colored; future steps are gray.

The logic is: `i <= currentStatus`. So if status is 1 (In Review), then steps 0 and 1 are colored (Submitted and In Review), while 2 and 3 stay gray.

---

## 18. Component: LoadingSpinner — `components/LoadingSpinner.jsx`

```jsx
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
```

A pure CSS spinning circle. The trick:

- It's a 40×40 circle (`w-10 h-10 rounded-full`)
- It has a blue border on 3 sides (`border-blue-500`)
- The top border is transparent (`border-t-transparent`)
- It spins forever (`animate-spin`)

This creates the classic loading spinner effect — no images needed!

---

## 19. Page: Home Page — `pages/HomePage.jsx`

```jsx
export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center px-4">
```

Centers everything vertically and horizontally. `min-h-[calc(100vh-64px)]` means "fill the whole screen minus the 64px navbar."

```jsx
      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
        🔊 Echo
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mb-2">
        Citizen Evidence Reporting for Nepal
      </p>
      <p className="text-gray-500 max-w-xl mb-10">
        Submit evidence of civic issues directly to the blockchain. Your report
        is permanent, transparent, and tamper-proof — powered by Polygon and IPFS.
      </p>
```

Hero section — big title, subtitle, description.

```jsx
<div className="flex flex-col sm:flex-row gap-4">
  <Link
    to="/submit"
    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition shadow-lg"
  >
    Submit a Report
  </Link>
  <Link
    to="/track"
    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl text-lg font-semibold transition"
  >
    Track a Report
  </Link>
</div>
```

Two call-to-action buttons: a solid blue one for submitting and an outlined one for tracking. On phones (`flex-col`), they stack vertically. On larger screens (`sm:flex-row`), they're side by side.

```jsx
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-left border border-gray-100">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}
```

A small helper component used only on this page. Shows an emoji icon, a title, and a description in a white card. Three of these are used to explain the app's features (Upload Evidence, On-Chain Record, Gov Accountability).

---

## 20. Page: Submit Report — `pages/SubmitReportPage.jsx`

> This is the most complex page — the heart of the app. It has a 3-step flow: upload photo → fill details → success screen.

### State Variables

```jsx
const [step, setStep] = useState(1); // Which step we're on (1, 2, or 3)
const [imageFile, setImageFile] = useState(null); // The actual image File object
const [preview, setPreview] = useState(null); // A temporary URL to preview the image
const [location, setLocation] = useState(""); // e.g. "Lalitpur Ward 5"
const [category, setCategory] = useState(REPORT_CATEGORIES[0]); // Default: "Road Damage"
const [description, setDescription] = useState(""); // Free-text description
const [reportId, setReportId] = useState(null); // The ID returned after submission
const [isLoading, setIsLoading] = useState(false); // Are we in the middle of submitting?
const [loadingMessage, setLoadingMessage] = useState(""); // Current progress text
const [error, setError] = useState(""); // Any error message
const fileInputRef = useRef(null); // A reference to the hidden file input
```

`useRef` creates a reference to a DOM element. We use it to programmatically click the file input when the user clicks the drag-and-drop zone.

### handleFileChange

```jsx
function handleFileChange(e) {
  const selected = e.target.files[0];
  if (!selected) return;
  setImageFile(selected);
  setPreview(URL.createObjectURL(selected));
}
```

When the user selects a file from the file picker:

1. Get the file from the event
2. Save it in state
3. Create a temporary preview URL using `URL.createObjectURL()`. This creates a temporary URL that only works in this browser tab — it lets us show a preview of the image before uploading.

### handleDrop

```jsx
function handleDrop(e) {
  e.preventDefault();
  const dropped = e.dataTransfer.files[0];
  if (dropped && dropped.type.startsWith("image/")) {
    setImageFile(dropped);
    setPreview(URL.createObjectURL(dropped));
  }
}
```

When the user **drags and drops** a file:

- `e.preventDefault()` stops the browser from opening the file
- `e.dataTransfer.files[0]` is the dropped file
- We check `type.startsWith("image/")` to only accept image files (not PDFs, etc.)

### handleSubmit — The Big One

This is the most important function. It runs the entire 3-step submission process:

```jsx
async function handleSubmit() {
  if (!account) {
    await connectWallet();
    return;
  }
```

If the user hasn't connected MetaMask yet, connect first and stop here. They'll need to click "Submit" again after connecting.

```jsx
setIsLoading(true);
setError("");
```

Turn on the loading overlay and clear any previous error.

```jsx
// Step 1: Upload image to IPFS
setLoadingMessage("Uploading evidence to IPFS via Pinata...");
const imageCID = await uploadImageToPinata(imageFile);
```

Upload the photo to IPFS. This usually takes 2-5 seconds. We get back a CID (like `QmXyz123`).

```jsx
// Step 2: Upload metadata to IPFS
setLoadingMessage("Uploading report metadata to IPFS...");
const metadata = {
  imageCID,
  location,
  category,
  description,
  timestamp: new Date().toISOString(),
  appName: "Echo",
  network: "Polygon Amoy",
};
const metadataCID = await uploadMetadataToPinata(metadata);
```

Create a metadata object with all the report details (including the image CID from step 1) and upload it to IPFS. Now we have TWO things on IPFS: the image and the metadata JSON.

```jsx
// Step 3: Write to blockchain
setLoadingMessage("Writing to blockchain — confirm MetaMask popup...");
const id = await submitReport(metadataCID, location, category);
```

Call our smart contract's `submitReport` function with the metadata CID. This triggers MetaMask asking the user to confirm the transaction and pay a tiny gas fee.

```jsx
if (id === null || id === undefined) {
  throw new Error(
    "Blockchain transaction failed — check your wallet connection and contract address.",
  );
}

setIsLoading(false);
setReportId(id);
setStep(3);
```

If the blockchain call failed (returned null), show an error. Otherwise, save the report ID and move to step 3 (success screen).

### Step 3: Success Screen

```jsx
if (step === 3 && reportId !== null) {
  return (
    <div className="max-w-lg mx-auto mt-16 text-center px-4">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        Report Submitted Successfully!
      </h2>
      <p className="text-gray-600 mb-6">Your Report ID:</p>
      <p className="text-5xl font-mono font-bold mb-6" style={{ color: "#00c896" }}>
        #{reportId}
      </p>
```

A big celebration screen showing the report ID in green. `font-mono` uses a monospace font (makes numbers look more "official").

```jsx
<div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-8">
  <p className="text-yellow-800 font-semibold text-sm">
    ⚠️ SAVE THIS NUMBER — you need it to track your report
  </p>
</div>
```

A yellow warning box telling users to save their report ID.

```jsx
      <Link to={`/track`} className="..." style={{ backgroundColor: "#00c896" }}>
        Track My Report
      </Link>
      <a href={`https://amoy.polygonscan.com/address/${import.meta.env.VITE_CONTRACT_ADDRESS}`}
         target="_blank" rel="noopener noreferrer" className="...">
        View on Polygonscan ↗
      </a>
```

Two links: one to the track page, one to Polygonscan (the blockchain explorer) where they can see the actual transaction.

### Loading Overlay

```jsx
const loadingOverlay = isLoading && (
  <div className="fixed inset-0 z-50 bg-black/50 flex flex-col items-center justify-center">
    <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
      <LoadingSpinner />
      <p className="text-gray-700 font-medium text-center">{loadingMessage}</p>
    </div>
  </div>
);
```

A transparent dark overlay that covers the whole screen while submitting. Shows a spinner and the current progress message. `fixed inset-0` = covers the entire viewport. `z-50` = appears above everything else. `bg-black/50` = 50% transparent black.

### Step 1 UI: Photo Upload

The drag-and-drop zone:

```jsx
<div
  onClick={() => fileInputRef.current?.click()}
  onDragOver={(e) => e.preventDefault()}
  onDrop={handleDrop}
  className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-gray-400 transition"
>
```

- Clicking anywhere in this zone triggers the hidden file input (`fileInputRef.current?.click()`)
- `onDragOver` prevents the default browser behavior (which would try to open the file)
- `onDrop` handles the dropped file
- `border-dashed` creates a dashed line border (universally recognized as "drop something here")

### Step 2 UI: Report Details

Standard form with:

- **Location** text input with a Nepal-specific placeholder
- **Category** dropdown populated from `REPORT_CATEGORIES`
- **Description** textarea
- **Back** button (goes back to step 1)
- **Submit** button (calls `handleSubmit`) — shows "Connect Wallet" if not connected

```jsx
disabled={isLoading || !location}
```

The submit button is disabled if: we're currently loading, OR the location is empty (location is required).

---

## 21. Page: Track Report — `pages/TrackReportPage.jsx`

```jsx
const { fetchReport, isLoading, error } = useContract();
const [reportId, setReportId] = useState("");
const [report, setReport] = useState(null);
const [notFound, setNotFound] = useState(false);
```

State: the report ID the user typed, the fetched report data, and whether it was found.

### handleSearch

```jsx
async function handleSearch(e) {
  e.preventDefault();
  setNotFound(false);
  setReport(null);
  const id = parseInt(reportId, 10);
  if (isNaN(id) || id <= 0) return;
  const result = await fetchReport(id);
  if (result) {
    setReport(result);
  } else {
    setNotFound(true);
  }
}
```

1. `e.preventDefault()` — Stops the form from reloading the page (default HTML behavior)
2. Clear any previous results
3. Convert the typed string to a number (`parseInt(reportId, 10)` — base 10)
4. If it's not a valid positive number, do nothing
5. Fetch the report from the blockchain
6. If found, show it. If not, show "not found" message.

### The Search UI

```jsx
<form onSubmit={handleSearch} className="flex gap-3 mb-8">
  <input type="number" min="1" value={reportId}
    onChange={(e) => setReportId(e.target.value)} placeholder="Enter Report ID" required ... />
  <button type="submit" disabled={isLoading} ...>Search</button>
</form>
```

A number input + search button. `type="number" min="1"` ensures only positive numbers. Pressing Enter triggers `handleSearch`.

### Results

```jsx
{
  report && (
    <div className="space-y-6">
      <ReportCard report={report} />
      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Status Timeline</h3>
        <EscalationTimeline currentStatus={report.status} />
      </div>
    </div>
  );
}
```

If a report is found, show the ReportCard (with image and details) and the EscalationTimeline (showing status progress).

---

## 22. Page: Government Dashboard — `pages/GovDashboardPage.jsx`

```jsx
const { account, connectWallet } = useWallet();
const { fetchReport, updateReportStatus, isLoading, error } = useContract();
```

Needs both wallet access (for signing updates) and contract access (for reading/writing).

### Wallet Check

```jsx
{
  !account && (
    <button onClick={connectWallet} className="...">
      Connect Government Wallet
    </button>
  );
}
```

Shows a connect button if the government official hasn't connected MetaMask yet.

### handleLookup

Same as TrackReportPage — takes a report ID, fetches it from the blockchain.

### handleUpdate

```jsx
async function handleUpdate() {
  if (!account) {
    await connectWallet();
    return;
  }
  setSuccess(false);
  const txHash = await updateReportStatus(report.id, newStatus);
  if (txHash) {
    setSuccess(true);
    const updated = await fetchReport(report.id);
    if (updated) setReport(updated);
  }
}
```

1. Make sure wallet is connected
2. Call `updateReportStatus` (triggers MetaMask to sign the update transaction)
3. If successful, show success message and re-fetch the report to show the new status

### Status Update UI

```jsx
<select value={newStatus} onChange={(e) => setNewStatus(Number(e.target.value))} ...>
  {STATUS_LABELS.map((label, i) => (
    <option key={label} value={i}>{label}</option>
  ))}
</select>
<button onClick={handleUpdate} disabled={isLoading} ...>
  Update On-Chain
</button>
```

A dropdown with all 4 status options and an "Update On-Chain" button. The dropdown shows human labels ("In Review") but stores the number value (1).

```jsx
{
  success && (
    <p className="text-green-600 text-sm font-medium">
      ✅ Status updated successfully on-chain!
    </p>
  );
}
```

Green success message after updating.

---

## 23. Environment Variables — `.env`

```bash
VITE_CONTRACT_ADDRESS=0x7992f43e93d0c98ebc6a719aa718435a5a8fcbf3
VITE_RPC_URL=https://rpc-amoy.polygon.technology
VITE_PINATA_JWT=eyJhbGciOi...  (your secret key)
VITE_PINATA_GATEWAY=your-gateway.mypinata.cloud
```

These are **secret configuration values** that **never** get committed to Git:

| Variable                | What it is                                                 |
| ----------------------- | ---------------------------------------------------------- |
| `VITE_CONTRACT_ADDRESS` | The address where our smart contract lives on Polygon Amoy |
| `VITE_RPC_URL`          | The URL to communicate with the blockchain                 |
| `VITE_PINATA_JWT`       | Your secret Pinata API key (like a password)               |
| `VITE_PINATA_GATEWAY`   | Your Pinata gateway domain for loading IPFS files          |

All variables MUST start with `VITE_` — that's how Vite knows to make them available in the browser code via `import.meta.env.VITE_...`.

> ⚠️ **NEVER share your `.env` file or commit it to GitHub.** The `.gitignore` file ensures it's excluded from Git.

---

## 24. How to Run the App

### Prerequisites

1. **Node.js** installed (v18 or higher) — download from nodejs.org
2. **MetaMask** browser extension installed
3. **A Pinata account** (free at pinata.cloud) with an API key
4. **Test MATIC** in your MetaMask wallet (free from Amoy faucets)

### Steps

```bash
# 1. Navigate to the project
cd aawaj-frontend

# 2. Install all dependencies
npm install

# 3. Create your .env file with your keys (see section above)

# 4. Start the development server
npm run dev

# 5. Open the URL shown in the terminal (usually http://localhost:5173)
```

### Deploying the Smart Contract (via Remix)

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create a new file called `EchoRegistry.sol`
3. Paste the code from `contracts/EchoRegistry.sol`
4. Compile it (Solidity 0.8.20)
5. In "Deploy & Run," set Environment to "Injected Provider - MetaMask"
6. Make sure MetaMask is on Polygon Amoy network
7. Click Deploy → confirm in MetaMask
8. Copy the contract address and put it in your `.env` file

---

## 🎓 Key Concepts Glossary

| Term               | Simple Explanation                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| **Blockchain**     | A public database that nobody controls and nobody can alter. Every record is permanent.                             |
| **Smart Contract** | A program that runs on the blockchain. Once deployed, it runs automatically and can't be changed.                   |
| **MetaMask**       | A browser extension that acts as your blockchain wallet. It holds your crypto and signs transactions.               |
| **Transaction**    | An action on the blockchain (submitting a report, updating a status). Each one costs a small gas fee.               |
| **Gas Fee**        | A tiny payment to the blockchain network for processing your transaction. On Polygon, it costs fractions of a cent. |
| **IPFS**           | InterPlanetary File System — a global, decentralized file storage where files can't be deleted.                     |
| **CID**            | Content IDentifier — a unique fingerprint for a file on IPFS (like `QmXyz123`).                                     |
| **Pinata**         | A service that makes IPFS easy to use. We use their API to upload files and JSON.                                   |
| **ABI**            | Application Binary Interface — a JSON file describing what functions a smart contract has.                          |
| **Provider**       | A connection to the blockchain for reading data (free).                                                             |
| **Signer**         | A connection to the blockchain that can also write data (costs gas). Requires a wallet.                             |
| **RPC**            | Remote Procedure Call — a URL endpoint that lets you communicate with a blockchain node.                            |
| **React Hook**     | A function starting with `use` that adds stateful logic to components (e.g., `useWallet`, `useState`).              |
| **Component**      | A reusable piece of UI in React (like a card, button, or navbar).                                                   |
| **Props**          | Data passed from a parent component to a child (like function arguments).                                           |
| **State**          | Data that a component "remembers" and can change (using `useState`).                                                |
| **JSX**            | A syntax that lets you write HTML-like code inside JavaScript.                                                      |
| **Vite**           | A build tool that bundles your code into a fast website and provides a dev server.                                  |
| **TailwindCSS**    | A CSS framework where you style with class names like `text-red-500` instead of custom CSS.                         |

---

_Built with ❤️ for Nepal — Echo: Because every voice deserves to be heard._
