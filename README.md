# Blockchain-Based Voting System

 Educational blockchain voting prototype using Solidity smart contracts for voter registration, candidate management, one-vote-per-wallet enforcement, transparent counting, and auditable election state management.

## ⚠️ Educational Disclaimer

This project is an educational prototype. It is **not** suitable for governmental or public elections. Real elections require substantially stronger identity verification, ballot secrecy, coercion resistance, accessibility, legal compliance, independent auditing, secure infrastructure, and operational controls.

Use only dummy voters, candidates, wallet addresses, and test cryptocurrency.

## Overview

The project demonstrates how a smart contract can manage a simple election lifecycle:

```text
Admin Creates Election
        ↓
Candidates Registered
        ↓
Eligible Voters Registered
        ↓
Election Starts
        ↓
Voter Connects Wallet
        ↓
Smart Contract Checks Eligibility
        ↓
Smart Contract Checks Whether Already Voted
        ↓
Vote Submitted
        ↓
Vote Count Updated
        ↓
Election Ends
        ↓
Results Declared
```

## Problem Statement

Traditional digital voting prototypes can depend on centralized databases and application servers. A compromised administrator or database could potentially alter records. A blockchain prototype can make state changes tamper-evident and can enforce rules through deterministic smart-contract code.

This does **not** mean blockchain automatically solves voter identity, ballot secrecy, coercion, endpoint security, or election governance.

## Objectives

- Demonstrate Solidity smart-contract development.
- Register eligible wallet addresses.
- Register candidates.
- Enforce one vote per registered wallet.
- Control election state.
- Count votes automatically.
- Emit auditable events.
- Test positive and negative cases with Hardhat.
- Simulate the project in Remix VM.
- Provide an optional Web3 frontend.

## Technology Stack

- Solidity 0.8.24
- Ethereum-compatible smart-contract model
- Hardhat
- Ethers.js through Hardhat Toolbox
- Remix IDE / Remix VM
- Optional React + Ethers.js + MetaMask frontend

No real cryptocurrency is required for the Remix or Hardhat simulation.

## Actors

| Actor | Permissions |
|---|---|
| Admin / Election Authority | Add candidates, register voters, start/end election, view results |
| Voter | Verify eligibility, view candidates, cast one vote, view status |
| Candidate | Candidate record and aggregate vote count |

## Election Lifecycle

| State | Meaning |
|---|---|
| `NOT_STARTED` | Configuration is allowed; voting is disabled |
| `ACTIVE` | Registered voters can vote |
| `ENDED` | Voting is disabled and final results can be queried |

Allowed transitions:

```text
NOT_STARTED → ACTIVE → ENDED
```

## Architecture

```text
┌──────────────────────────────┐
│        React Frontend        │
│  Admin Dashboard / Voter UI  │
└──────────────┬───────────────┘
               │ Ethers.js
               ▼
┌──────────────────────────────┐
│       Wallet / MetaMask      │
└──────────────┬───────────────┘
               │ Transactions
               ▼
┌──────────────────────────────┐
│      VotingSystem.sol        │
│                              │
│ Candidate Registry           │
│ Voter Registry               │
│ Election State               │
│ Vote Counter                 │
│ Access Control               │
│ Event Logs                   │
└──────────────────────────────┘
```

### Admin Flow

```text
Deploy
 → Add candidates
 → Register voter wallets
 → Start election
 → End election
 → Read final result
```

### Voter Flow

```text
Connect wallet
 → Check registration
 → View candidates
 → Vote
 → Check voting status
```

### Transaction Flow

```text
Wallet
 → signs transaction
 → blockchain validates contract rules
 → state changes if valid
 → event is emitted
 → transaction receipt is recorded
```

## Data Model

### Candidate

- `id`
- `name`
- `party`
- `voteCount`

### Voter

- `isRegistered`
- `hasVoted`

The contract intentionally does **not** store a public `votedCandidateId` for each voter.

Why? A naive mapping from wallet → selected candidate would make it trivial to inspect an individual ballot choice. Even without that mapping, a public blockchain is not automatically private.

## Smart Contract Functions

| Function | Purpose |
|---|---|
| `addCandidate()` | Admin adds a candidate |
| `registerVoter()` | Admin registers one voter wallet |
| `registerMultipleVoters()` | Admin registers several wallets |
| `startElection()` | Starts voting for a chosen duration |
| `vote()` | Registered wallet casts one vote |
| `endElection()` | Admin closes the election |
| `getCandidate()` | Reads one candidate |
| `getAllCandidates()` | Reads all candidates |
| `getWinner()` | Returns winner or tie after ending |
| `getElectionStatus()` | Reads lifecycle information |
| `isRegisteredVoter()` | Checks voter eligibility |
| `hasVoted()` | Checks whether a wallet has voted |

## Security Controls

- `onlyAdmin` access control
- zero-address validation
- duplicate voter protection
- election state validation
- one-vote-per-wallet enforcement
- candidate ID validation
- candidate registration locked after start
- voter registration locked after start
- voting disabled before/after the active period
- explicit tie detection

## Privacy Limitations

A public blockchain can expose transaction metadata, wallet addresses, timing, and participation. A wallet address is also not proof of a real-world person's identity.

This prototype therefore should not be represented as a secret-ballot public election system.

Potential conceptual upgrades include:

- commit-reveal voting
- zero-knowledge proofs
- anonymous credentials
- decentralized identity
- encrypted ballots
- stronger key management
- independent auditing

These are advanced designs and are outside the scope of this beginner prototype.

## Folder Structure

