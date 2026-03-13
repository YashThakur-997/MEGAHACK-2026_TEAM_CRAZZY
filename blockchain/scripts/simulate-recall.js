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
  console.log("Contract:", await contract.getAddress());

  console.log("\n--- Assigning actor roles ---");
  await (await contract.assignActorRole(manufacturer.address, Role.Manufacturer)).wait();
  await (await contract.assignActorRole(distributor.address, Role.Distributor)).wait();
  await (await contract.assignActorRole(pharmacy.address, Role.Pharmacy)).wait();

  const now = Number((await ethers.provider.getBlock("latest")).timestamp);
  const batchId = ethers.id("DEMO-BATCH-2026-RECALL-001");

  console.log("\n--- Running pre-recall flow ---");
  await (
    await contract
      .connect(manufacturer)
      .createBatch(
        batchId,
        "Amoxicillin",
        "250mg",
        800,
        now,
        now + 120 * 24 * 60 * 60,
        "ipfs://demo-batch-2026-recall-001",
        "Plant B",
        "Initial batch registration"
      )
  ).wait();

  await (
    await contract.connect(manufacturer).markManufactured(batchId, "Plant B", "QC passed")
  ).wait();

  await (
    await contract
      .connect(manufacturer)
      .shipToDistributor(batchId, distributor.address, "Plant B Dispatch", "Sealed and shipped")
  ).wait();

  await (
    await contract
      .connect(distributor)
      .receiveAtDistributor(batchId, "Regional Hub", "Received and scanned")
  ).wait();

  console.log("\n--- Regulator recall ---");
  await (
    await contract
      .connect(regulator)
      .recallBatch(batchId, "Regulatory Office", "Contamination alert from sample testing")
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

  console.log("\nRecall simulation complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
