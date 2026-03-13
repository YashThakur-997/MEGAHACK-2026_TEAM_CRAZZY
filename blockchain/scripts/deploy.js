async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with account:", deployer.address);

  const Factory = await ethers.getContractFactory("PharmaSupplyChainVerification");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("PharmaSupplyChainVerification deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
