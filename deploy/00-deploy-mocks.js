const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const networkName = network.name || 1337;

  if (developmentChains.includes(`${networkName}`)) {
    log("Local network detected. Deploying mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    });
    log("Mocks deployed");
    log("------------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
