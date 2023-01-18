const networkConfig = {
  5: {
    name: "goerli",
    ethPriceFeed: "0x57241A37733983F97C4Ab06448F244A1E0Ca0ba8",
  },
  137: {
    name: "polygon",
    ethPriceFeed: "0x0ded608AFc23724f614B76955bbd9dFe7dDdc828",
  },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
};
