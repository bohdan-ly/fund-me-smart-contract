const { expect, assert } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");

const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1");

      beforeEach(async function () {
        // deploy our fundMe contract
        // using hardhat-deploy
        // const accounts = await ethers.getSigner();
        // const accZero = accounts[0];

        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", async function () {
        it("sets the aggregator address correctly", async function () {
          const response = await fundMe.getPriceFeed();
          //   await expect(mockAddress).to.equal(mockV3Aggregator.address);
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", async function () {
        it("Drop an error if not enough ETH was funded", async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
        });

        it("Updated the amount funded data structure", async function () {
          await fundMe.fund({ value: sendValue });
          const res = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(res.toString(), sendValue.toString());
        });

        it("Adds funder to array of funders", async function () {
          await fundMe.fund({ value: sendValue });
          const res = await fundMe.getFunder(0);
          assert.equal(res, deployer);
        });
      });

      describe("withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue });
        });

        it("Withdraw ETH from a single founder", async function () {
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // Act
          const transactionRes = await fundMe.withdraw();
          const transactionRecipient = await transactionRes.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionRecipient;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // Assert

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("allows us to withdraw with multiple funders", async function () {
          const accounts = await ethers.getSigners();

          // i = 1, because 0 - idx of deployer account
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act
          const transactionRes = await fundMe.withdraw();
          const transactionRecipient = await transactionRes.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionRecipient;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // Assert

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
          // Make sure that the
          await expect(fundMe.getFunder(0)).to.be.reverted;
          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("only allows the owner to withdraw", async () => {
          const accounts = await ethers.getSigners();
          const attackerConnectedContract = await fundMe.connect(accounts[1]);
          // console.log(await attackerConnectedContract.withdraw());

          await expect(
            attackerConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(
            attackerConnectedContract,
            "FundMe__NotOwner"
          );
        });
      });
    });
