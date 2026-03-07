// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title EchoRegistry — Citizen Evidence Reporting for Nepal
/// @notice This contract lets citizens submit civic reports on-chain and lets
///         government bodies update report statuses. All data is permanent and
///         publicly auditable on the Polygon blockchain.
contract EchoRegistry {
    // -------------------------------------------------------
    //  Data structures
    // -------------------------------------------------------

    /// @notice Represents a single citizen report stored on-chain.
    struct Report {
        uint256 id;            // Unique report ID (1-indexed)
        address reporter;      // Wallet address of the citizen who submitted
        string ipfsHash;       // Pinata IPFS CID pointing to report metadata/photo
        string location;       // Human-readable location, e.g. "Lalitpur Ward 5"
        string category;       // Issue category, e.g. "Road Damage"
        uint8 status;          // 0 = Submitted, 1 = InReview, 2 = Escalated, 3 = Resolved
        uint256 timestamp;     // Block timestamp when the report was created
        address assignedBody;  // Government wallet that last updated the status
    }

    // -------------------------------------------------------
    //  State variables
    // -------------------------------------------------------

    /// @notice Total number of reports ever submitted. Also used as the next ID.
    uint256 public reportCount;

    /// @notice Maps a report ID to its full Report struct.
    mapping(uint256 => Report) public reports;

    // -------------------------------------------------------
    //  Events
    // -------------------------------------------------------

    /// @notice Emitted when a citizen submits a new report.
    event ReportSubmitted(
        uint256 indexed id,
        address indexed reporter,
        string ipfsHash
    );

    /// @notice Emitted when a government body updates a report's status.
    event StatusUpdated(
        uint256 indexed id,
        uint8 newStatus,
        address indexed updatedBy
    );

    // -------------------------------------------------------
    //  Functions
    // -------------------------------------------------------

    /// @notice Submit a new civic report to the blockchain.
    /// @dev Increments reportCount, creates a Report struct, stores it, and
    ///      emits a ReportSubmitted event. Anyone with a wallet can call this.
    /// @param _ipfsHash  The IPFS CID (from Pinata) of the uploaded evidence.
    /// @param _location  A human-readable location string.
    /// @param _category  The issue category (e.g. "Water Supply").
    /// @return The ID of the newly created report.
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
            status: 0,               // Submitted
            timestamp: block.timestamp,
            assignedBody: address(0)  // No one assigned yet
        });

        emit ReportSubmitted(reportCount, msg.sender, _ipfsHash);

        return reportCount;
    }

    /// @notice Update the status of an existing report.
    /// @dev Sets the new status and records which wallet made the update.
    ///      Intended to be called by a government body, but there is no
    ///      access-control gate — kept simple for the hackathon.
    /// @param _reportId  The ID of the report to update.
    /// @param _newStatus The new status code (0-3).
    function updateStatus(uint256 _reportId, uint8 _newStatus) external {
        require(_reportId > 0 && _reportId <= reportCount, "Report does not exist");

        reports[_reportId].status = _newStatus;
        reports[_reportId].assignedBody = msg.sender;

        emit StatusUpdated(_reportId, _newStatus, msg.sender);
    }

    /// @notice Retrieve the full details of a report by its ID.
    /// @dev This is a view function — it reads from the blockchain for free.
    /// @param _reportId The ID of the report to look up.
    /// @return The complete Report struct.
    function getReport(uint256 _reportId) external view returns (Report memory) {
        require(_reportId > 0 && _reportId <= reportCount, "Report does not exist");
        return reports[_reportId];
    }

    /// @notice Returns the total number of reports submitted so far.
    /// @return The current reportCount.
    function getReportCount() public view returns (uint256) {
        return reportCount;
    }
}
