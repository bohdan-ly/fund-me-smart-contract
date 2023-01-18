const { deployments, ethers, getNamedAccounts, network } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("Funding Contract...");
  const transactionRes = await fundMe.fund({
    value: ethers.utils.parseEther("0.1"),
  });
  await transactionRes.wait(1);
  console.log("Funded!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
