require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("./tasks");


module.exports = {
  networks: {
    bscTestnet: {
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
    compilers: [
      { version: "0.8.0" },
      { version: "0.8.1" },
      { version: "0.8.4" },
      { version: "0.6.6" },
      { version: "0.5.0" },
      { version: "0.5.16" },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
