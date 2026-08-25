// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Blockchain-Based Voting System
 * @notice Educational prototype for demonstrating blockchain voting concepts.
 * @dev NOT suitable for real governmental/public elections.
 */
contract VotingSystem {
    address public immutable admin;
    string public electionName;

    enum ElectionStatus {
        NOT_STARTED,
        ACTIVE,
        ENDED
    }

    ElectionStatus public status;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public totalVotes;

    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
    }

    mapping(uint256 => Candidate) private candidates;
    mapping(address => Voter) private voters;
    uint256 public candidateCount;

    error NotAdmin();
    error ZeroAddress();
    error ElectionAlreadyStarted();
    error ElectionNotActive();
    error ElectionAlreadyEnded();
    error ElectionNotStarted();
    error InvalidTimeRange();
    error EmptyCandidateName();
    error VoterAlreadyRegistered();
    error VoterNotRegistered();
    error AlreadyVoted();
    error InvalidCandidate();
    error NoCandidates();
    error ElectionStillActive();
    error InvalidCandidateId();
    error TieDetected();

    event CandidateAdded(uint256 indexed candidateId, string name, string party);
    event VoterRegistered(address indexed voter);
    event ElectionStarted(uint256 indexed startTime, uint256 indexed endTime);
    // Deliberately does not include voter address or candidate ID.
    event VoteRecorded(uint256 indexed totalVotesAfterVote);
    event ElectionEnded(uint256 indexed endTime);

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier beforeStart() {
        if (status != ElectionStatus.NOT_STARTED) revert ElectionAlreadyStarted();
        _;
    }

    constructor(string memory _electionName) {
        if (bytes(_electionName).length == 0) revert EmptyCandidateName();
        admin = msg.sender;
        electionName = _electionName;
        status = ElectionStatus.NOT_STARTED;
    }

    function addCandidate(
        string calldata name,
        string calldata party
    ) external onlyAdmin beforeStart {
        if (bytes(name).length == 0) revert EmptyCandidateName();

        candidateCount++;
        candidates[candidateCount] = Candidate({
            id: candidateCount,
            name: name,
            party: party,
            voteCount: 0
        });

        emit CandidateAdded(candidateCount, name, party);
    }

    function registerVoter(address voter) public onlyAdmin beforeStart {
        if (voter == address(0)) revert ZeroAddress();
        if (voters[voter].isRegistered) revert VoterAlreadyRegistered();

        voters[voter] = Voter({
            isRegistered: true,
            hasVoted: false
        });

        emit VoterRegistered(voter);
    }

    function registerMultipleVoters(address[] calldata voterList)
        external
        onlyAdmin
        beforeStart
    {
        for (uint256 i = 0; i < voterList.length; i++) {
            registerVoter(voterList[i]);
        }
    }

    function startElection(uint256 durationSeconds)
        external
        onlyAdmin
        beforeStart
    {
        if (candidateCount == 0) revert NoCandidates();
        if (durationSeconds == 0) revert InvalidTimeRange();

        startTime = block.timestamp;
        endTime = block.timestamp + durationSeconds;
        status = ElectionStatus.ACTIVE;

        emit ElectionStarted(startTime, endTime);
    }

    function endElection() external onlyAdmin {
        if (status != ElectionStatus.ACTIVE) revert ElectionNotActive();

        status = ElectionStatus.ENDED;
        endTime = block.timestamp;

        emit ElectionEnded(endTime);
    }

    function vote(uint256 candidateId) external {
        if (status != ElectionStatus.ACTIVE) revert ElectionNotActive();
        if (block.timestamp >= endTime) revert ElectionNotActive();

        Voter storage voter = voters[msg.sender];
        if (!voter.isRegistered) revert VoterNotRegistered();
        if (voter.hasVoted) revert AlreadyVoted();
        if (candidateId == 0 || candidateId > candidateCount) {
            revert InvalidCandidate();
        }

        voter.hasVoted = true;
        candidates[candidateId].voteCount++;
        totalVotes++;

        emit VoteRecorded(totalVotes);
    }

    function getCandidate(uint256 candidateId)
        external
        view
        returns (Candidate memory)
    {
        if (candidateId == 0 || candidateId > candidateCount) {
            revert InvalidCandidateId();
        }
        return candidates[candidateId];
    }

    function getAllCandidates()
        external
        view
        returns (Candidate[] memory)
    {
        Candidate[] memory result = new Candidate[](candidateCount);
        for (uint256 i = 1; i <= candidateCount; i++) {
            result[i - 1] = candidates[i];
        }
        return result;
    }

    function isRegisteredVoter(address voter)
        external
        view
        returns (bool)
    {
        return voters[voter].isRegistered;
    }

    function hasVoted(address voter)
        external
        view
        returns (bool)
    {
        return voters[voter].hasVoted;
    }

    function getWinner()
        external
        view
        returns (
            uint256 winnerId,
            string memory winnerName,
            uint256 winnerVotes,
            bool tie
        )
    {
        if (status != ElectionStatus.ENDED) revert ElectionStillActive();
        if (candidateCount == 0) revert NoCandidates();

        uint256 highestVotes;
        uint256 topCandidateId;
        uint256 winners;

        for (uint256 i = 1; i <= candidateCount; i++) {
            uint256 count = candidates[i].voteCount;

            if (count > highestVotes) {
                highestVotes = count;
                topCandidateId = i;
                winners = 1;
            } else if (count == highestVotes) {
                winners++;
            }
        }

        if (winners > 1) {
            return (0, "", highestVotes, true);
        }

        Candidate memory winner = candidates[topCandidateId];
        return (
            winner.id,
            winner.name,
            winner.voteCount,
            false
        );
    }

    function getElectionStatus()
        external
        view
        returns (
            ElectionStatus currentStatus,
            uint256 currentStartTime,
            uint256 currentEndTime,
            uint256 votes
        )
    {
        return (status, startTime, endTime, totalVotes);
    }

    /**
     * @notice Allows the admin to close an expired election.
     * @dev A public automatic state transition is intentionally avoided so
     *      the prototype keeps state changes explicit and easy to understand.
     */
    function finalizeExpiredElection() external onlyAdmin {
        if (status != ElectionStatus.ACTIVE) revert ElectionNotActive();
        if (block.timestamp < endTime) revert InvalidTimeRange();

        status = ElectionStatus.ENDED;
        emit ElectionEnded(block.timestamp);
    }
}
