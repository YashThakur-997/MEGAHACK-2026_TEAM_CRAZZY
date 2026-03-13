const { ethers } = require("ethers");

// Put your deployed contract ABI JSON here or require from file
const ABI = [
  "function assignActorRole(address actor, uint8 role) external",
  "function actorRoles(address actor) external view returns (uint8)",
  "function createBatch(bytes32 batchId, string drugName, string dosage, uint256 quantity, uint256 manufactureDate, uint256 expiryDate, string metadataHash, string location, string notes) external",
  "function getBatch(bytes32 batchId) external view returns (string drugName, string dosage, uint256 quantity, uint256 manufactureDate, uint256 expiryDate, address manufacturer, address distributor, address pharmacy, address currentCustodian, uint8 status, string metadataHash)"
];

function getContract() {
  const rpcUrl = process.env.RPC_URL;
  const privateKeyRaw = process.env.MANUFACTURER_PRIVATE_KEY;
  const registryAddress = process.env.BATCH_REGISTRY_ADDRESS;

  if (!rpcUrl || !privateKeyRaw || !registryAddress) {
    throw new Error(
      "Blockchain config missing. Set RPC_URL, MANUFACTURER_PRIVATE_KEY, and BATCH_REGISTRY_ADDRESS in server/.env"
    );
  }

  const privateKey = privateKeyRaw.startsWith("0x") ? privateKeyRaw : `0x${privateKeyRaw}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
    throw new Error("MANUFACTURER_PRIVATE_KEY must be a 32-byte hex string");
  }

  if (!ethers.isAddress(registryAddress)) {
    throw new Error("BATCH_REGISTRY_ADDRESS is not a valid EVM address");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const managedSigner = new ethers.NonceManager(wallet);
  return new ethers.Contract(registryAddress, ABI, managedSigner);
}

function toBytes32BatchId(batchId) {
  return ethers.keccak256(ethers.toUtf8Bytes(batchId));
}

function toUnix(dateLike) {
  const ms = new Date(dateLike).getTime();
  if (!Number.isFinite(ms)) {
    throw new Error(`Invalid date value: ${dateLike}`);
  }
  return Math.floor(ms / 1000);
}

async function ensureManufacturerRole(contract) {
  const manufacturerRole = 1;
  const walletAddress = await contract.runner.getAddress();
  const currentRole = Number(await contract.actorRoles(walletAddress));
  if (currentRole !== manufacturerRole) {
    const tx = await contract.assignActorRole(walletAddress, manufacturerRole);
    await tx.wait();
  }
}

async function registerBatchOnChain(batch, hash) {
  const contract = getContract();
  await ensureManufacturerRole(contract);

  const batchIdBytes32 = toBytes32BatchId(batch.batchId);
  const manufactureDate = toUnix(batch.mfgDate);
  const expiryDate = toUnix(batch.expDate);

  const tx = await contract.createBatch(
    batchIdBytes32,
    batch.productName,
    batch.category || "NA",
    Number(batch.quantity),
    manufactureDate,
    expiryDate,
    hash,
    batch.plantCode || "Unknown",
    "Registered via PharmaSeal"
  );
  const receipt = await tx.wait();
  return receipt.hash;
}

async function getBatchOnChain(batchId) {
  const contract = getContract();
  const b = await contract.getBatch(toBytes32BatchId(batchId));
  return {
    dataHash: b[10],
    manufacturer: b[5],
    quantity: Number(b[2]),
    manufactureDate: Number(b[3]),
    expiryDate: Number(b[4]),
    status: Number(b[9]),
  };
}

module.exports = { registerBatchOnChain, getBatchOnChain };