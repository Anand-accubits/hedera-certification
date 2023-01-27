const {
    Client,
    TokenCreateTransaction,
    AccountBalanceQuery,
    TokenType,
    TokenSupplyType,
    PrivateKey,
    Wallet,
    
    TokenInfoQuery
} = require('@hashgraph/sdk');
require('dotenv').config();

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
client.setOperator(acc1AccountId, acc1PrivateKey);

// Create Admin Wallet
const adminUser = new Wallet(
    acc1AccountId,
    acc1PrivateKey
)

// Create Supply user Wallet
const supplyUser = new Wallet(
    acc2AccountId,
    acc2PrivateKey
)

async function createToken() {

    //Create the transaction to create token with HTS and with initial supply of 350.50
    const transaction = await new TokenCreateTransaction()
        .setTokenName("Hedera Test Token")
        .setTokenSymbol("HTT")
        .setTokenType(TokenType.FungibleCommon)
        .setTreasuryAccountId(acc1AccountId)
        .setInitialSupply(35050)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(50000)
        .setDecimals(2)
        .setAdminKey(adminUser.publicKey)
        .setSupplyKey(supplyUser.publicKey)
        .freezeWith(client);

    //Sign the transaction with the client, of Account1
    const signTx = await transaction.sign(acc1PrivateKey);

    //Submit to a Hedera network
    const txResponse = await signTx.execute(client);

    //Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the token ID from the receipt
    const tokenId = receipt.tokenId;

    console.log("The Token ID is " + tokenId);

    // Get The Token Information
    const name = await queryTokenFunction("name", tokenId);
    const symbol = await queryTokenFunction("symbol", tokenId);
    const tokenSupply = await queryTokenFunction("totalSupply", tokenId);
    console.log('The total supply of the ' + name + ' token is ' + tokenSupply + ' of ' + symbol);

    //Create the query to get the balance of Treasury Account [Account1]
    const balanceQuery = new AccountBalanceQuery()
        .setAccountId(adminUser.accountId);

    //Submit the query transaction to a Hedera network
    const tokenBalance = await balanceQuery.execute(client);

    console.log("The balance of the Account1 is: " + tokenBalance.tokens.get(tokenId));

    process.exit();
}

async function queryTokenFunction(functionName, tokenId) {
    //Create the query
    const query = new TokenInfoQuery()
        .setTokenId(tokenId);

    const data = await query.execute(client);

    //getting token name, token symbol, and token total supply from data
    let result;
    if (functionName === "name") {
        result = data.name;
    } else if (functionName === "symbol") {
        result = data.symbol;
    } else if (functionName === "totalSupply") {
        result = data.totalSupply;
    } else {
        return;
    }

    return result
}

createToken().catch(err => {
    console.log(err);
    process.exit();
})