const hre = require("hardhat");
const devAddr = "0x2bf977F1D8F6E3bC281CFF257c42A775bE42d7B0"

async function main() {

  const option = [
    {_yin: "0x7B2E46BaE4e23e987fdbf29A60c33cc2bE4D242b"},
    {_devaddr: devAddr},
    {_yinPerBlock : 10},
    {_startBlock: 24882676},
    {_bonusEndBlock: 24883676}
  ]

  // yang : 0xd4ED1CBfd86F67D2A9E03991198cb06eAC8c25B7
  // master : 0xD4074D2A104b016322659b2830566d321163CF88
  // const option = [
    // "0x4710884418FcaA30ECA1DDDd25449A3B35494F96",
    // devAddr,
    // 10,
    // 24882676,
    // 24883676
  // ]


  const MasterChef = await hre.ethers.getContractFactory("MasterChef");
  const masterChef = await MasterChef.deploy(  "0x4710884418FcaA30ECA1DDDd25449A3B35494F96",
  devAddr,
  10,
  24882676,
  24883676);

  await masterChef.deployed();

  console.log(
    `MasterChef deployed to ${masterChef.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
