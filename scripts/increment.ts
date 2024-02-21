import {ethers} from "hardhat";
import {encryptDataField, decryptNodeResponse} from "@swisstronik/swisstronik.js";

// Put address of SampleCrossChainCounter deployed in Swisstronik
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
  const counterBefore = contract.interface.decodeFunctionResult("counter", resBefore)[0];

  // Send transaction with call of `increment` function
  const encodedIncrementData = contract.interface.encodeFunctionData("incrementCounter");
  const tx = await sendShieldedTransaction(
    signer,
    SWISSTRONIK_CONTRACT_ADDRESS,
    encodedIncrementData,
    1
  );
  await tx.wait();

  // Obtain updated counter value
  const resAfter = await sendShieldedQuery(provider, SWISSTRONIK_CONTRACT_ADDRESS, encodedCounterCall);
  const counterAfter = contract.interface.decodeFunctionResult("counter", resAfter)[0];

  console.log(`Counter at Swisstronik was updated ${counterBefore} -> ${counterAfter}`);
}

const sendShieldedTransaction = async (
  signer: any,
  destination: string,
  data: string,
  value: number
) => {
  const rpclink = process.env.SWISSTRONIK_RPC;

  // Encrypt transaction data
  const [encryptedData] = await encryptDataField(rpclink!, data);

  // Construct and sign transaction with encrypted data
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
