let abi = require('../../abis/USDT.json');
const Promise = require('bluebird');
const { ethers, Contract } = require('ethers');
const config = require('../../config');
const {
    DefenderRelaySigner,
    DefenderRelayProvider,
} = require('defender-relay-client/lib/ethers');

const FlintContractAbi = require('../../abis/FlintContract.json');
const FlintContractAbiOld = require('../../abis/FlintContractOld.json');
let flintContractAddress = config.GASLESS_CONTRACT_ADDRESS;

const getNonce = async (walletAddress, contractAddress) => {
    try {
        console.log(walletAddress, contractAddress, 'Nicnenccec $$$$');
        const credentials = {
            apiKey: config.OPEN_ZEPPELIN_API_KEY,
            apiSecret: config.OPEN_ZEPPELIN_API_SECRET,
        };
        const provider = new DefenderRelayProvider(credentials);
        const signer = new DefenderRelaySigner(credentials, provider, {
            speed: 'fast',
        });

        // let contractAddress = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
        const contract = new ethers.Contract(contractAddress, abi, signer);

        let nonce = await contract.getNonce(walletAddress);

        console.log(parseInt(nonce), 'Nocne');

        return Promise.resolve(parseInt(nonce));
    } catch (error) {
        return Promise.reject(error);
    }
};

const getAllowance = async (tokenAddress, walletAddress) => {
    try {
        console.log(walletAddress, tokenAddress, 'getAllowance $$$$');
        const owner = walletAddress,
            spender = flintContractAddress;
        const credentials = {
            apiKey: config.OPEN_ZEPPELIN_API_KEY,
            apiSecret: config.OPEN_ZEPPELIN_API_SECRET,
        };

        const provider = new DefenderRelayProvider(credentials);
        const signer = new DefenderRelaySigner(credentials, provider, {
            speed: 'fast',
        });

        // let contractAddress = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
        const contract = new ethers.Contract(tokenAddress, abi, provider);

        let allowance = await contract.allowance(owner, spender);

        console.log(parseInt(allowance), 'Allowance for user');

        return Promise.resolve(parseInt(allowance));
    } catch (error) {
        return Promise.reject(error);
    }
};

const sendTxn = async ({
    amountIn,
    tokenIn,
    tokenOut,
    userAddress,
    path,
    fees,
    nonce,
    isTokenOutMatic,
    r,
    s,
    v,
}) => {
    try {
        console.log('INSIDE THE SEND TXN FUNCTION!');
        const credentials = {
            apiKey: config.OPEN_ZEPPELIN_API_KEY,
            apiSecret: config.OPEN_ZEPPELIN_API_SECRET,
        };
        const provider = new DefenderRelayProvider(credentials);
        const signer = new DefenderRelaySigner(credentials, provider, {
            speed: 'average',
        });

        console.log('THIS IS THE FLINT ADDRESS - ', flintContractAddress);
        let flintContractAbi;
        if (isTokenOutMatic != undefined) {
            flintContractAddress = config.GASLESS_CONTRACT_ADDRESS;
            flintContractAbi = FlintContractAbi;
        } else {
            flintContractAddress = config.GASLESS_CONTRACT_ADDRESS_OLD;
            flintContractAbi = FlintContractAbiOld;
        }
        let flintContract = new Contract(
            flintContractAddress,
            flintContractAbi,
            signer
        );

        let params = {
            amountIn: parseInt(amountIn),
            tokenIn,
            tokenOut,
            userAddress,
            path,
            fees,
            nonce: parseInt(nonce),
            isTokenOutMatic,
            r,
            s,
            v,
        };

        console.log('THESE ARE THE PARAMS - ', params);
        // console.log(wallet.address);
        let tx;
        if (isTokenOutMatic != undefined) {
            tx = await flintContract.swapWithoutFees(
                amountIn,
                tokenIn,
                tokenOut,
                userAddress,
                path,
                fees,
                parseInt(nonce),
                isTokenOutMatic,
                r,
                s,
                v,
                {
                    gasLimit: 1000000,
                    maxFeePerGas: ethers.parseUnits('1000', 'gwei'),
                }
            );
        } else {
            tx = await flintContract.swapWithoutFees(
                amountIn,
                tokenIn,
                tokenOut,
                userAddress,
                path,
                fees,
                parseInt(nonce),
                r,
                s,
                v,
                {
                    gasLimit: 1000000,
                    maxFeePerGas: ethers.parseUnits('1000', 'gwei'),
                }
            );
        }

        console.log('THIS IS THE TX - ', tx);

        return Promise.resolve(tx);
    } catch (error) {
        console.error('SEND TX FAILED - ', error);
        // return Promise.reject(error);
    }
};

const approveTranasaction = async (
    r,
    s,
    v,
    functionSignature,
    userAddress,
    approvalContractAddress
) => {
    try {
        const credentials = {
            apiKey: config.OPEN_ZEPPELIN_API_KEY,
            apiSecret: config.OPEN_ZEPPELIN_API_SECRET,
        };
        const provider = new DefenderRelayProvider(credentials);
        const signer = new DefenderRelaySigner(credentials, provider, {
            speed: 'average',
        });

        const contractInstance = new Contract(
            approvalContractAddress,
            abi,
            signer
        );

        let tx = await contractInstance.executeMetaTransaction(
            userAddress,
            functionSignature,
            r,
            s,
            v
        );

        return Promise.resolve(tx);
    } catch (error) {
        console.log('APPROVAL FAILED - ', error);
        // return Promise.reject(error);
    }
};

module.exports = { getNonce, sendTxn, approveTranasaction, getAllowance };
