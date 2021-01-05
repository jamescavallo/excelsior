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
        //iterates through chain outputs to find current balance
        let hasConductedTransaction = false;
        let outputsTotal = 0;
        for (let i =chain.length-1; i>0 ; i --){
            const block = chain[i];

            for(let transaction of block.data){
                if (transaction.input.address === address){
                    hasConductedTransaction = true;
                }
                const addressOutput = transaction.outputMap[address];

                if(addressOutput){
                    outputsTotal += addressOutput;
                }
            }

            if(hasConductedTransaction){
                break;
            }

        }
        return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;


    }



}

module.exports = Wallet;