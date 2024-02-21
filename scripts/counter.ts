import {ethers} from "hardhat";

// put here address of your contract deployed in Mumbai Network
const MUMBAI_CONTRACT_ADDRESS = "0x41CBd451a56E22456a2E27b6aFD14413FF3A6F5a";

async function main() {
  // Construct instance of SampleCrossChainCounter in Mumbai
  const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC);
  const wallet = new ethers.Wallet(process.env.DEPLOYER_KEY!);
  const signer = wallet.connect(provider);

  const contract = await ethers.getContractAt("SampleCrossChainCounter", MUMBAI_CONTRACT_ADDRESS, signer);

  const counterValue = await contract.counter();
  console.log('Counter value in Mumbai: ', counterValue.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
