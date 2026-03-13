const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PharmaSupplyChainVerification", function () {
  async function deployFixture() {
    const [owner, manufacturer, distributor, pharmacy, outsider] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("PharmaSupplyChainVerification");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();

    const Manufacturer = 1n;
    const Distributor = 2n;
    const Pharmacy = 3n;

    await contract.assignActorRole(manufacturer.address, Manufacturer);
    await contract.assignActorRole(distributor.address, Distributor);
    await contract.assignActorRole(pharmacy.address, Pharmacy);

    return { contract, owner, manufacturer, distributor, pharmacy, outsider };
  }

  it("creates a batch and tracks initial checkpoint", async function () {
    const { contract, manufacturer } = await deployFixture();

    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const batchId = ethers.id("BATCH-001");

    await contract
      .connect(manufacturer)
      .createBatch(
        batchId,
        "Paracetamol",
        "500mg",
        1000,
        now,
        now + 30 * 24 * 60 * 60,
        "ipfs://batch-001",
        "Plant A",
        "Batch created"
      );

    const batch = await contract.getBatch(batchId);
    expect(batch.drugName).to.equal("Paracetamol");
    expect(batch.quantity).to.equal(1000n);

    const count = await contract.getCheckpointCount(batchId);
    expect(count).to.equal(1n);
  });

  it("runs full flow from manufacturing to dispensed", async function () {
    const { contract, manufacturer, distributor, pharmacy } = await deployFixture();

    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const batchId = ethers.id("BATCH-002");

    await contract
      .connect(manufacturer)
      .createBatch(
        batchId,
        "Amoxicillin",
        "250mg",
        500,
        now,
        now + 45 * 24 * 60 * 60,
        "ipfs://batch-002",
        "Plant B",
        "Initial creation"
      );

    await contract.connect(manufacturer).markManufactured(batchId, "Plant B", "QC passed");
    await contract
      .connect(manufacturer)
      .shipToDistributor(batchId, distributor.address, "Warehouse Gate", "Dispatch to distributor");
    await contract
      .connect(distributor)
      .receiveAtDistributor(batchId, "Distributor Hub", "Shipment received");
    await contract
      .connect(distributor)
      .shipToPharmacy(batchId, pharmacy.address, "Distributor Hub", "Dispatch to pharmacy");
    await contract.connect(pharmacy).receiveAtPharmacy(batchId, "Pharmacy Store", "Stock received");
    await contract.connect(pharmacy).markDispensed(batchId, "Pharmacy Store", "Dispensed to patient");

    const verification = await contract.verifyBatchAuthenticity(batchId);
    expect(verification.exists).to.equal(true);
    expect(verification.isRecalled).to.equal(false);
    expect(verification.currentStatus).to.equal(7n);
    expect(verification.historyEntries).to.equal(7n);
  });

  it("rejects unauthorized actions", async function () {
    const { contract, manufacturer, outsider } = await deployFixture();

    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const batchId = ethers.id("BATCH-003");

    await contract
      .connect(manufacturer)
      .createBatch(
        batchId,
        "Ibuprofen",
        "400mg",
        750,
        now,
        now + 60 * 24 * 60 * 60,
        "ipfs://batch-003",
        "Plant C",
        "Initial creation"
      );

    await expect(
      contract.connect(outsider).markManufactured(batchId, "Plant C", "Bad actor")
    ).to.be.revertedWithCustomError(contract, "Unauthorized");
  });

  it("supports regulator recall and verification flag", async function () {
    const { contract, manufacturer } = await deployFixture();

    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const batchId = ethers.id("BATCH-004");

    await contract
      .connect(manufacturer)
      .createBatch(
        batchId,
        "Cefixime",
        "200mg",
        300,
        now,
        now + 15 * 24 * 60 * 60,
        "ipfs://batch-004",
        "Plant D",
        "Initial creation"
      );

    await contract.recallBatch(batchId, "Regulatory Office", "Contamination notice");

    const verification = await contract.verifyBatchAuthenticity(batchId);
    expect(verification.isRecalled).to.equal(true);
    expect(verification.currentStatus).to.equal(8n);
  });
});
