import {ethers} from "hardhat";
import {encryptDataField, decryptNodeResponse} from "@swisstronik/swisstronik.js";

// put here address of your contract deployed in Mumbai Network
const SWISSTRONIK_CONTRACT_ADDRESS = "0x58f34fD3E37E98382e3A119C9357181EA06A8688";

async function main() {
  // Construct instance of SampleCrossChainCounter in Swisstronik
  const provider = new ethers.JsonRpcProvider(process.env.SWISSTRONIK_RPC);
  const wallet = new ethers.Wallet(process.env.DEPLOYER_KEY!);
  const signer = wallet.connect(provider);

  const contract = await ethers.getContractAt("SampleCrossChainCounter", SWISSTRONIK_CONTRACT_ADDRESS);

  // Obtain value of counter
  const encodedCounterCall = contract.interface.encodeFunctionData("counter");
  const resBefore = await sendShieldedQuery(provider, SWISSTRONIK_CONTRACT_ADDRESS, encodedCounterCall);
  const counterValue = contract.interface.decodeFunctionResult("counter", resBefore)[0];
  console.log('Counter value in Swisstronik: ', counterValue.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const sendShieldedQuery = async (
  provider: any,
  destination: any,
  data: any
) => {
  const rpclink = process.env.SWISSTRONIK_RPC;

  // Encrypt the call data using the SwisstronikJS function encryptDataField()
  const [encryptedData, usedEncryptedKey] = await encryptDataField(rpclink!, data);

  // Execute the call/query using the provider
  const response = await provider.call({
    to: destination,
    data: encryptedData,
  });

  // Decrypt the call result using SwisstronikJS function decryptNodeResponse()
  return await decryptNodeResponse(rpclink!, response, usedEncryptedKey);
};
