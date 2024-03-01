import { ethers as ethersHardhat } from "hardhat";
import { ethers } from "@swisstronik/ethers";
async function main() {
  // Construct instance of SampleCrossChainCounter in Swisstronik
  const provider = new ethers.providers.JsonRpcProvider(process.env.SWISSTRONIK_RPC);
  const wallet = new ethers.Wallet(process.env.DEPLOYER_KEY!);
  const signer = wallet.connect(provider);

  const contract = await ethersHardhat.getContractAt("SampleCrossChainCounter",  process.env.SWISSTRONIK_CONTRACT_ADDRESS!, signer as any);

  const counterValue = await contract.counter();
  console.log('Counter value in Swisstronik: ', counterValue.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
