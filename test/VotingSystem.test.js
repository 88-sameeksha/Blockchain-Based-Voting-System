const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingSystem", function () {
  let voting, admin, voterA, voterB, voterC, outsider;

  beforeEach(async function () {
    [admin, voterA, voterB, voterC, outsider] = await ethers.getSigners();

    const VotingSystem = await ethers.getContractFactory("VotingSystem");
    voting = await VotingSystem.deploy("Student Council Election");
    await voting.waitForDeployment();
  });

  async function setupElection() {
    await voting.connect(admin).addCandidate("Candidate A", "Group A");
    await voting.connect(admin).addCandidate("Candidate B", "Group B");
    await voting.connect(admin).addCandidate("Candidate C", "Group C");

    await voting.connect(admin).registerVoter(voterA.address);
    await voting.connect(admin).registerVoter(voterB.address);
    await voting.connect(admin).registerVoter(voterC.address);
  }

  it("deploys with the correct admin", async function () {
    expect(await voting.admin()).to.equal(admin.address);
    expect(await voting.electionName()).to.equal("Student Council Election");
  });

  it("allows admin to add a candidate", async function () {
    await expect(voting.connect(admin).addCandidate("Candidate A", "Group A"))
      .to.emit(voting, "CandidateAdded")
      .withArgs(1, "Candidate A", "Group A");

    const candidate = await voting.getCandidate(1);
    expect(candidate.name).to.equal("Candidate A");
    expect(candidate.voteCount).to.equal(0);
  });

  it("prevents non-admin from adding a candidate", async function () {
    await expect(
      voting.connect(voterA).addCandidate("Candidate A", "Group A")
    ).to.be.revertedWithCustomError(voting, "NotAdmin");
  });

  it("registers a voter", async function () {
    await expect(voting.connect(admin).registerVoter(voterA.address))
      .to.emit(voting, "VoterRegistered")
      .withArgs(voterA.address);

    expect(await voting.isRegisteredVoter(voterA.address)).to.equal(true);
  });

  it("rejects duplicate voter registration", async function () {
    await voting.connect(admin).registerVoter(voterA.address);

    await expect(
      voting.connect(admin).registerVoter(voterA.address)
    ).to.be.revertedWithCustomError(voting, "VoterAlreadyRegistered");
  });

  it("rejects the zero address", async function () {
    await expect(
      voting.connect(admin).registerVoter(ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(voting, "ZeroAddress");
  });

  it("rejects voting before election starts", async function () {
    await setupElection();

    await expect(
      voting.connect(voterA).vote(1)
    ).to.be.revertedWithCustomError(voting, "ElectionNotActive");
  });

  it("starts the election", async function () {
    await setupElection();

    await expect(voting.connect(admin).startElection(3600))
      .to.emit(voting, "ElectionStarted");

    const status = await voting.status();
    expect(status).to.equal(1); // ACTIVE
  });

  it("allows a registered voter to vote", async function () {
    await setupElection();
    await voting.connect(admin).startElection(3600);

    await expect(voting.connect(voterA).vote(1))
      .to.emit(voting, "VoteRecorded")
      .withArgs(1);

    const candidate = await voting.getCandidate(1);
    expect(candidate.voteCount).to.equal(1);
    expect(await voting.totalVotes()).to.equal(1);
    expect(await voting.hasVoted(voterA.address)).to.equal(true);
  });

  it("prevents double voting", async function () {
    await setupElection();
    await voting.connect(admin).startElection(3600);
    await voting.connect(voterA).vote(1);

    await expect(
      voting.connect(voterA).vote(2)
    ).to.be.revertedWithCustomError(voting, "AlreadyVoted");
  });

  it("rejects an unregistered voter", async function () {
    await setupElection();
    await voting.connect(admin).startElection(3600);

    await expect(
      voting.connect(outsider).vote(1)
    ).to.be.revertedWithCustomError(voting, "VoterNotRegistered");
  });

  it("rejects an invalid candidate", async function () {
    await setupElection();
    await voting.connect(admin).startElection(3600);

    await expect(
      voting.connect(voterA).vote(999)
    ).to.be.revertedWithCustomError(voting, "InvalidCandidate");
  });

  it("prevents candidate addition after election starts", async function () {
    await setupElection();
    await voting.connect(admin).startElection(3600);

    await expect(
      voting.connect(admin).addCandidate("Late Candidate", "Group X")
    ).to.be.revertedWithCustomError(voting, "ElectionAlreadyStarted");
  });

  it("prevents voter registration after election starts", async function () {
    await setupElection();
    await voting.connect(admin).startElection(3600);

    await expect(
      voting.connect(admin).registerVoter(outsider.address)
    ).to.be.revertedWithCustomError(voting, "ElectionAlreadyStarted");
  });

  it("ends the election and prevents further voting", async function () {
    await setupElection();
    await voting.connect(admin).startElection(3600);
    await voting.connect(voterA).vote(1);
    await voting.connect(admin).endElection();

    expect(await voting.status()).to.equal(2); // ENDED

    await expect(
      voting.connect(voterB).vote(2)
    ).to.be.revertedWithCustomError(voting, "ElectionNotActive");
  });

  it("calculates the winner", async function () {
    await setupElection();
    await voting.connect(admin).startElection(3600);

    await voting.connect(voterA).vote(1);
    await voting.connect(voterB).vote(1);
    await voting.connect(voterC).vote(2);

    await voting.connect(admin).endElection();

    const result = await voting.getWinner();
    expect(result.winnerId).to.equal(1);
    expect(result.winnerName).to.equal("Candidate A");
    expect(result.winnerVotes).to.equal(2);
    expect(result.tie).to.equal(false);
  });

  it("detects a tie", async function () {
    await setupElection();
    await voting.connect(admin).startElection(3600);

    await voting.connect(voterA).vote(1);
    await voting.connect(voterB).vote(2);

    await voting.connect(admin).endElection();

    const result = await voting.getWinner();
    expect(result.tie).to.equal(true);
  });

  it("emits the expected election events", async function () {
    await voting.connect(admin).addCandidate("Candidate A", "Group A");
    await voting.connect(admin).registerVoter(voterA.address);

    await expect(voting.connect(admin).startElection(3600))
      .to.emit(voting, "ElectionStarted");

    await expect(voting.connect(voterA).vote(1))
      .to.emit(voting, "VoteRecorded")
      .withArgs(1);

    await expect(voting.connect(admin).endElection())
      .to.emit(voting, "ElectionEnded");
  });

  it("supports registering multiple voters", async function () {
    await voting.connect(admin).registerMultipleVoters([
      voterA.address,
      voterB.address,
      voterC.address
    ]);

    expect(await voting.isRegisteredVoter(voterA.address)).to.equal(true);
    expect(await voting.isRegisteredVoter(voterB.address)).to.equal(true);
    expect(await voting.isRegisteredVoter(voterC.address)).to.equal(true);
  });

  it("rejects an empty candidate name", async function () {
    await expect(
      voting.connect(admin).addCandidate("", "Group A")
    ).to.be.revertedWithCustomError(voting, "EmptyCandidateName");
  });

  it("rejects starting without candidates", async function () {
    await expect(
      voting.connect(admin).startElection(3600)
    ).to.be.revertedWithCustomError(voting, "NoCandidates");
  });
});
