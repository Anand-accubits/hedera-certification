// TASK: send 25.25 tokens to each of Accounts3 and Account4.

const {
    Client,
    TokenCreateTransaction,
    AccountBalanceQuery,
    TokenType,
    TokenSupplyType,
    PrivateKey,
    Wallet,
    TokenAssociateTransaction,
    TransferTransaction
} = require('@hashgraph/sdk');
require('dotenv').config();

// Grab private key and account id for Account 1
const acc1AccountId = process.env.ACCOUNT_ID_1;
const acc1PrivateKey = PrivateKey.fromString(process.env.PRIVATE_KEY_1);


// Throw error if the private key and account id's are null 
if (acc1AccountId == null || acc1PrivateKey == null) {
    throw new Error("Environment variables AccountId and PrivateKey of Account1 must be present");
}

// Grab private key and account id for Account 3
const acc3AccountId = process.env.ACCOUNT_ID_3;
const acc3PrivateKey = PrivateKey.fromString(process.env.PRIVATE_KEY_3);

// Throw error if the private key and account id's are null 
if (acc3AccountId == null || acc3PrivateKey == null) {
    throw new Error("Environment variables AccountId and PrivateKey of Account3 must be present");
}

// Grab private key and account id for Account 4
const acc4AccountId = process.env.ACCOUNT_ID_4;
const acc4PrivateKey = PrivateKey.fromString(process.env.PRIVATE_KEY_4);

// Throw error if the private key and account id's are null 
if (acc4AccountId == null || acc4PrivateKey == null) {
    throw new Error("Environment variables AccountId and PrivateKey of Account4 must be present");
}

const tokenId = process.env.TOKEN_ID;

// Create connection to Hedera
const client = Client.forTestnet();
client.setOperator(acc1AccountId, acc1PrivateKey);

// Create Admin Wallet
const adminUser = new Wallet(
    acc1AccountId,
    acc1PrivateKey
)

const acc3Wallet = new Wallet(
    acc3AccountId,
    acc3PrivateKey
);
const acc4wallet = new Wallet(
    acc4AccountId,
    acc4PrivateKey
);

async function main() {

    //  Associate Account3 and Account4 with token
    await tokenAssociateTx(acc3Wallet, acc3PrivateKey);
    await tokenAssociateTx(acc4wallet, acc4PrivateKey);

    //Create the transfer transaction
    const transaction = await new TransferTransaction()
        .addTokenTransfer(tokenId, client.operatorAccountId, -50.50)
        .addTokenTransfer(tokenId, acc3Wallet.accountId, 25.25)
        .addTokenTransfer(tokenId, acc4wallet.accountId, 25.25)
        .freezeWith(client);

    //Sign with the sender account private key
    const signTx = await transaction.sign(acc1PrivateKey);

    //Sign with the client operator private key and submit to a Hedera network
    const txResponse = await signTx.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Obtain the transaction consensus status
    const transactionStatus = receipt.status;

    console.log("The transaction consensus status " + transactionStatus.toString());

    const acc3balance = await getTokenBalance(acc3AccountId);
    console.log("The balance of the Account3 is: " + acc3balance);

    const acc4balance = await getTokenBalance(acc4AccountId);
    console.log("The balance of the Account4 is: " + acc4balance);

    process.exit();
}

/**
 * 
 * @param {object} wallet 
 * @param {object} otherPrivateKey 
 */
async function tokenAssociateTx(wallet, otherPrivateKey) {
    let associateOtherWalletTx = await new TokenAssociateTransaction()
        .setAccountId(wallet.accountId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(otherPrivateKey)

    //SUBMIT THE TRANSACTION
    let associateOtherWalletTxSubmit = await associateOtherWalletTx.execute(client);

    //GET THE RECEIPT OF THE TRANSACTION
    let associateOtherWalletRx = await associateOtherWalletTxSubmit.getReceipt(client);

    //LOG THE TRANSACTION STATUS
    console.log(`- Token association with the users account: ${associateOtherWalletRx.status} \n`);

}

/**
 * This function is to get token Balance
 * @param {string} accountId 
 * @returns 
 */
async function getTokenBalance(accountId) {
    const balanceCheckTx = await new AccountBalanceQuery().setAccountId(accountId).execute(client);
    const tokenBalance = balanceCheckTx.tokens._map.get(tokenId.toString());
    return tokenBalance;
}

main().catch(err => {
    console.log(err);
    process.exit();
})