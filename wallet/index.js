const {STARTING_BALANCE} = require('../config');
const {ec, cryptoHash} = require('../util');
const Transaction = require('./transaction');

class Wallet{
    constructor(){
        //amount in the wallet
        this.balance = STARTING_BALANCE;

        //generates private and public key pair with elliptic
        this.keyPair = ec.genKeyPair();

        //assigns new public key to the field 
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data){
        //encrypt to a hex hash
        data = cryptoHash(data);

        //returns the signed data
        return this.keyPair.sign(data);
    }

    createTransaction({recipient, amount, chain}){
        if (chain){
            this.balance = Wallet.calculateBalance({chain: chain, address: this.publicKey});

        }
        if (amount > this.balance){
            throw new Error('Amount exceeds balance');

        }

        return new Transaction({senderWallet: this, amount, recipient});

    }

    static calculateBalance({chain, address}){
        //iterates backwards through every transaction and every block in the chain, when a block is
        //found with a transaction from `address` look breaks and uses that output value
        let hasConductedTransaction = false;
        let outputsTotal = 0;

    
        for (let i =chain.length-1; i>0 ; i --){
            //block at this chain index
            const block = chain[i];

            //iterate through this block's data
            for(let transaction of block.data){

                //if the address of the transaction is equal to wallets flag the variable
                if (transaction.input.address === address){
                    hasConductedTransaction = true;
                }
                const addressOutput = transaction.outputMap[address];

                if(addressOutput){
                    //add the balance at this transaction
                    outputsTotal += addressOutput;
                }
            }

            if(hasConductedTransaction){
                //if a transaction block with this address stamp is found stop searching
                break;
            }

        }
        //return the balance
        return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;


    }



}

module.exports = Wallet;