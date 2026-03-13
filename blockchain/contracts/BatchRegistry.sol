// contracts/BatchRegistry.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BatchRegistry {
    struct BatchRecord {
        bytes32 dataHash;
        string batchId;
        address manufacturer;
        uint256 createdAt;
        bool exists;
    }

    mapping(string => BatchRecord) private batches;
    mapping(address => bool) public authorizedManufacturers;
    address public owner;

    event ManufacturerAuthorized(address indexed manufacturer, bool status);
    event BatchRegistered(
        string indexed batchId,
        bytes32 indexed dataHash,
        address indexed manufacturer,
        uint256 createdAt
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyManufacturer() {
        require(authorizedManufacturers[msg.sender], "Not authorized manufacturer");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedManufacturers[msg.sender] = true;
    }

    function setManufacturer(address mfg, bool status) external onlyOwner {
        authorizedManufacturers[mfg] = status;
        emit ManufacturerAuthorized(mfg, status);
    }

    function registerBatch(string calldata batchId, bytes32 dataHash) external onlyManufacturer {
        require(!batches[batchId].exists, "Batch already exists");

        batches[batchId] = BatchRecord({
            dataHash: dataHash,
            batchId: batchId,
            manufacturer: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });

        emit BatchRegistered(batchId, dataHash, msg.sender, block.timestamp);
    }

    function getBatch(string calldata batchId) external view returns (
        bytes32 dataHash,
        string memory id,
        address manufacturer,
        uint256 createdAt,
        bool exists
    ) {
        BatchRecord memory b = batches[batchId];
        return (b.dataHash, b.batchId, b.manufacturer, b.createdAt, b.exists);
    }
}