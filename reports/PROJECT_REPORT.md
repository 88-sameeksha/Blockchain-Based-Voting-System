# Blockchain-Based Voting System — Project Report

## Abstract

This project presents an educational prototype of a blockchain-based voting system implemented with a Solidity smart contract. The system demonstrates candidate registration, voter eligibility, election-state management, one-vote-per-wallet enforcement, automatic vote counting, event logging, and result calculation.

The project is designed for academic learning and GitHub proof of work. It is not intended for public or governmental elections.

## 1. Introduction

Voting systems require reliable record keeping, clear rules, and trustworthy counting. A blockchain smart contract can encode election rules and maintain tamper-evident state transitions. This project explores those concepts using dummy users and a local blockchain simulation.

## 2. Problem Statement

Centralized digital voting prototypes may depend heavily on application servers and databases. If those components are compromised, records could potentially be modified. This prototype explores whether selected election rules can instead be enforced by deterministic smart-contract logic.

## 3. Existing Voting Systems

Traditional voting may use paper ballots, electronic voting machines, centralized databases, or hybrid processes. Each approach has different security, operational, legal, and privacy requirements.

## 4. Blockchain-Based Approach

The proposed prototype uses an Ethereum-compatible smart contract. The contract stores candidate records, voter eligibility, voting status, aggregate vote counts, and election state.

## 5. Objectives

- Learn Solidity and smart contracts.
- Demonstrate access control.
- Implement candidate and voter registries.
- Enforce one vote per registered wallet.
- Automate vote counting.
- Test security-relevant negative cases.
- Simulate the complete lifecycle.

## 6. Scope

The scope is limited to a classroom and portfolio prototype. It uses dummy identities and local/test blockchain environments.

## 7. Architecture

```text
Admin/Voter
    |
Wallet
    |
Frontend or Remix
    |
VotingSystem.sol
    |
Blockchain State + Events
```

## 8. Actors

### Admin

Manages candidates, voters, and election lifecycle.

### Voter

Uses a registered wallet to cast one vote.

### Candidate

Represents an election candidate with an aggregate vote count.

## 9. Election Lifecycle

```text
NOT_STARTED → ACTIVE → ENDED
```

Configuration occurs before the election. Voting occurs only in the active state. Results become final after the election ends.

## 10. Smart Contract Design

The contract uses:

- `struct`
- `mapping`
- `enum`
- `modifier`
- `require`-equivalent custom errors
- events
- timestamps
- access control
- transaction state changes

## 11. Candidate Registration

Only the admin can add candidates before the election starts. Candidate IDs are generated sequentially.

## 12. Voter Registration

Only the admin can register non-zero wallet addresses before the election starts. Duplicate registration is rejected.

## 13. Voting Algorithm

```text
Check election is ACTIVE
Check sender is registered
Check sender has not voted
Check candidate ID is valid
Mark voter as voted
Increment candidate count
Increment total votes
Emit event
```

## 14. Double-Vote Prevention

The `hasVoted` flag prevents a registered wallet from submitting another accepted vote.

## 15. Result Calculation

After the election ends, `getWinner()` scans candidate counts. If multiple candidates share the highest count, the contract returns a tie flag.

## 16. Testing

The Hardhat test suite verifies both valid behavior and rejected actions, including:

- deployment
- admin permissions
- candidate creation
- voter registration
- duplicate voters
- invalid address
- early voting
- successful voting
- double voting
- unregistered voting
- invalid candidates
- election ending
- winner calculation
- ties
- event emission

## 17. Simulation

The Remix VM can reproduce the lifecycle using several dummy accounts without real cryptocurrency.

## 18. Security Analysis

The contract provides basic access control and state validation. It does not provide complete election security.

Important risks include:

- wallet identity is not human identity
- public transaction metadata
- compromised endpoints
- admin trust
- key loss
- Sybil resistance
- coercion
- availability
- frontend security

## 19. Privacy Analysis

The contract avoids a public wallet-to-candidate mapping. Nevertheless, blockchain transparency can expose participation and transaction timing. Therefore the prototype should not be described as an anonymous secret-ballot system.

## 20. Results

Expected simulation:

```text
Candidate A: 2 votes
Candidate B: 1 vote
Candidate C: 0 votes
Total: 3
Winner: Candidate A
```

## 21. Advantages

- deterministic rules
- tamper-evident state
- automatic counting
- auditable transactions
- reduced manual counting
- educational Web3 experience

## 22. Limitations

- not a public election system
- no verified real-world identity
- no complete ballot secrecy
- no coercion resistance
- admin is trusted
- wallet/key management remains external
- frontend and endpoint risks remain

## 23. Future Scope

Future research can explore zero-knowledge proofs, anonymous credentials, encrypted ballots, commit-reveal protocols, decentralized identity, multi-party administration, formal verification, and independent security auditing.

## 24. Conclusion

The project demonstrates how blockchain and Solidity can encode election rules and create tamper-evident records in an educational environment. Its main value is learning smart-contract architecture, testing, security thinking, and Web3 integration rather than replacing real-world election infrastructure.
