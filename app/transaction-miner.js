const Transaction = require("../wallet/transaction");

class TransactionMiner{
    constructor({blockchain, transactionPool, wallet, pubsub }){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;

    }

    mineTransactions(){
        //returns an array of the valid transactions
        const validTransactions = this.transactionPool.validTransactions();

        //adds the miner reward transaction to the valid transactions to be mined
        validTransactions.push(
            Transaction.rewardTransaction({minerWallet: this.wallet})
        );


        //adds a block of these transactions to the chain
        this.blockchain.addBlock({data: validTransactions});

        //sends new chain to network
        this.pubsub.broadcastChain();

        //emptys pool
        this.transactionPool.clear();

    }
}

module.exports = TransactionMiner;