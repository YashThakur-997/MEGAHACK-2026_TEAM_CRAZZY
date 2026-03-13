async function main() {
  const [regulator, manufacturer, distributor, pharmacy] = await ethers.getSigners();

  const Role = {
    Manufacturer: 1,
    Distributor: 2,
    Pharmacy: 3
  };

  const Status = {
    None: 0,
    Created: 1,
    Manufactured: 2,
    InTransitToDistributor: 3,
    AtDistributor: 4,
    InTransitToPharmacy: 5,
    AtPharmacy: 6,
    Dispensed: 7,
    Recalled: 8
  };

  const statusName = Object.fromEntries(Object.entries(Status).map(([k, v]) => [v, k]));

  console.log("--- Deploying PharmaSupplyChainVerification ---");
  const Factory = await ethers.getContractFactory("PharmaSupplyChainVerification", regulator);
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log("Contract:", contractAddress);

  console.log("\n--- Assigning actor roles ---");
  await (await contract.assignActorRole(manufacturer.address, Role.Manufacturer)).wait();
  await (await contract.assignActorRole(distributor.address, Role.Distributor)).wait();
  await (await contract.assignActorRole(pharmacy.address, Role.Pharmacy)).wait();

  const block = await ethers.provider.getBlock("latest");
  const now = Number(block.timestamp);
  const batchId = ethers.id("DEMO-BATCH-2026-001");

  console.log("\n--- Running full supply-chain flow ---");
  await (
    await contract
      .connect(manufacturer)
      .createBatch(
        batchId,
        "Paracetamol",
        "500mg",
        1200,
        now,
        now + 90 * 24 * 60 * 60,
        "ipfs://demo-batch-2026-001",
        "Plant A",
        "Initial batch registration"
      )
  ).wait();

  await (
    await contract.connect(manufacturer).markManufactured(batchId, "Plant A", "QC passed")
  ).wait();

  await (
    await contract
      .connect(manufacturer)
      .shipToDistributor(batchId, distributor.address, "Plant A Dispatch", "Sealed and shipped")
  ).wait();

  await (
    await contract
      .connect(distributor)
      .receiveAtDistributor(batchId, "Distributor Hub", "Received in good condition")
  ).wait();

  await (
    await contract
      .connect(distributor)
      .shipToPharmacy(batchId, pharmacy.address, "Distributor Hub", "Routed to pharmacy")
  ).wait();

  await (
    await contract
      .connect(pharmacy)
      .receiveAtPharmacy(batchId, "City Pharmacy", "Stock checked and accepted")
  ).wait();

  await (
    await contract
      .connect(pharmacy)
      .markDispensed(batchId, "City Pharmacy", "Dispensed to verified patient")
  ).wait();

  console.log("\n--- Verification ---");
  const verification = await contract.verifyBatchAuthenticity(batchId);
  console.log("Exists:", verification.exists);
  console.log("Expired:", verification.isExpired);
  console.log("Recalled:", verification.isRecalled);
  console.log("Current status:", statusName[Number(verification.currentStatus)]);
  console.log("History entries:", Number(verification.historyEntries));

  console.log("\n--- Checkpoint history ---");
  const count = Number(await contract.getCheckpointCount(batchId));
  for (let i = 0; i < count; i += 1) {
    const cp = await contract.getCheckpoint(batchId, i);
    const line = [
      `#${i + 1}`,
      statusName[Number(cp.status)],
      `actor=${cp.actor}`,
      `time=${new Date(Number(cp.timestamp) * 1000).toISOString()}`,
      `location=${cp.location}`,
      `notes=${cp.notes}`
    ].join(" | ");

    console.log(line);
  }

  console.log("\nSimulation complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
