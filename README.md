# Gasly

Gasly is a chrome extension which allows users to pay gas in any token of there choice. This means you can do transaction without holding the native token of the blockchain. While the idea is to make this work on all types of transactions, currently we have implemented the solution on top of Uniswap for the Polygon network. This means, you can swap any two tokens on Uniswap without holding MATIC.

## How does this work?

1. We have created a wrapper contract on top of Uniswap. 
2. Using the `executeMetaTransaction` or `permit` function we take approval from the user to use his ERC20 token. This approval only requires a signature from the user and we pay the MATIC needed by relaying the transaction.
3. After getting the approval, we ask the user to select the coins and amount for his swap.
4. Once selected, we make the user sign the details of the transaction and then relay this signature to our smart contract.
5. Our smart contract then
    - verifies if the signature is correct
    - moves funds from the user's address to the smart contract address
    - keeps a small amount of the fund as fees
    - swaps the remaining amount on uniswap
    - sends the output token back to the user
6. So at the end, using just two signatures (the approval signature is only for the first time) a user was able to swap a token on Uniswap where he paid fees in the "from" token

The deployed contract can be found here - [Polygonscan](https://polygonscan.com/address/0x1EFE2DceF174E3c96D4B1648BDe72F90Ffa54D83)

## Why Polygon?

There are multiple reasons why we chose to build this on the Polygon network

1. The most important reason was gasless approvals. Most of the ERC20 tokens on Polygon have either a `executeMetaTransaction` function or a `permit` function. This allows to users to approve ERC20 token usage with just a signature. This is not true for Ethereum and a lot of other blockchains.
2. To get token approvals, we ask users to sign a message and we relay that message on chain onb their behalf. As the gas fees on Polygon is really low, we don't lose significant amount of money when doing this.
3. Polygon supports a lot of ERC20 tokens giving our users maximum exposure and usability.

