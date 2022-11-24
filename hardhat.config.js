require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()
require('./tasks')

// const { HardhatUserConfig } = require("hardhat/src/types/config");

/** @type import('hardhat/config').HardhatUserConfig */


// task("node", "Starts a JSON-RPC server on top of Hardhat Network")
//   .setAction(async (taskArgs, hre, runSuper) => {
//     let network = hre.config.networks[taskArgs.fork];
//     if (network && 'url' in network) {
//       console.log(`Forking ${taskArgs.fork} from RPC: ${network.url}`);
//       taskArgs.noReset = true;
//       taskArgs.fork = network.url;
//       if (network.chainId) {
//         hre.config.networks.hardhat.chainId = network.chainId;
//         hre.config.networks.localhost.chainId = network.chainId;
//       }
//     }
//     await runSuper(taskArgs);
//   });

module.exports = {
  networks: {
    testnet: {
      url: process.env.BSC_TESTNET_URL,
      chainId: 97,
      accounts: [process.env.DEPLOYER_PK, process.env.KEEPER_PK],
    },
    bsc: {
      url: process.env.BSC_RPC || "https://rpc.ankr.com/bsc",
      chainId: 56,
      accounts: [process.env.DEPLOYER_PK, process.env.KEEPER_PK],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.API_KEY,
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};
