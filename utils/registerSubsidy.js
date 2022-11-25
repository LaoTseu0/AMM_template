const ethers = require("ethers");
const IRewardRegister = require("../artifacts/contracts/interfaces/IRewardRegister.sol/IRewardRegister.json");

const registerSubsidy = async (contract, deployer) => {
  if (deployer.provider._hardhatProvider._provider._chainId !== 97) return;

  const register = deployer.address;
  const registerContract = new ethers.Contract(register, IRewardRegister.abi, deployer);
//   const appUrl = "https://app.beefy.finance/"
  const appUrl = ""

  const tx = await registerContract.registerContract(contract, deployer.address, appUrl);
  const url = `https://testnet.bscscan.com/tx/${tx.hash}`;
  console.log(`Contract registered for subsidy: ${url}`);
};

module.exports = registerSubsidy;
