# Blockchain Module

Smart contract and local test harness for pharmacy supply-chain verification.

## Contract
- File: `contracts/project.sol`
- Name: `PharmaSupplyChainVerification`

## Features
- Role-based actors (`Manufacturer`, `Distributor`, `Pharmacy`, `Regulator`)
- End-to-end batch lifecycle and custody tracking
- Immutable checkpoint history with on-chain events
- Recall support and authenticity verification helper

## Local setup
```bash
cd blockchain
npm install
npm run compile
npm test
```

## Local deploy
```bash
cd blockchain
npm run deploy:local
```

## Demo simulation
Runs a complete manufacturer -> distributor -> pharmacy -> dispensed flow and prints verification + checkpoint history.

```bash
cd blockchain
npm run simulate:flow
```

## Recall simulation
Runs a pre-recall supply-chain flow, then triggers regulator recall and prints verification + checkpoint history.

```bash
cd blockchain
npm run simulate:recall
```
