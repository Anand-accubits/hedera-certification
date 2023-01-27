
/**
 * Create a script that creates a scheduled transaction to transfer 10
Hbar from Account1 to Account2.

Serialise and export the transaction to a base 64 format and use
this as the input to the next step.

Make a second script (or function) that reads in the serialised
format and provides the required signature and submit it.
 */
const {
    Client,
    TokenCreateTransaction,
    AccountBalanceQuery,
    TokenType,
    TokenSupplyType,
    PrivateKey,
    TransferTransaction,
    ScheduleCreateTransaction,
    Hbar
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

// Grab private key and account id for Account 2
const acc2AccountId = process.env.ACCOUNT_ID_2;
const acc2PrivateKey = PrivateKey.fromString(process.env.PRIVATE_KEY_2);

// Throw error if the private key and account id's are null 
if (acc2AccountId == null || acc2PrivateKey == null) {
    throw new Error("Environment variables AccountId and PrivateKey of Account2 must be present");
}

// Create connection to Hedera
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

async function main() {

    //Create a transaction to schedule
    const transaction = new TransferTransaction()
        .addHbarTransfer(acc1AccountId, new Hbar(-1))
        .addHbarTransfer(acc2AccountId, new Hbar(1));

    //Schedule a transaction
    const scheduleTransaction = await new ScheduleCreateTransaction()
        .setScheduledTransaction(transaction)
        .setScheduleMemo("Scheduled Anand1115!")
        .setAdminKey(myPrivateKey)
        .execute(client);

    // console.log(transaction)

    //Get the receipt of the transaction
    const receipt = await scheduleTransaction.getReceipt(client);

    //Get the schedule ID
    const scheduleId = receipt.scheduleId;
    console.log("The schedule ID is " + scheduleId);

    //Get the scheduled transaction ID
    const scheduledTxId = receipt.scheduledTransactionId;
    console.log("The scheduled transaction ID is " + scheduledTxId);

    // Serialise and export the transaction to a base 64 
    let serializedData = JSON.stringify(scheduleTransaction);
    let scheduledTxIdBase64 = Buffer.from(serializedData).toString('base64');

    console.log("The scheduled transaction ID in base64 is " + scheduledTxIdBase64);

    process.exit();
}

main().catch(err => {
    console.log(err);
    process.exit();
})