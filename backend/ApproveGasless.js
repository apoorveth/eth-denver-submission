const { ethers, Contract } = require("ethers");
require("dotenv").config();
const web3 = require("web3");
const sigUtil = require("@metamask/eth-sig-util");
const {
  DefenderRelayProvider,
  DefenderRelaySigner,
} = require("defender-relay-client/lib/ethers");

const domainType = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "verifyingContract", type: "address" },
  { name: "salt", type: "bytes32" },
];

const metaTransactionType = [
  { name: "nonce", type: "uint256" },
  { name: "from", type: "address" },
  { name: "functionSignature", type: "bytes" },
];

const domainData = {
  name: "Tether USD",
  version: "1",
  verifyingContract: "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
  salt: "0x0000000000000000000000000000000000000000000000000000000000000089",
};

async function main() {
  let abi = require("./abis/demo.json");

  // let provider = new ethers.JsonRpcProvider('<HTTPS RPC URL>');
  // let provider = new ethers.JsonRpcProvider('<HTTPS RPC URL>');

  // let privateKeyRelayer = '<PRIVATE_KEY_RELAYER>';
  // let signerRelayer = new ethers.Wallet(privateKeyRelayer, provider);

  const credentials = {
    apiKey: '4tmttaxCKBF7DWzCcmcowrnzSqcYhfRp',
    apiSecret: '3QtTuodEFyz4xpsBZHw1scXAVPqKDu3zn2oTxBzaKmkexHwSdyJQxRWv2QZZJrTS',
  };

  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, {
    speed: "fast",
  });

  let contractAddress = "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1";
  const contract = new ethers.Contract(contractAddress, abi, signer);

  console.log(contract, 'Contract print');

  // let contract = new Contract(contractAddress, abi, provider);

  let functionSignature = generateFunctionSignature(abi);

  console.log(functionSignature, "Function signature...");

  executeMetaTransaction(functionSignature, contract, domainData);
}

const executeMetaTransaction = async (
  functionSignature,
  contract,
  domainData
) => {
  // Owner's wallet that has to approve gaslessly with signature
  let privateKey = '0xc4e650ca541d4239c4b1cd6c3659e11f394b7d2ab26f051a3c5a5b18b9bcc454';
  let wallet = new ethers.Wallet(privateKey);

  console.log(contract, "Contactt tttres");

  let nonce = await contract.getNonce(wallet.address);
  let userAddress = wallet.address;

  console.log(userAddress, "userAddress in this...");

  let message = {
    nonce: parseInt(nonce),
    from: userAddress,
    functionSignature: functionSignature,
  };

  const dataToSign = {
    types: {
      EIP712Domain: domainType,
      MetaTransaction: metaTransactionType,
    },
    domain: domainData,
    primaryType: "MetaTransaction",
    message: message,
  };

  let signature = sigUtil.signTypedData({
    privateKey: Buffer.from(privateKey.slice(2), "hex"),
    data: dataToSign,
    version: "V4",
    primaryType: "MetaTransaction",
  });
  let { r, s, v } = getSignatureParameters(signature);
  console.log(r,s,v);

  // logging output
//   console.log("Domain Data", domainData);
//   console.log("Message", message);
//   console.log("Sign params", getSignatureParameters(signature));
//   console.log("Signature", signature);

//   const recovered = sigUtil.recoverTypedSignature({
//     data: dataToSign,
//     signature: signature,
//     version: "V4",
//   });
//   console.log(`Recovered ${recovered}`);

  let tx = await contract.executeMetaTransaction(
    userAddress,
    functionSignature,
    r,
    s,
    v,
    {
      gasLimit: 200000,
      gasPrice: ethers.parseUnits("1000", "gwei"),
    }
  );
//   console.log(tx, "Transaction in this");
};

const getSignatureParameters = (signature) => {
  if (!web3.utils.isHexStrict(signature)) {
    throw new Error(
      'Given value "'.concat(signature, '" is not a valid hex string.')
    );
  }
  var r = signature.slice(0, 66);
  var s = "0x".concat(signature.slice(66, 130));
  var v = "0x".concat(signature.slice(130, 132));
  v = web3.utils.hexToNumber(v);
  if (![27, 28].includes(v)) v += 27;
  return {
    r: r,
    s: s,
    v: v,
  };
};

const generateFunctionSignature = (abi) => {
  let iface = new ethers.Interface(abi);
  // Approve amount for spender 1 matic
  return iface.encodeFunctionData("approve", [
    '0x5fFAB508f1a7368b20fb32212103fdD7936330Fa',
    1,
  ]);
};

main();
