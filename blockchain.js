const Block = require('./block');
const cryptoHash = require('./crypto-hash');
class Blockchain {
    constructor(){
        this.chain = [Block.genesis()];
    }

    addBlock({data}){
        const newBlock = Block.minedBlock({lastBlock: this.chain[this.chain.length-1], data})
        this.chain.push(newBlock);
    }

    static isValidChain(chain){
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;


        for (let i = 1; i < chain.length; i ++){
            const actualLastHash = chain[i-1].hash;
            const {timeStamp, lastHash, hash, data } = chain[i];
            if (lastHash !== actualLastHash) return false;
            const validatedHash = cryptoHash(timeStamp, lastHash, data);
            if (hash !== validatedHash) return false;

        }

        return true;
    }

    replaceChain(chain) {

        if (chain.length <= this.chain.length){
          console.error('Incoming chain must be longer');
          return;  
        }

        if (!Blockchain.isValidChain(chain)){
            console.error('Incoming chain must be valid');
            return;
        }

        console.log('replacing chain with ' + chain);

        this.chain = chain;

    }


}

module.exports = Blockchain;