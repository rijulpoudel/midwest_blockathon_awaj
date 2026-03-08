# AAWAJ – Hackathon Strategy & Concerns

---

## ⚠️ Critical Bugs to Fix

### 1. Wallet for Report Submission — Remove This
**Problem:** Requiring a wallet to submit a report completely defeats the purpose of AAWAJ.
The entire point is that a rural citizen in Humla or Dolpa — who has never heard of
MetaMask — can speak up. Forcing a wallet kills adoption and contradicts the mission.

**Fix:**
- Remove wallet requirement from the Submit Report flow entirely
- Reports should be submittable by anyone, anonymously, no wallet needed
- The wallet / blockchain part happens **invisibly in the backend** — when a report
  is submitted, YOUR app writes it to the chain on the user's behalf
- Use a **relayer pattern**: your backend holds a funded wallet and signs + submits
  the transaction server-side when a report comes in
- The user just fills a form. The permanence is handled for them.

### 2. Token Distribution in Real Life
**Problem:** If AAWAJ uses tokens, how do real users get them?

**Answer for the hackathon:** Don't give users tokens at all.
- Users never need to hold or spend tokens
- The app itself (via a backend wallet) pays the gas/transaction cost
- This is called a **gasless / meta-transaction** pattern
- For the demo: use a testnet (Base Sepolia, or whichever chain you're on)
  and fund one deployer wallet — that wallet submits all reports on-chain
- In production this would be subsidized by donations or a small org fee

---

## 🏆 Hackathon Track Analysis

### Main Track — $1,000
> "Build the most compelling decentralized application. Must include at least
> one on-chain state change."

**Does AAWAJ qualify?** ✅ YES — if we implement report submission writing to a smart contract.

**Minimum required:** When a user submits a report, store it on-chain.
Even storing just a hash (reportId, IPFS hash, timestamp, location) is enough.
That is a real on-chain state change.

**How to implement in 4 hours:**
1. Write a simple smart contract: `submitReport(string ipfsHash)` — stores a hash
2. Deploy to Base Sepolia (free, fast)
3. When form is submitted → upload photo + data to IPFS via Pinata → get CID →
   call smart contract with the CID → done. That's a real dApp.

---

### Pinata Track — $500 per team member (up to $2,000) 🔥 THIS IS YOUR BEST BET
> "Build something that uses Pinata in a meaningful way —
> showcasing reliability, transparency, or ownership of data."

**AAWAJ is a PERFECT fit for this track.** Here's why:

- Every civic report (photo + text + location) gets uploaded to **IPFS via Pinata**
- The IPFS CID (content hash) is permanent and tamper-proof — exactly what AAWAJ promises
- You can use **Pinata's new OpenClaw** agent product for bonus points
- Use code `CLAW-BLOCKATHON` for one free month

**What to store on Pinata:**
- The report photo (image file → Pinata → IPFS CID)
- The report metadata as JSON (title, description, location, category, timestamp → Pinata → IPFS CID)
- That CID then gets written to the smart contract → full loop complete

**This is your strongest track. Prioritize qualifying for this one.**

---

### Beginner Track — $500
> "For teams with no prior blockchain experience. All members must be
> first-time attendees of a Web3 hackathon."

**Are you eligible?** Check with your team — if everyone is attending their
first Web3 hackathon, you qualify. You can enter **both** the Beginner Track
and the Pinata Track simultaneously. You cannot double-enter Main + Beginner.

---

## ⏱️ 4-Hour Plan (Prioritized)

You have 4 hours and your frontend is not done. Here is the order of operations:

### Hour 1 — Finish the Frontend MVP
Focus only on the two pages that matter for the demo:
- [ ] Submit Report page (photo upload + form fields) — this is your money shot
- [ ] Home page hero + stats bar (makes it look real)
- [ ] Skip Track Report page for now — fake it with mock data if needed

### Hour 2 — Pinata Integration
- [ ] Sign up for Pinata, use code `CLAW-BLOCKATHON`
- [ ] When form is submitted: upload photo to Pinata → get CID
- [ ] Create a JSON metadata file (title, description, location, timestamp, photo CID)
- [ ] Upload that JSON to Pinata → get a second CID (this is the "report CID")
- [ ] Show the Pinata CID/link to the user after submission as their "Report ID"

### Hour 3 — Smart Contract
- [ ] Write the simplest possible Solidity contract:
```solidity
contract AawajReports {
    struct Report {
        string ipfsHash;
        uint256 timestamp;
        address submitter;
    }
    Report[] public reports;

    function submitReport(string memory ipfsHash) public {
        reports.push(Report(ipfsHash, block.timestamp, msg.sender));
    }

    function getReport(uint index) public view returns (Report memory) {
        return reports[index];
    }
}
```
- [ ] Deploy to Base Sepolia using Remix IDE (browser-based, no setup needed)
- [ ] After Pinata upload succeeds → call `submitReport(reportCID)` from your backend
- [ ] Save the transaction hash — show it to the user as proof ("Your report is on-chain")

### Hour 4 — Polish + Demo Prep
- [ ] Make sure the submit flow works end to end (form → Pinata → contract → success screen)
- [ ] Add a success screen that shows: Report ID, Pinata link, transaction hash
- [ ] Prepare a 2-minute demo script (see below)
- [ ] Deploy frontend (Vercel — one command)

---

## 🎤 Demo Script (2 minutes)

1. **The problem** (20 sec): "In Nepal, civic complaints disappear. Reports get denied.
   Rural districts have no way to hold officials accountable."

2. **The solution** (20 sec): "AAWAJ lets any citizen submit a report — no wallet,
   no crypto knowledge needed. Just a photo and a description."

3. **Live demo** (60 sec):
   - Show the home page
   - Submit a report (food shortage, upload a photo)
   - Show the Pinata dashboard — the file is live on IPFS
   - Show the transaction on the block explorer — it's permanently on-chain
   - Show the Report ID the citizen receives

4. **The pitch** (20 sec): "This report cannot be deleted. It cannot be denied.
   It is permanent, public, and tamper-proof — powered by Pinata and the blockchain.
   That is AAWAJ. That is your voice, on-chain."

---

## ✅ What Actually Qualifies You

| Requirement | How AAWAJ meets it |
|---|---|
| On-chain state change | `submitReport()` writes to smart contract on Base Sepolia |
| Pinata meaningful use | Every report photo + metadata stored on IPFS via Pinata |
| Not frontend-only | Real contract interaction on every submission |
| Compelling narrative | Civic justice, rural Nepal, tamper-proof accountability |

---

## 🚫 What to Cut (Not Worth Your Time in 4 Hours)

- ❌ Wallet connect for users — remove it, use backend relayer
- ❌ Token/reward system — cut entirely, distraction
- ❌ Track Report page — mock it with hardcoded data
- ❌ Community upvoting / verification — mention it as a future feature
- ❌ User accounts / auth — anonymous is fine and actually better for the story
- ❌ Map view — nice to have, not needed for demo
