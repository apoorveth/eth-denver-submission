const axios = require('axios');
const contract_address = "0x7FFB3d637014488b63fb9858E279385685AFc1e2";
const fs = require('fs')

const callback = (resp) => {
  console.log(resp, 'resp');
}


// Get ABI for any contract
async function getAbiForContract(contractAddress) {
  try {
    const abiResp = await axios.get(`https://api.polygonscan.com/api?module=contract&action=getabi&address=${contractAddress}`);
    const abi = JSON.parse(abiResp.data.result);
    await fs.writeFileSync('./abis/USDT.json', JSON.stringify(abi), callback);
  } catch (error) {
   console.log(error, 'error in getAbi'); 
  }
}

getAbiForContract(contract_address);