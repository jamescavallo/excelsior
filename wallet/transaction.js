const uuid = require('uuid/v1');
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const { verifySignature } = require('../util');

class Transaction{

    constructor({senderWallet, recipient, amount, outputMap, input}){
        //each transaction has an id
        this.id = uuid();

        //output of transaction
        this.outputMap = outputMap || this.createOutputMap({senderWallet, recipient, amount});

        //key, balance and signature
        this.input = input || this.createInput({senderWallet, outputMap: this.outputMap});
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

    static validTransaction(transaction){

        const {input, outputMap} = transaction;
        const {address, amount, signature} = input;


        //sum the totals of the output items and check with input to make sure no changes
        const outputTotal = Object.values(outputMap)
            .reduce((total, outputAmount) => total + outputAmount);
        
        if (amount != outputTotal){
            console.error('Invalid transaction from ' + address);
            return false;
        }

        if (!verifySignature({publicKey: address, data: outputMap, signature})){
            console.error('Invalid signature from ' + address);
            return false;
        }

        return true;

    }

    static rewardTransaction({minerWallet}){
        //creates a new special transaction object for a miner ONLY uses hard coded reward and address
        return new this({
            input: REWARD_INPUT,
            outputMap: {[minerWallet.publicKey]: MINING_REWARD}
        });

    }

    update({senderWallet, recipient, amount}){

        if (amount > this.outputMap[senderWallet.publicKey]){
            throw new Error('Amount exceeds balance');
        }

        if(!this.outputMap[recipient]){
            this.outputMap[recipient] = amount;

        }else{

            this.outputMap[recipient] = this.outputMap[recipient] + amount;
        }


        this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount;

        this.input = this.createInput({senderWallet, outputMap: this.outputMap})
    }

}

module.exports = Transaction;