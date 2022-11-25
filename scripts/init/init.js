const hre = require("hardhat");
const ethers = require("ethers")
const Web3 = require("web3");
const { Web3Provider } = require("@ethersproject/providers");
// const web3 =require("@nomiclabs/hardhat-web3")
const yin_abi = require('../../artifacts/contracts/YinToken.sol/YinToken.json').abi
const yang_abi = require('../../artifacts/contracts/YangToken.sol/YangToken.json').abi
const master_abi = require('../../artifacts/contracts/MasterChef.sol/MasterChef.json').abi
const yin_addr = "0xc5370C7CC0Bc584bcE08295d2795FF8F43d99CD0"
const yang_addr = "0x8e881aF0FBA89054A69025f599d03232f86F7033"
const master_addr = "0x90f212c1e26CD575571906B8c13638d0eeB2Bcc7"
// const { Web3 } = require("hardhat")
const devAddr = "0x2bf977F1D8F6E3bC281CFF257c42A775bE42d7B0"


async function main() {
    const web3 = new Web3(hre.network.provider)
    // const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545')
    
    const contract_yin =  new web3.eth.Contract(yin_abi, yin_addr)
    const contract_yang =  new web3.eth.Contract(yang_abi, yang_addr)
    const contract_master =  new web3.eth.Contract(master_abi, master_addr)

    // await contract_yin.methods.mint(devAddr, "1000000000000000000").send({from : devAddr}).then((e) => console.log(e))
    await contract_yin.methods.approve(master_addr, "100000000000000000000000").send({from : devAddr}).then((e) => console.log(e))
    // await contract_yin.methods.transfer(master_addr, "1000000000000").send({from : devAddr}).then((e) => console.log(e))
    // await contract_yin.methods.transferOwnership(master_addr).send({from : devAddr}).then((e) => console.log(e))


    // await contract_yang.methods.mint(devAddr, "100000000000000000000").send({from : devAddr}).then((e) => console.log(e))
     await contract_yang.methods.mint(devAddr, "1000000000000000000").send({from : devAddr}).then((e) => console.log(e))
    await contract_yang.methods.approve(master_addr, "100000000000000000000000").send({from : devAddr}).then((e) => console.log(e))


    // await contract_master.methods.add(100, yin_addr, true).send({from : devAddr}).then((e) => console.log(e))

    await contract_master.methods.deposit(0, "100000000000000").send({from : devAddr}).then((e) => console.log(e))

    // await contract_master.methods.deposit(0, "100000000000000").estimateGas({from : devAddr}).then((e) => console.log(e))
    // await contract_master.methods.poolInfo(0).call().then((e) => console.log(e))


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
