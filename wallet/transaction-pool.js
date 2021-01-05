const Transaction = require("./transaction");

class TransactionPool {

    constructor(){
        this.transactionMap = {};
    }

    setTransaction(transaction){
        this.transactionMap[transaction.id] = transaction;

    }

    setMap(transactionMap){
        this.transactionMap = transactionMap;
    }

    existingTransaction({inputAddress}){
        const transactions = Object.values(this.transactionMap);
        return transactions.find(transaction => transaction.input.address === inputAddress)
    }

    validTransactions(){
        return Object.values(this.transactionMap).filter(
            transaction => Transaction.validTransaction(transaction)
        );

    }

    clear(){
        this.transactionMap = {};
    }

    clearBlockchainTransactions({chain}){
        for (let i=0; i< chain.length; i++){
            const block = chain[i]

            //clear relevant transactions if they are already in the blockchain so they cant be mined again
            //this is called on a global scale to rid all pools of these transactions

            for (let transaction of block.data){
                if (this.transactionMap[transaction.id]){
                    delete this.transactionMap[transaction.id];
                }
            }

        }
    }

}

module.exports = TransactionPool;