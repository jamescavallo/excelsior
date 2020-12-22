const { GENESIS_DATA } = require("./config");
const cryptoHash = require("./crypto-hash");

class Block {
    constructor({timeStamp, lastHash, hash, data, nonce, difficulty}){
        this.timeStamp = timeStamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;

    }

    static genesis(){
        return  new this(GENESIS_DATA);
    }

    static minedBlock({lastBlock, data}){
        let hash, timeStamp;
        const lastHash = lastBlock.hash;
        const {difficulty } = lastBlock;
        let nonce = 0;

        do {
            //keep generating hashes until the desired difficulty is met
            nonce ++;
            timeStamp = Date.now();
            hash = cryptoHash(timeStamp, lastHash, data, nonce, difficulty);
        } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));
        
        return  new this({timeStamp: timeStamp, lastHash:lastBlock.hash, difficulty, nonce, data, hash});
    }


}

module.exports = Block;