```text
Blockchain-Based-Voting-System/
├── contracts/
│   └── VotingSystem.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── VotingSystem.test.js
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── components/
├── screenshots/
├── reports/
├── docs/
├── README.md
├── hardhat.config.js
├── package.json
└── .gitignore
```

## Installation

```bash
git clone <your-github-repository-url>
cd Blockchain-Based-Voting-System
npm install
```

## Hardhat Compilation

```bash
npm run compile
```

Expected result:

```text
Compiled 1 Solidity file successfully
```

## Hardhat Testing

```bash
npm test
```

The test suite covers deployment, admin control, candidate registration, voter registration, invalid addresses, election states, voting, double voting, unregistered voters, invalid candidates, result calculation, ties, and event emission.

## Local Blockchain

Terminal 1:

```bash
npm run node
```

Terminal 2:

```bash
npm run deploy
```

The local Hardhat network provides test accounts and test ETH only. Do not use real funds.

## Remix Simulation

1. Open Remix IDE.
2. Create `VotingSystem.sol`.
3. Paste the contract.
4. Select Solidity compiler `0.8.24`.
5. Compile.
6. Open Deploy & Run Transactions.
7. Select `Remix VM`.
8. Deploy with account 1.
9. Treat account 1 as Admin.
10. Treat accounts 2–4 as Voter A/B/C.
11. Add Candidate A, B, C.
12. Register accounts 2–4.
13. Try voting before starting — it should revert.
14. Start the election with a duration such as `3600`.
15. Switch to account 2 and vote.
16. Switch to account 3 and vote.
17. Switch to account 4 and vote.
18. Try voting again from account 2 — it should revert.
19. Try voting from an unregistered account — it should revert.
20. End the election from the admin account.
21. Try voting again — it should revert.
22. Read candidate totals and `getWinner()`.

### Suggested Test Scenario

- Candidate A: 2 votes
- Candidate B: 1 vote
- Candidate C: 0 votes
- Winner: Candidate A

Also run a separate scenario with two candidates tied to verify `tie = true`.

## Suggested Screenshots

Store evidence in `screenshots/`:

```text
01-project-folder.png
02-solidity-contract.png
03-successful-compile.png
04-contract-deployed.png
05-candidates-registered.png
06-voters-registered.png
07-election-not-started.png
08-early-vote-rejected.png
09-election-active.png
10-successful-vote.png
11-second-voter-vote.png
12-double-vote-rejected.png
13-unregistered-vote-rejected.png
14-election-ended.png
15-final-results.png
16-winner-output.png
17-event-log.png
18-hardhat-tests.png
19-frontend.png
20-github-repository.png
21-readme.png
```

## GitHub Strategy

Recommended repository name:

`Blockchain-Based-Voting-System`

Suggested topics:

`blockchain`, `solidity`, `voting`, `ethereum`, `smart-contract`, `web3`, `hardhat`, `ethersjs`, `dapp`, `e-voting`

Suggested commits:

```text
Add election smart contract architecture
Implement candidate registration
Add voter eligibility registry
Implement election state management
Implement secure one-vote-per-wallet logic
Implement result calculation
Add Hardhat tests
Add Remix simulation proof
Add optional Web3 frontend
Complete README and security analysis
```

Initial Git commands:

```bash
git init
git add .
git commit -m "Initial blockchain voting project"
git branch -M main
git remote add origin <your-github-repository-url>
git push -u origin main
```

## Industry Relevance

Blockchain voting concepts can be explored in:

- university elections
- student councils
- corporate shareholder voting
- DAO governance
- community polls
- organization elections
- cooperative voting
- decentralized governance

Potential benefits include transparent counting, tamper-evident records, automated rules, auditable participation, reduced manual counting, and programmable governance.

However, real public elections need identity systems, secrecy, coercion resistance, accessibility, legal procedures, secure devices, independent auditing, operational security, and resilient infrastructure.

## Three Technology Options

### Option A — Easy

Solidity + Remix IDE + Remix VM.

Best for learning the smart contract and demonstrating the project without local setup complexity.

### Option B — Recommended

Solidity + Hardhat + Ethers.js + MetaMask + local blockchain/testnet + React.

Best balance for a student portfolio because it demonstrates contract development, automated testing, deployment, wallet integration, and frontend interaction.

### Option C — Advanced

Solidity + Hardhat + React/Next.js + Ethers.js + Merkle eligibility proofs + privacy-preserving concepts + decentralized identity concepts + richer dashboard.

More realistic conceptually, but significantly harder and still not sufficient by itself for a public election.

## Limitations

- Wallet address is not real-world identity.
- Ballot secrecy is not guaranteed.
- User devices can be compromised.
- Admin is trusted in this prototype.
- Public chains expose metadata.
- Smart contracts cannot solve coercion or vote buying alone.
- Lost private keys can prevent legitimate access.
- Frontend availability is separate from blockchain availability.
- Gas and transaction latency can affect usability on real networks.
- This is not legally or operationally suitable for public elections.

## Future Improvements

- role-based multi-admin governance
- audited access-control design
- commit-reveal scheme
- zero-knowledge eligibility proofs
- anonymous credentials
- decentralized identity
- encrypted ballot design
- accessibility-focused frontend
- stronger monitoring and audit tooling
- formal verification
- independent security audit

## Learning Outcomes

By completing this project, a student practices:

- Solidity
- smart-contract state
- mappings and structs
- modifiers
- events
- transaction validation
- access control
- blockchain testing
- Hardhat
- Ethers.js
- wallet interaction
- Web3 frontend integration
- security/privacy analysis
- GitHub documentation

## Author

**Student Developer**

Educational B.Tech CSE blockchain project.
#   B l o c k c h a i n - B a s e d - V o t i n g - S y s t e m  
 