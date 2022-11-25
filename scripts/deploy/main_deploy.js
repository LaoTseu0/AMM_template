const registerSubsidy = require("../../utils/registerSubsidy");
const hre = require("hardhat");

const devAddr = "0x2bf977F1D8F6E3bC281CFF257c42A775bE42d7B0";

async function main() {
  const [deployer] = await ethers.getSigners();

  const Yin = await hre.ethers.getContractFactory("YinToken");
  const yin = await Yin.deploy();

  await yin.deployed();

  console.log(`YinToken deployed to ${yin.address}`);

  const Yang = await hre.ethers.getContractFactory("YangToken");
  const yang = await Yang.deploy();

  await yang.deployed();

  console.log(`Yang deployed to ${yang.address}`);

  const MasterChef = await hre.ethers.getContractFactory("MasterChef");
  const masterChef = await MasterChef.deploy(
    yin.address,
    devAddr,
    "1000000000000000000000",
    24884097,
    25889676
  );

  await masterChef.deployed();

  console.log(`MasterChef deployed to ${masterChef.address}`);

  await registerSubsidy(yin.address, deployer);
  await registerSubsidy(yang.address, deployer);
  await registerSubsidy(masterChef.address, deployer);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
