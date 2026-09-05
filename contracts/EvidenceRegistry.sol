// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EvidenceRegistry {

    struct Evidence {
        bytes32 evidenceHash;
        string candidate;
        string decision;
        uint256 timestamp;
        address submittedBy;
    }

    uint256 public evidenceCount;

    mapping(uint256 => Evidence) private evidenceRecords;

    event EvidenceRegistered(
        uint256 indexed evidenceId,
        bytes32 indexed evidenceHash,
        string candidate,
        string decision,
        uint256 timestamp,
        address submittedBy
    );

    function registerEvidence(
        bytes32 _evidenceHash,
        string calldata _candidate,
        string calldata _decision
    )
        external
        returns (uint256)
    {
        evidenceCount++;

        uint256 id = evidenceCount;

        evidenceRecords[id] = Evidence({
            evidenceHash: _evidenceHash,
            candidate: _candidate,
            decision: _decision,
            timestamp: block.timestamp,
            submittedBy: msg.sender
        });

        emit EvidenceRegistered(
            id,
            _evidenceHash,
            _candidate,
            _decision,
            block.timestamp,
            msg.sender
        );

        return id;
    }

    function getEvidence(
        uint256 _id
    )
        external
        view
        returns (
            bytes32 evidenceHash,
            string memory candidate,
            string memory decision,
            uint256 timestamp,
            address submittedBy
        )
    {
        require(
            _id > 0 && _id <= evidenceCount,
            "Evidence does not exist"
        );

        Evidence memory evidence = evidenceRecords[_id];

        return (
            evidence.evidenceHash,
            evidence.candidate,
            evidence.decision,
            evidence.timestamp,
            evidence.submittedBy
        );
    }
}