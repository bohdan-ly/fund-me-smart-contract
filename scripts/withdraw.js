const { deployments, ethers, getNamedAccounts, network } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("Funding...");
  const transactionRes = await fundMe.withdraw();
  await transactionRes.wait(1);
  console.log("Got it back!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
