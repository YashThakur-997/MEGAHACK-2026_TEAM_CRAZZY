// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PharmaSupplyChainVerification
/// @notice Tracks pharmaceutical batches from manufacturing to dispensing.
contract PharmaSupplyChainVerification {
	enum ActorRole {
		None,
		Manufacturer,
		Distributor,
		Pharmacy,
		Regulator
	}

	enum BatchStatus {
		None,
		Created,
		Manufactured,
		InTransitToDistributor,
		AtDistributor,
		InTransitToPharmacy,
		AtPharmacy,
		Dispensed,
		Recalled
	}

	struct Checkpoint {
		BatchStatus status;
		address actor;
		uint256 timestamp;
		string location;
		string notes;
	}

	struct Batch {
		bool exists;
		bytes32 batchId;
		string drugName;
		string dosage;
		uint256 quantity;
		uint256 manufactureDate;
		uint256 expiryDate;
		address manufacturer;
		address distributor;
		address pharmacy;
		address currentCustodian;
		BatchStatus status;
		string metadataHash;
	}

	address public immutable owner;

	mapping(address => ActorRole) public actorRoles;
	mapping(bytes32 => Batch) private batches;
	mapping(bytes32 => Checkpoint[]) private batchHistory;

	event ActorRoleAssigned(address indexed actor, ActorRole indexed role);
	event BatchCreated(
		bytes32 indexed batchId,
		address indexed manufacturer,
		string drugName,
		uint256 quantity,
		uint256 expiryDate
	);
	event BatchStatusUpdated(
		bytes32 indexed batchId,
		BatchStatus indexed status,
		address indexed actor,
		string location,
		string notes
	);

	error Unauthorized();
	error InvalidActor();
	error InvalidRole();
	error InvalidBatch();
	error InvalidStatusTransition();
	error InvalidDateRange();
	error InvalidQuantity();

	constructor() {
		owner = msg.sender;
		actorRoles[msg.sender] = ActorRole.Regulator;
		emit ActorRoleAssigned(msg.sender, ActorRole.Regulator);
	}

	modifier onlyOwnerOrRegulator() {
		if (msg.sender != owner && actorRoles[msg.sender] != ActorRole.Regulator) {
			revert Unauthorized();
		}
		_;
	}

	modifier onlyRole(ActorRole role) {
		if (actorRoles[msg.sender] != role) {
			revert Unauthorized();
		}
		_;
	}

	modifier batchMustExist(bytes32 batchId) {
		if (!batches[batchId].exists) {
			revert InvalidBatch();
		}
		_;
	}

	function assignActorRole(address actor, ActorRole role) external onlyOwnerOrRegulator {
		if (actor == address(0)) {
			revert InvalidActor();
		}
		if (role == ActorRole.None) {
			revert InvalidRole();
		}
		actorRoles[actor] = role;
		emit ActorRoleAssigned(actor, role);
	}

	function createBatch(
		bytes32 batchId,
		string calldata drugName,
		string calldata dosage,
		uint256 quantity,
		uint256 manufactureDate,
		uint256 expiryDate,
		string calldata metadataHash,
		string calldata location,
		string calldata notes
	) external onlyRole(ActorRole.Manufacturer) {
		if (batchId == bytes32(0) || batches[batchId].exists) {
			revert InvalidBatch();
		}
		if (quantity == 0) {
			revert InvalidQuantity();
		}
		if (manufactureDate == 0 || expiryDate <= manufactureDate) {
			revert InvalidDateRange();
		}

		Batch storage batch = batches[batchId];
		batch.exists = true;
		batch.batchId = batchId;
		batch.drugName = drugName;
		batch.dosage = dosage;
		batch.quantity = quantity;
		batch.manufactureDate = manufactureDate;
		batch.expiryDate = expiryDate;
		batch.manufacturer = msg.sender;
		batch.currentCustodian = msg.sender;
		batch.status = BatchStatus.Created;
		batch.metadataHash = metadataHash;

		emit BatchCreated(batchId, msg.sender, drugName, quantity, expiryDate);
		_appendCheckpoint(batchId, BatchStatus.Created, msg.sender, location, notes);
	}

	function markManufactured(
		bytes32 batchId,
		string calldata location,
		string calldata notes
	) external batchMustExist(batchId) {
		Batch storage batch = batches[batchId];
		if (msg.sender != batch.manufacturer) {
			revert Unauthorized();
		}
		if (batch.status != BatchStatus.Created) {
			revert InvalidStatusTransition();
		}

		batch.status = BatchStatus.Manufactured;
		_appendCheckpoint(batchId, BatchStatus.Manufactured, msg.sender, location, notes);
	}

	function shipToDistributor(
		bytes32 batchId,
		address distributor,
		string calldata location,
		string calldata notes
	) external batchMustExist(batchId) {
		Batch storage batch = batches[batchId];
		if (msg.sender != batch.manufacturer || batch.currentCustodian != msg.sender) {
			revert Unauthorized();
		}
		if (actorRoles[distributor] != ActorRole.Distributor) {
			revert InvalidRole();
		}
		if (batch.status != BatchStatus.Manufactured) {
			revert InvalidStatusTransition();
		}

		batch.distributor = distributor;
		batch.currentCustodian = distributor;
		batch.status = BatchStatus.InTransitToDistributor;
		_appendCheckpoint(batchId, BatchStatus.InTransitToDistributor, msg.sender, location, notes);
	}

	function receiveAtDistributor(
		bytes32 batchId,
		string calldata location,
		string calldata notes
	) external onlyRole(ActorRole.Distributor) batchMustExist(batchId) {
		Batch storage batch = batches[batchId];
		if (msg.sender != batch.distributor || msg.sender != batch.currentCustodian) {
			revert Unauthorized();
		}
		if (batch.status != BatchStatus.InTransitToDistributor) {
			revert InvalidStatusTransition();
		}

		batch.status = BatchStatus.AtDistributor;
		_appendCheckpoint(batchId, BatchStatus.AtDistributor, msg.sender, location, notes);
	}

	function shipToPharmacy(
		bytes32 batchId,
		address pharmacy,
		string calldata location,
		string calldata notes
	) external onlyRole(ActorRole.Distributor) batchMustExist(batchId) {
		Batch storage batch = batches[batchId];
		if (msg.sender != batch.distributor || msg.sender != batch.currentCustodian) {
			revert Unauthorized();
		}
		if (actorRoles[pharmacy] != ActorRole.Pharmacy) {
			revert InvalidRole();
		}
		if (batch.status != BatchStatus.AtDistributor) {
			revert InvalidStatusTransition();
		}

		batch.pharmacy = pharmacy;
		batch.currentCustodian = pharmacy;
		batch.status = BatchStatus.InTransitToPharmacy;
		_appendCheckpoint(batchId, BatchStatus.InTransitToPharmacy, msg.sender, location, notes);
	}

	function receiveAtPharmacy(
		bytes32 batchId,
		string calldata location,
		string calldata notes
	) external onlyRole(ActorRole.Pharmacy) batchMustExist(batchId) {
		Batch storage batch = batches[batchId];
		if (msg.sender != batch.pharmacy || msg.sender != batch.currentCustodian) {
			revert Unauthorized();
		}
		if (batch.status != BatchStatus.InTransitToPharmacy) {
			revert InvalidStatusTransition();
		}

		batch.status = BatchStatus.AtPharmacy;
		_appendCheckpoint(batchId, BatchStatus.AtPharmacy, msg.sender, location, notes);
	}

	function markDispensed(
		bytes32 batchId,
		string calldata location,
		string calldata notes
	) external onlyRole(ActorRole.Pharmacy) batchMustExist(batchId) {
		Batch storage batch = batches[batchId];
		if (msg.sender != batch.pharmacy || msg.sender != batch.currentCustodian) {
			revert Unauthorized();
		}
		if (batch.status != BatchStatus.AtPharmacy) {
			revert InvalidStatusTransition();
		}

		batch.status = BatchStatus.Dispensed;
		_appendCheckpoint(batchId, BatchStatus.Dispensed, msg.sender, location, notes);
	}

	function recallBatch(
		bytes32 batchId,
		string calldata location,
		string calldata notes
	) external onlyOwnerOrRegulator batchMustExist(batchId) {
		Batch storage batch = batches[batchId];
		if (batch.status == BatchStatus.Dispensed || batch.status == BatchStatus.Recalled) {
			revert InvalidStatusTransition();
		}

		batch.status = BatchStatus.Recalled;
		_appendCheckpoint(batchId, BatchStatus.Recalled, msg.sender, location, notes);
	}

	function getBatch(bytes32 batchId)
		external
		view
		batchMustExist(batchId)
		returns (
			string memory drugName,
			string memory dosage,
			uint256 quantity,
			uint256 manufactureDate,
			uint256 expiryDate,
			address manufacturer,
			address distributor,
			address pharmacy,
			address currentCustodian,
			BatchStatus status,
			string memory metadataHash
		)
	{
		Batch storage batch = batches[batchId];
		return (
			batch.drugName,
			batch.dosage,
			batch.quantity,
			batch.manufactureDate,
			batch.expiryDate,
			batch.manufacturer,
			batch.distributor,
			batch.pharmacy,
			batch.currentCustodian,
			batch.status,
			batch.metadataHash
		);
	}

	function getCheckpointCount(bytes32 batchId)
		external
		view
		batchMustExist(batchId)
		returns (uint256)
	{
		return batchHistory[batchId].length;
	}

	function getCheckpoint(bytes32 batchId, uint256 index)
		external
		view
		batchMustExist(batchId)
		returns (
			BatchStatus status,
			address actor,
			uint256 timestamp,
			string memory location,
			string memory notes
		)
	{
		Checkpoint storage cp = batchHistory[batchId][index];
		return (cp.status, cp.actor, cp.timestamp, cp.location, cp.notes);
	}

	function verifyBatchAuthenticity(bytes32 batchId)
		external
		view
		returns (
			bool exists,
			bool isExpired,
			bool isRecalled,
			BatchStatus currentStatus,
			uint256 historyEntries
		)
	{
		Batch storage batch = batches[batchId];
		if (!batch.exists) {
			return (false, false, false, BatchStatus.None, 0);
		}

		return (
			true,
			block.timestamp > batch.expiryDate,
			batch.status == BatchStatus.Recalled,
			batch.status,
			batchHistory[batchId].length
		);
	}

	function _appendCheckpoint(
		bytes32 batchId,
		BatchStatus status,
		address actor,
		string calldata location,
		string calldata notes
	) internal {
		batchHistory[batchId].push(
			Checkpoint({
				status: status,
				actor: actor,
				timestamp: block.timestamp,
				location: location,
				notes: notes
			})
		);

		emit BatchStatusUpdated(batchId, status, actor, location, notes);
	}
}
