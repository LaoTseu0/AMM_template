const hre = require("hardhat");
const ethers = require("ethers")
const Web3 = require("web3");
const { Web3Provider } = require("@ethersproject/providers");
// const web3 =require("@nomiclabs/hardhat-web3")
const yin_abi = require('../../artifacts/contracts/YinToken.sol/YinToken.json').abi
const yang_abi = require('../../artifacts/contracts/YangToken.sol/YangToken.json').abi
const master_abi = require('../../artifacts/contracts/MasterChefV2.sol/MasterChefV2.json').abi
// const yin_addr = "0xe7e3B5BCb2B6FE4551Bd888c41603024E5914Ebb"
// const yang_addr = "0x9FD7Fa4C0EcDe0805525BD5826920A952B76e5F3"
const master_addr = "0x911c251d9CE3C6B2FA5285252A721308F985a612"
// const { Web3 } = require("hardhat")
const devAddr = "0x2bf977F1D8F6E3bC281CFF257c42A775bE42d7B0"
// const devAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"


async function init(
  // yin_addr,yang_addr,master_addr, devAddr
  ) {
    const web3 = new Web3(hre.network.provider)
    // const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545')
    
    // const contract_yin =  new web3.eth.Contract(yin_abi, yin_addr)
    // const contract_yang =  new web3.eth.Contract(yang_abi, yang_addr)
    const contract_master =  new web3.eth.Contract(master_abi, master_addr)

    // await contract_yin.methods.mint(devAddr, "1000000000000000000").send({from : devAddr}).then((e) => console.log(e))
    // await contract_yin.methods.approve(master_addr, "100000000000000000000000").send({from : devAddr}).then((e) => console.log(e))
    
    // await contract_yin.methods.transferOwnership(master_addr).send({from : devAddr}).then((e) => console.log(e))


    
    //  await contract_yang.methods.mint(devAddr, "1000000000000000000").send({from : devAddr}).then((e) => console.log(e))
    // await contract_yang.methods.approve(master_addr, "100000000000000000000000").send({from : devAddr}).then((e) => console.log(e))


    // await contract_master.methods.add(50, yin_addr,0, true).send({from : devAddr}).then((e) => console.log(e))

    await contract_master.methods.deposit(0, "1000000000000000000").send({from : devAddr}).then((e) => console.log(e))

    // await contract_master.methods.deposit(0, "100000000000000").estimateGas({from : devAddr}).then((e) => console.log(e))
    // await contract_master.methods.poolInfo(0).call().then((e) => console.log(e))


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
init().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
