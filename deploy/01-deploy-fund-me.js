const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsdPriceFeedAddress;

  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethPriceFeed"];
  }

  const args = [
    /* address */
    ethUsdPriceFeedAddress,
  ];

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args,
    log: true,
    waitConformations: network.config.blockConformations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // verify
    await verify(fundMe.address, args);
  }
  log("----------------------------------------");
};

module.exports.tags = ["all", "fundMe"];
