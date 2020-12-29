const {STARTING_BALANCE} = require('../config');
const {ec, cryptoHash} = require('../util');

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



}

module.exports = Wallet;