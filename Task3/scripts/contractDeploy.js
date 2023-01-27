const { FileCreateTransaction, Client, ContractCreateTransaction, ContractFunctionParameters, ContractCallQuery, Hbar, ContractExecuteTransaction } = require('@hashgraph/sdk');
require('dotenv').config();

let contract = require('./contract.json');



async function main() {

    const myPrivateKey = process.env.MY_PRIVATE_KEY
    const myAccountid = process.env.MY_ACCOUNT_ID

    const client = Client.forTestnet();
    client.setOperator(myAccountid, myPrivateKey);


    const byteCode = contract.data.bytecode.object;

    // Create a file on hedera and store the hex encoded bytecode
    const fileCreateTx = new FileCreateTransaction()
        // Set the bytecode of the contract
        .setContents(byteCode);

    // Submit the file to the Hedera test network signing with the transaction fee payer key specified with the client
    const submitTx = await fileCreateTx.execute(client);

    // Get the receipt of the file creation transaction
    const fileReceipt = await submitTx.getReceipt(client);

    // Get the file id form the receipt
    const bytecodeFileId = fileReceipt.fileId;

    // Log the file id
    console.log('bytecodeFileId :>> ', bytecodeFileId.toString());

    // Instantiate the contract instance
    const contractTx = await new ContractCreateTransaction()
        // Set the file id of the hedera file storing bytecode
        .setBytecodeFileId(bytecodeFileId)
        // Set the gas to instantiate the contract
        .setGas(100000)

    // submit the transaction to the hedera network
    const contractResponse = await contractTx.execute(client);

    // Get the receipt
    const contractreceipt = await contractResponse.getReceipt(client);

    // Get the smart contract id
    const newContractId = contractreceipt.contractId;

    console.log(newContractId.toString())

    // Call a function of the smart contract
    const contractQuery = await new ContractCallQuery()
        // set the gas for the query
        .setGas(100000)
        // set the contract id
        .setContractId(newContractId)
        // set the contract function call
        .setFunction("get_message")
        // Set the query payment for the noode running the request
        // This value must cover the cost of the request , other wiese it will fail
        .setQueryPayment(new Hbar(2));

    // submit to the hedera network
    const getMessage = await contractQuery.execute(client);

    // Get a string from the result at index 0
    const message = getMessage.getString(0);

    console.log('message :>> ', message);

    // create the transaction to update the contract message
    const contractCallTx = await new ContractCallQuery()
        // Set the id of the contract
        .setContractId(newContractId)
        // Set the gas
        .setQueryPayment(new Hbar(10))
        // ste the constract function to call
        .setFunction("function1", new ContractFunctionParameters().addUint16("6").addUint16("7"))

    // submit the transaction
    const submitExectx = await contractCallTx.execute(client);

    // //Query the contract for the contract message
    // const contractCallQuery = new ContractCallQuery()
    //     //Set the ID of the contract to query
    //     .setContractId(newContractId)
    //     //Set the gas to execute the contract call
    //     .setGas(100000)
    //     //Set the contract function to call
    //     .setFunction("“function2”")
    //     //Set the query payment for the node returning the request
    //     //This value must cover the cost of the request otherwise will fail 
    //     .setQueryPayment(new Hbar(10));

    // //Submit the transaction to a Hedera network 
    // const contractUpdateResult = await contractCallQuery.execute(client);

    // //Get the updated message at index 0
    // const message2 = contractUpdateResult.getString(0);

    // //Log the updated message to the console
    // console.log("The updated contract message: " + message2);



    process.exit();
}


main().catch(err => {
    console.log('err :>> ', err);
    process.exit();
})