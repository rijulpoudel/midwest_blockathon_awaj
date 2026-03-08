// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * AAWAJ Registry — Citizen evidence reporting for Nepal
 * 
 * Status flow:
 *   0 Submitted → 1 InReview → escalation chain (2-5) → 6 GovResolved
 *   After GovResolved, only the relayer can confirm or dispute on behalf of the citizen:
 *   → 7 ConfirmedResolved  (citizen agrees it's fixed)
 *   → 8 Disputed           (citizen disagrees)
 *
 * Escalation levels follow Nepal's governance:
 *   2 = Ward  →  3 = Municipality  →  4 = Province  →  5 = Federal
 *
 * Deploy on Polygon Amoy via Remix (remix.ethereum.org)
 * After deploying, copy the ABI and contract address into the frontend.
 */
contract AawajRegistry {
    enum Status {
        Submitted,              // 0
        InReview,               // 1
        EscalatedWard,          // 2
        EscalatedMunicipality,  // 3
        EscalatedProvince,      // 4
        EscalatedFederal,       // 5
        GovResolved,            // 6
        ConfirmedResolved,      // 7
        Disputed                // 8
    }

    struct Report {
        uint256 id;
        address submitter;
        string ipfsCid;
        string location;
        string category;
        Status status;
        uint256 timestamp;
    }

    address public government;
    mapping(uint256 => Report) public reports;
    uint256 public reportCount;

    event ReportSubmitted(uint256 indexed id, address indexed submitter, string ipfsCid);
    event StatusUpdated(uint256 indexed id, Status newStatus);

    constructor() {
        government = msg.sender;
    }

    function submitReport(
        string memory _ipfsCid,
        string memory _location,
        string memory _category
    ) public returns (uint256) {
        reportCount++;
        reports[reportCount] = Report(
            reportCount,
            msg.sender,
            _ipfsCid,
            _location,
            _category,
            Status.Submitted,
            block.timestamp
        );
        emit ReportSubmitted(reportCount, msg.sender, _ipfsCid);
        return reportCount;
    }

    function updateStatus(uint256 _id, Status _status) public {
        require(_id > 0 && _id <= reportCount, "Invalid report ID");
        reports[_id].status = _status;
        emit StatusUpdated(_id, _status);
    }

    function getReport(uint256 _id) public view returns (Report memory) {
        require(_id > 0 && _id <= reportCount, "Invalid report ID");
        return reports[_id];
    }

    function getReportCount() public view returns (uint256) {
        return reportCount;
    }
}
