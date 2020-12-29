const uuid = require('uuid/v1');

class Transaction{

    constructor({senderWallet, recipient, amount}){
        //each transaction has an id
        this.id = uuid();

        //output of transaction
        this.outputMap = this.createOutputMap({senderWallet, recipient, amount});

        //key, balance and signature
        this.input = this.createInput({senderWallet, outputMap: this.outputMap});
    }

    createOutputMap({senderWallet, recipient, amount}){
        const outputMap = {};
        //amount mapped to recipient
        outputMap[recipient] = amount;

        //new balance after transaction in sender wallet
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

        return outputMap;
    }

    createInput({senderWallet, outputMap}){
        return {
            //timestamp of transactiom
            timestamp: Date.now(),
            //amount
            amount: senderWallet.balance,
            //sender wallet public key
            address: senderWallet.publicKey,
            //signing the output data
            signature: senderWallet.sign(outputMap)
        };
    }

}

module.exports = Transaction;