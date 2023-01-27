const {
    Client,
    TokenCreateTransaction,
    AccountBalanceQuery,
    TokenType,
    TokenSupplyType,
    PrivateKey,
    TransferTransaction,
    ScheduleCreateTransaction
} = require('@hashgraph/sdk');
require('dotenv').config();

// Grab private key and account id
const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
const myAccountId = process.env.MY_ACCOUNT_ID;

// Throw error if the private key and account id's are null 
if (myAccountId == null || myPrivateKey == null) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

// Grab private key and account id for Account 1
const acc1AccountId = process.env.ACCOUNT_ID_1;
const acc1PrivateKey = PrivateKey.fromString(process.env.PRIVATE_KEY_1);


// Throw error if the private key and account id's are null 
if (acc1AccountId == null || acc1PrivateKey == null) {
    throw new Error("Environment variables AccountId and PrivateKey of Account1 must be present");
}

// Grab base64 data
const scheduleTxBase64 = process.env.SCHEDULED_TX_BASE64

// Create connection to Hedera
const client = Client.forTestnet();
client.setOperator(acc1AccountId, acc1PrivateKey);

async function main() {

    // convert from base64
    let deserializedData = Buffer.from(scheduleTxBase64, 'base64').toString();

    // deserialize the hash
    let transaction = JSON.parse(deserializedData);

    const scheduleTransaction = new ScheduleCreateTransaction(transaction)
        .sign(acc1PrivateKey);

    //Sign with the client operator key to pay for the transaction and submit to a Hedera network
    const txResponse = await scheduleTransaction.execute(client);

    //Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction status
    const transactionStatus = receipt.status;
    console.log("The transaction consensus status is " + transactionStatus);

    process.exit();
}

main().catch(err => {
    console.log(err);
    process.exit();
})