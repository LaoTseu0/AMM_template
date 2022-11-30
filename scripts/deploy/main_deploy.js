const registerSubsidy = require("../../utils/registerSubsidy");
const hre = require("hardhat");
const { init } = require("../init/init");

const devAddr = "0x2bf977F1D8F6E3bC281CFF257c42A775bE42d7B0";
// const devAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

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

  const MasterChef = await hre.ethers.getContractFactory("MasterChefV2");
  const masterChef = await MasterChef.deploy(
    yin.address,
    devAddr,
    devAddr,
    "1000000000000000000000",
    24884097
  );

  await masterChef.deployed();

  console.log(`MasterChef deployed to ${masterChef.address}`);

  await registerSubsidy(yin.address, deployer);
  await registerSubsidy(yang.address, deployer);
  await registerSubsidy(masterChef.address, deployer);

  await init(yin.address, yang.address, masterChef.address, devAddr)
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
