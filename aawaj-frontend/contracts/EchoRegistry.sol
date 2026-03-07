// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title EchoRegistry — Citizen Evidence Reporting for Nepal
/// @notice Citizens submit civic reports on-chain; government bodies update
///         statuses and escalate through Ward → Municipality → District →
///         Province → Federal. Reporters confirm or dispute resolutions.
contract EchoRegistry {

    // -------------------------------------------------------
    //  Data structures
    // -------------------------------------------------------

    struct Report {
        uint256 id;
        address reporter;
        string ipfsHash;
        string location;
        string category;
        uint8 status;            // 0=Submitted 1=InReview 2=Escalated 3=PendingConfirmation 4=Resolved 5=Disputed
        uint256 timestamp;
        address assignedBody;
        uint8 escalationLevel;   // 0=Ward 1=Municipality 2=District 3=Province 4=Federal
        bool reporterConfirmed;
        uint256 lastUpdated;
    }

    // -------------------------------------------------------
    //  State variables
    // -------------------------------------------------------

    uint256 public reportCount;
    mapping(uint256 => Report) public reports;

    // -------------------------------------------------------
    //  Events
    // -------------------------------------------------------

    event ReportSubmitted(uint256 indexed id, address indexed reporter, string ipfsHash);
    event StatusUpdated(uint256 indexed id, uint8 newStatus, address indexed updatedBy);
    event ReportEscalated(uint256 indexed id, uint8 newLevel, address escalatedBy);
    event ResolutionPending(uint256 indexed id, address markedBy);
    event ResolutionConfirmed(uint256 indexed id, address confirmedBy);
    event ResolutionDisputed(uint256 indexed id, address disputedBy);

    // -------------------------------------------------------
    //  Modifiers
    // -------------------------------------------------------

    modifier reportExists(uint256 _reportId) {
        require(_reportId > 0 && _reportId <= reportCount, "Report does not exist");
        _;
    }

    // -------------------------------------------------------
    //  Functions
    // -------------------------------------------------------

    function submitReport(
        string calldata _ipfsHash,
        string calldata _location,
        string calldata _category
    ) external returns (uint256) {
        reportCount++;

        reports[reportCount] = Report({
            id: reportCount,
            reporter: msg.sender,
            ipfsHash: _ipfsHash,
            location: _location,
            category: _category,
            status: 0,
            timestamp: block.timestamp,
            assignedBody: address(0),
            escalationLevel: 0,
            reporterConfirmed: false,
            lastUpdated: block.timestamp
        });

        emit ReportSubmitted(reportCount, msg.sender, _ipfsHash);
        return reportCount;
    }

    function updateStatus(uint256 _reportId, uint8 _newStatus) external reportExists(_reportId) {
        reports[_reportId].status = _newStatus;
        reports[_reportId].assignedBody = msg.sender;
        reports[_reportId].lastUpdated = block.timestamp;

        emit StatusUpdated(_reportId, _newStatus, msg.sender);
    }

    function escalateReport(uint256 _reportId) external reportExists(_reportId) {
        require(reports[_reportId].escalationLevel < 4, "Already at highest escalation level");

        reports[_reportId].escalationLevel++;
        reports[_reportId].status = 2; // Escalated
        reports[_reportId].assignedBody = msg.sender;
        reports[_reportId].lastUpdated = block.timestamp;

        emit ReportEscalated(_reportId, reports[_reportId].escalationLevel, msg.sender);
    }

    function markPendingConfirmation(uint256 _reportId) external reportExists(_reportId) {
        reports[_reportId].status = 3; // PendingConfirmation
        reports[_reportId].assignedBody = msg.sender;
        reports[_reportId].lastUpdated = block.timestamp;

        emit ResolutionPending(_reportId, msg.sender);
    }

    function confirmResolution(uint256 _reportId) external reportExists(_reportId) {
        require(msg.sender == reports[_reportId].reporter, "Only the original reporter can confirm resolution");

        reports[_reportId].status = 4; // Resolved
        reports[_reportId].reporterConfirmed = true;
        reports[_reportId].lastUpdated = block.timestamp;

        emit ResolutionConfirmed(_reportId, msg.sender);
    }

    function disputeResolution(uint256 _reportId) external reportExists(_reportId) {
        require(msg.sender == reports[_reportId].reporter, "Only the original reporter can dispute resolution");
        require(reports[_reportId].status == 3, "Report is not pending confirmation");

        reports[_reportId].status = 5; // Disputed
        reports[_reportId].lastUpdated = block.timestamp;

        emit ResolutionDisputed(_reportId, msg.sender);
    }

    function getReport(uint256 _reportId) external view reportExists(_reportId) returns (Report memory) {
        return reports[_reportId];
    }

    function getReportCount() public view returns (uint256) {
        return reportCount;
    }

    function getRecentReportIds(uint256 count) external view returns (uint256[] memory) {
        uint256 total = reportCount;
        if (count > total) count = total;
        if (count > 20) count = 20;

        uint256[] memory ids = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            ids[i] = total - i;
        }
        return ids;
    }
}
