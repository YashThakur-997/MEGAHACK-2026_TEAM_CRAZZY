# PramanChain (PharmaSeal)

Blockchain-powered pharmaceutical supply-chain verification platform built for MEGAHACK 2026.

PramanChain helps manufacturers, distributors, and downstream stakeholders verify medicine batch authenticity using:

- on-chain registration and tamper-evident proofs
- QR-based verification
- anomaly detection and recall workflows
- role-specific operational dashboards

## Problem Statement

Counterfeit or tampered drugs can enter distribution channels when provenance is fragmented across disconnected systems.

PramanChain creates a verifiable source of truth by anchoring batch identity on blockchain and linking it with operational metadata in a backend service and role-based dashboards.

## Solution Overview

PramanChain combines three layers:

- Frontend (`client/`): React + Vite dashboards for Manufacturer and Distributor workflows
- Backend (`server/`): Express + MongoDB APIs for auth, batch lifecycle, verification, anomaly analysis, and recalls
- Blockchain (`blockchain/`): Hardhat smart contracts for immutable batch anchoring and supply-chain state transitions

## Key Features

### Manufacturer

- Register batches and generate QR payload/certificate
- Hash payload and anchor batch on-chain
- View batch analytics and anomaly indicators

### Distributor

- Scan or upload QR images for batch verification
- Compare DB hash vs blockchain hash vs recomputed hash
- View active anomaly alerts and checkpoint timelines
- Track pending scans and inventory status

### Security and Integrity

- Tamper detection through hash comparison
- Role-aware contract interaction
- Immutable transaction references (`txHash`) for every registered batch

## Architecture

```text
React (Vite) UI
	|
	|  HTTP (proxy via /api, /auth, /drugs)
	v
Node.js + Express API  <----> MongoDB
	|
	|  ethers.js (RPC)
	v
EVM Smart Contract (Hardhat / Ganache)
```

## Repository Structure

```text
.
├─ client/                # React frontend (Vite)
├─ server/                # Express + Mongo backend
├─ blockchain/            # Hardhat contracts, tests, deploy scripts
├─ pharmaseal.html        # Static concept/demo UI artifact
└─ README.md
```

## Tech Stack

- Frontend: React 19, Vite, Recharts, Lucide, html5-qrcode, jsQR
- Backend: Node.js, Express, Mongoose, JWT, ethers.js, QRCode
- Blockchain: Solidity, Hardhat, Ganache
- Database: MongoDB

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (local or cloud)
- Ganache (RPC at `http://127.0.0.1:7545`)

## Quick Start

### 1) Install Dependencies

```bash
cd blockchain && npm install
cd ../server && npm install
cd ../client && npm install
```

### 2) Start Local Blockchain (Ganache)

Run Ganache and ensure RPC is available at:

```text
http://127.0.0.1:7545
```

### 3) Deploy Smart Contract

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network ganache
```

Copy the deployed contract address from terminal output.

### 4) Configure Server Environment

Create `server/.env` with the following values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/pramanchain
JWT_SECRET=replace_with_strong_secret

RPC_URL=http://127.0.0.1:7545
MANUFACTURER_PRIVATE_KEY=0x<ganache_private_key>
BATCH_REGISTRY_ADDRESS=0x<deployed_contract_address>
```

### 5) Start Backend

```bash
cd server
npm start
```

Backend default URL:

```text
http://localhost:5000
```

### 6) Start Frontend

```bash
cd client
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

## Frontend Routes

- `/` - Landing page
- `/manufacturer` - Manufacturer dashboard
- `/manufacturer/register-batch` - Register batch
- `/manufacturer/batch-list` - Batch list
- `/manufacturer/batch-detail/:batchId` - Batch detail
- `/manufacturer/anomaly-alerts` - Anomaly alerts
- `/manufacturer/trigger-recall` - Recall workflow
- `/distributor` - Distributor operations dashboard
- `/patient` - Patient portal/dashboard

## Core API Endpoints

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`

### Drug Batches

- `POST /api/drugs/register-batch`
- `GET /api/drugs`
- `GET /api/drugs/verify/:batchId`
- `GET /api/drugs/verify-by-hash/:hash`
- `GET /api/drugs/history/:batchId`

### Anomalies and Recall

- `GET /api/drugs/anomalies`
- `GET /api/drugs/recalls/plan`
- `GET /api/drugs/recalls`
- `POST /api/drugs/recalls`
- `PATCH /api/drugs/recalls/:recallId/status`

## Blockchain Module

Located in `blockchain/`.

Useful commands:

```bash
npm run compile
npm test
npm run deploy:local
npm run simulate:flow
npm run simulate:recall
```

Current deploy script deploys `PharmaSupplyChainVerification` from `blockchain/contracts/project.sol`.

## Demo Flow (Hackathon Pitch)

