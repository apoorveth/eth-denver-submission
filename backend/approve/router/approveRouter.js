const router = require('express').Router();
const approvalController = require('../controllers/approve');

router.get('/get-nonce', async (req, res) => {
    const walletAddress = req.query.wa;
    const contractAddress = req.query.contract;

    console.log(walletAddress, contractAddress, '&&&&& thisishs sishsh');

    const nonce = await approvalController.getNonce(
        walletAddress,
        contractAddress
    );
    return res.json({
        message: 'success',
        nonce,
    });
});

router.post('/send', async (req, res) => {
    console.log('RSV + data params for sending txn', req.body);
    const tx = await approvalController.sendTxn(req.body);
    console.log(tx, 'Transaction from blockchain.....#########');
    res.json({
        message: 'success',
        data: JSON.stringify(tx),
    });
});

router.post('/approve', async (req, res) => {
    const { r, s, v, functionSignature, userAddress, approvalContractAddress } =
        req.body;
    console.log('RSV + data params for Approving txn', req.body);

    const tx = await approvalController.approveTranasaction(
        r,
        s,
        v,
        functionSignature,
        userAddress,
        approvalContractAddress
    );
    console.log(tx, 'Transaction for approval response');

    res.json({
        message: 'success',
        data: JSON.stringify(tx),
    });
});

router.get('/get-gasless-address', async (req, res) => {
    res.json({
        message: 'success',
        address: '0x2A613C61cF21746B17349Acad729A0d8620D942B',
    });
});

router.get('/get-allowance', async (req, res) => {
    const walletAddress = req.query.wa;
    const tokenAddress = req.query.ta;

    console.log({ walletAddress, tokenAddress }, 'Query...');

    const resp = await approvalController.getAllowance(
        tokenAddress,
        walletAddress
    );

    res.json({
        message: 'success',
        allowance: parseInt(resp),
    });
});

router.get('/instructions', (req, res) => {
    res.status(200).send([
        `1. Go to <a href="https://app.uniswap.org/#/swap" target="_blank">Uniswap</a>`,
        '2. Switch to the Polygon network. The beta version only works on Polygon.',
        '3. Choose your "from" and "to" token on Uniswap. Make sure you are swapping at least $0.25 worth of the "from" token or your transaction might fail.',
        '4. Select your from token as the gas token in the option',
        '5. If you are asked to approve the token, click on the button and sign the message on Metamask. This will approve your token for the swap without you needing to pay any MATIC',
        '6. Now click on Swap and confirm. You will need to sign the message on Metamask. Once again, no MATIC will be deducted from your wallet.',
        "7. Congratulations! You've successfully swapped on Uniswap by paying gas fees in an ERC20 token.",
    ]);
});

module.exports = router;
