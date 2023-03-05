const { ethers, Contract } = require('ethers');
const web3 = require('web3')
const sigUtil = require("@metamask/eth-sig-util");
const { DefenderRelaySigner, DefenderRelayProvider } = require('defender-relay-client/lib/ethers');
const abi = require('./abis/USDT.json');
const credentials = { apiKey: "", apiSecret: "" };
const FlintContractAbi = require('./abis/MainMatic.json');


const domainType = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "verifyingContract", type: "address" },
    { name: "salt", type: "bytes32" }
];

const metaTransactionType = [
    { name: "nonce", type: "uint256" },
    { name: "from", type: "address" },
    { name: "functionSignature", type: "bytes" }
];

const domainData = {
    name: "(PoS) Tether USD",
    version: "1",
    verifyingContract: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    salt: "0x0000000000000000000000000000000000000000000000000000000000000089",
};

async function main() {

    // let provider = new ethers.JsonRpcProvider('https://rpc-mainnet.maticvigil.com/v1/07dd2bc161d12dd58aedb7d215054996d540c4b0');
    // let provider = new ethers.JsonRpcProvider('https://thrilling-greatest-mansion.matic.discover.quiknode.pro/548cad00b00a5d861e033495255165a017febce0/');

    // let privateKeyRelayer = '';
    // let signerRelayer = new ethers.Wallet(privateKeyRelayer, provider);

    let functionSignature = generateFunctionSignature(abi);
    executeMetaTransaction(functionSignature, domainData);

}

const executeMetaTransaction = async (
    functionSignature,
    domainData
) => {
    // const provider = new DefenderRelayProvider(credentials);
    // const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });

    let privateKeyRelayer = '';
    let provider = new ethers.JsonRpcProvider('https://rpc-mainnet.maticvigil.com/v1/07dd2bc161d12dd58aedb7d215054996d540c4b0');
    let signer = new ethers.Wallet(privateKeyRelayer, provider);

    let contractAddress = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
    let usdtContract = new Contract(contractAddress, abi, signer);


    let privateKey = '';
    let wallet = new ethers.Wallet(privateKey);

    let nonce = await usdtContract.getNonce(wallet.address);
    let userAddress = wallet.address;

    let message = {
        nonce: parseInt(nonce),
        from: userAddress,
        functionSignature: functionSignature
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
        version: "V4"
    })
    let { r, s, v } = getSignatureParameters(signature);

    // logging output
    console.log("Domain Data", domainData);
    console.log("Message", message);
    console.log("Sign params", getSignatureParameters(signature));
    console.log("Signature", signature);
    console.log("***********************");
    console.log("Data to sign", dataToSign);


    const recovered = sigUtil.recoverTypedSignature({
        data: dataToSign,
        signature: signature,
        version: "V4"
    });
    console.log(`Recovered ${recovered}`);

    let flintContractAddress = '0x8E001FEB0B1971C465204098997634791Cbe7E24';
    let flintContract = new Contract(flintContractAddress, FlintContractAbi, signer);


    console.log(wallet.address);
    let tx = await flintContract.swapWithoutFeesSingle(
        300000,
        "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        wallet.address,
        functionSignature,
        r,
        s,
        v,
        {
            gasPrice: ethers.parseUnits('540', 'gwei')
        }
    );
    console.log("Transaction has been sent - ", tx);
    const mined = await tx.wait();
    console.log("Transaction has been mined", mined);
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
    return iface.encodeFunctionData("approve", ["0x8E001FEB0B1971C465204098997634791Cbe7E24", ethers.parseEther('1000')]);
}

main();