1. Manufacturer registers a batch.
2. Backend computes hash, writes on-chain, persists metadata in MongoDB.
3. QR certificate is generated for the batch.
4. Distributor uploads/scans QR and verifies authenticity.
5. System displays integrity checks and timeline.
6. Anomaly engine flags suspicious records and supports recall planning.

## Submission Assets (Add Before Final Upload)

Create a folder named `docs/screenshots/` and add final screenshots using the names below so judges can quickly understand the flow.

### Suggested Screenshots

- `docs/screenshots/01-landing.png` - Landing page and role entry points
- `docs/screenshots/02-manufacturer-register.png` - Manufacturer batch registration form
- `docs/screenshots/03-manufacturer-success.png` - Registration success with `dataHash`, `txHash`, and QR
- `docs/screenshots/04-distributor-scan.png` - Distributor scan/upload verification workspace
- `docs/screenshots/05-verification-result.png` - Authentic vs mismatch result card with hash comparison
- `docs/screenshots/06-anomaly-alerts.png` - Anomaly dashboard with active alerts
- `docs/screenshots/07-recall-workflow.png` - Recall planning/trigger screen
- `docs/screenshots/08-architecture.png` - Architecture diagram or system flow image

### Optional README Preview Block

Uncomment and keep only if screenshot files are added:

```md
![Landing](docs/screenshots/01-landing.png)
![Register Batch](docs/screenshots/02-manufacturer-register.png)
![Distributor Verify](docs/screenshots/04-distributor-scan.png)
```

## Judging Criteria Mapping

| Common Hackathon Criterion | How PramanChain Addresses It |
| --- | --- |
| Innovation | Combines blockchain anchoring with real-time operational anomaly detection in pharmaceutical supply chains. |
| Technical Complexity | Full-stack architecture: Solidity contracts + Express APIs + React dashboards + MongoDB persistence + QR verification. |
| Real-World Impact | Directly targets counterfeit drug risk, chain-of-custody gaps, and recall responsiveness. |
| Product Completeness | Supports registration, verification, anomaly monitoring, and recall actions through role-specific workflows. |
| Demo Quality | Clear visual journey: register batch -> generate QR -> distributor verifies -> alerts/recall decisions. |
| Scalability Potential | Modular API layer, role-aware smart contract model, and extensible anomaly/recall services. |

## 60-Second Demo Script

Use this as a presenter script during final judging.

### 0 to 10 sec

"Counterfeit drugs are a serious patient safety issue. PramanChain gives every batch an immutable blockchain identity and a verifiable journey."

### 10 to 25 sec

"Here, a manufacturer registers a batch. We hash payload data, anchor it on-chain, and generate a QR certificate with transaction proof."

### 25 to 40 sec

"Now in the distributor dashboard, we scan or upload the QR. The system verifies the record against database hash, recomputed hash, and blockchain hash."

### 40 to 52 sec

"If anything is suspicious, anomalies are surfaced with severity. Teams can move directly into recall planning and response."

### 52 to 60 sec

"PramanChain is a practical, deployable foundation for trusted pharmaceutical traceability and faster safety interventions."

## Demo Checklist (Presenter Quick Notes)

- Start Ganache and confirm deployed contract address in `server/.env`
- Start backend and confirm MongoDB connected
- Open manufacturer flow and register one fresh batch
- Show QR + transaction hash output
- Open distributor flow and verify the same batch
- Show anomaly/recall section to close with impact

## Why This Is Hackathon-Ready

- Real-world impact: anti-counterfeit medicine verification
- End-to-end prototype: smart contract + backend + modern UI
- Clear role workflows: manufacturer, distributor, patient-facing track
- Security narrative: hash integrity + immutable chain evidence
- Demo-friendly: visible QR + verification + anomaly/recall storyline

## Troubleshooting

### "Batch not found" during verify

- Ensure backend is running with latest code and restarted after changes.
- Verify registration succeeded and was persisted in MongoDB.
- Confirm scanned/uploaded QR includes the correct `batchId`.

### Contract/chain errors

- Check `RPC_URL`, `MANUFACTURER_PRIVATE_KEY`, and `BATCH_REGISTRY_ADDRESS` in `server/.env`.
- Re-deploy contract and update address when Ganache chain resets.

### Frontend API issues

- Ensure backend is on `http://localhost:5000`.
- Vite proxy is configured for `/api`, `/auth`, and `/drugs`.

### Mongo connection issues

- Verify `MONGODB_URI` and local/cloud DB availability.

## Project Scripts Reference

### Client

```bash
npm run dev
npm run build
npm run preview
```

### Server

```bash
npm start
```

### Blockchain

```bash
npm run compile
npm test
npm run deploy:local
```

## Team

MEGAHACK 2026 - TEAM CRAZZY

Add contributor names, roles, and contact links here before submission.

## License

This repository includes a `LICENSE` file at project root.