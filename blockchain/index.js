const Block = require('./block');
const {cryptoHash} = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');
class Blockchain {
    constructor(){
        this.chain = [Block.genesis()];
    }

    addBlock({data}){
        const newBlock = Block.minedBlock({lastBlock: this.chain[this.chain.length-1], data})
        this.chain.push(newBlock);
    }

    static isValidChain(chain){
        //Checks values of chains genesis block and compares
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

        //Checks for data changes in each block
        for (let i = 1; i < chain.length; i ++){
            const actualLastHash = chain[i-1].hash;
            const {timeStamp, lastHash, hash, data, nonce, difficulty} = chain[i];
            const lastDifficulty = chain[i-1].difficulty;



            if (lastHash !== actualLastHash) return false;

            const validatedHash = cryptoHash(timeStamp, lastHash, data, nonce, difficulty);

            if (hash !== validatedHash) return false;

            if ((lastDifficulty - difficulty) > 1) return false;

        }

        return true;
    }

    replaceChain(chain, validateTransactions, onSuccess) {

        if (chain.length <= this.chain.length){
          console.error('Incoming chain must be longer');
          return;  
        }

        if (!Blockchain.isValidChain(chain)){
            console.error('Incoming chain must be valid');
            return;
        }
        if(validateTransactions && !this.validTransactionData({chain})){
            //checks that only valid data is contained in the chain
            console.error('the incoming chain has a transaction error')
            return;
        }

        if (onSuccess) onSuccess();

        console.log('replacing chain with ' + chain);

        this.chain = chain;

    }

    validTransactionData({chain}){
        //check all cases to make sure transaction data isnt fakes
        for( let i =1; i< chain.length; i++){
            const block = chain[i];
            const transactionSet = new Set();
            let rewardTransactionCount = 0;
            
            for(let transaction of block.data){
                if( transaction.input.address === REWARD_INPUT.address){
                    rewardTransactionCount +=1;
                    if (rewardTransactionCount > 1){
                        console.error('Miner rewards exceed limit');
                        return false;
                    }

                    if(Object.values(transaction.outputMap)[0] !== MINING_REWARD){
                        console.error('Miner reward amount is invalid');
                        return false;
                    }
                }else{
                    if(!Transaction.validTransaction(transaction)){
                        console.error('Invalid transaction');
                        return false;
                    }

                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain,
                        address: transaction.input.address
                    });

                    if (transaction.input.amount !== trueBalance){
                        console.error('Invalid input amount');
                        return false;
                    }

                    if(transactionSet.has(transaction)){
                        console.error('An identical transaction appeared');
                        return false;
                    }else{
                        transactionSet.add(transaction);
                    }

                }
            }

        }
        return true;


    }


}

module.exports = Blockchain;