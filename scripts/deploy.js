const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const feePercent = 1; // Marketplace fee = 1%

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`🛠 Deploying contracts with account: ${deployer.address}`);

  // Deploy NFT contract
  const NFT = await hre.ethers.deployContract("NFT");
  await NFT.waitForDeployment();
  console.log(`✅ NFT deployed to: ${NFT.target}`);

  // Deploy Marketplace contract
  const Marketplace = await hre.ethers.deployContract("Marketplace", [feePercent]);
  await Marketplace.waitForDeployment();
  console.log(`✅ Marketplace deployed to: ${Marketplace.target}`);

  // Write contract addresses to frontend
  const addresses = {
    nft: NFT.target,
    marketplace: Marketplace.target,
  };

  const frontendPath = path.join(__dirname, "..", "src");

  // Ensure src/ folder exists
  if (!fs.existsSync(frontendPath)) {
    fs.mkdirSync(frontendPath);
  }

  fs.writeFileSync(
    path.join(frontendPath, "contract-addresses.json"),
    JSON.stringify(addresses, null, 2)
  );
  console.log("📄 Wrote contract-addresses.json to /src");

  // Copy ABIs to frontend
  fs.copyFileSync(
    path.join(__dirname, "..", "artifacts/contracts/NFT.sol/NFT.json"),
    path.join(frontendPath, "NFT.json")
  );

  fs.copyFileSync(
    path.join(__dirname, "..", "artifacts/contracts/Marketplace.sol/Marketplace.json"),
    path.join(frontendPath, "Marketplace.json")
  );

  console.log("📦 Copied ABIs to /src");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
