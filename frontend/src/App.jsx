import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const ABI = [
  "function electionName() view returns (string)",
  "function status() view returns (uint8)",
  "function candidateCount() view returns (uint256)",
  "function totalVotes() view returns (uint256)",
  "function isRegisteredVoter(address) view returns (bool)",
  "function hasVoted(address) view returns (bool)",
  "function getAllCandidates() view returns (tuple(uint256 id,string name,string party,uint256 voteCount)[])",
  "function vote(uint256 candidateId)"
];

// Replace with the deployed contract address.
const CONTRACT_ADDRESS = "PASTE_DEPLOYED_CONTRACT_ADDRESS_HERE";

const STATUS = ["NOT_STARTED", "ACTIVE", "ENDED"];

export default function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("NOT_STARTED");
  const [eligible, setEligible] = useState(false);
  const [voted, setVoted] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState("");

  async function connectWallet() {
    if (!window.ethereum) {
      setMessage("MetaMask is not installed.");
      return;
    }

    if (CONTRACT_ADDRESS.includes("PASTE_")) {
      setMessage("Set CONTRACT_ADDRESS in App.jsx first.");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const voting = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    setAccount(address);
    setContract(voting);
  }

  async function refresh() {
    if (!contract || !account) return;

    try {
      const [electionName, rawStatus, registered, alreadyVoted, allCandidates] =
        await Promise.all([
          contract.electionName(),
          contract.status(),
          contract.isRegisteredVoter(account),
          contract.hasVoted(account),
          contract.getAllCandidates()
        ]);

      setName(electionName);
      setStatus(STATUS[Number(rawStatus)]);
      setEligible(registered);
      setVoted(alreadyVoted);
      setCandidates(allCandidates.map(c => ({
        id: Number(c.id),
        name: c.name,
        party: c.party,
        voteCount: Number(c.voteCount)
      })));
    } catch (error) {
      setMessage(error.shortMessage || error.message);
    }
  }

  async function castVote(candidateId) {
    if (!contract) return;

    try {
      setMessage("Confirm the transaction in your wallet...");
      const tx = await contract.vote(candidateId);
      await tx.wait();
      setMessage("Vote successfully recorded.");
      await refresh();
    } catch (error) {
      setMessage(error.shortMessage || error.message);
    }
  }

  useEffect(() => {
    refresh();
  }, [contract, account]);

  return (
    <main className="container">
      <h1>Blockchain-Based Voting System</h1>
      <p className="notice">
        Educational prototype only — not for real public elections.
      </p>

      <button onClick={connectWallet}>
        {account ? `Connected: ${account.slice(0, 8)}...` : "Connect Wallet"}
      </button>

      {name && <h2>{name}</h2>}

      <section className="card">
        <p><strong>Election status:</strong> {status}</p>
        <p><strong>Eligible:</strong> {eligible ? "Yes" : "No"}</p>
        <p><strong>Already voted:</strong> {voted ? "Yes" : "No"}</p>
      </section>

      <section>
        <h2>Candidates</h2>
        {candidates.map(candidate => (
          <article className="candidate" key={candidate.id}>
            <div>
              <h3>{candidate.id}. {candidate.name}</h3>
              <p>{candidate.party}</p>
            </div>
            <button
              disabled={status !== "ACTIVE" || !eligible || voted}
              onClick={() => castVote(candidate.id)}
            >
              Vote
            </button>
          </article>
        ))}
      </section>

      {message && <p className="message">{message}</p>}
    </main>
  );
}
