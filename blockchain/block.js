const hexToBinary = require('hex-to-binary');
const { GENESIS_DATA, MINE_RATE } = require("../config");
const cryptoHash = require("../util/crypto-hash");


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
        const lastHash = lastBlock.hash;
        let hash, timeStamp;
        let {difficulty } = lastBlock;
        let nonce = 0;

        do {
            //keep generating hashes until the desired difficulty is met
            nonce ++;
            timeStamp = Date.now();
            //adjust difficulty based on previous block
            difficulty = Block.adjustDifficulty({originalBlock:lastBlock,timeStamp})
            hash = cryptoHash(timeStamp, lastHash, data, nonce, difficulty);
        } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty)); //mine until difficulty is found

        //return the new block
        return  new this({timeStamp: timeStamp, lastHash:lastBlock.hash, difficulty, nonce, data, hash});
    }

    static adjustDifficulty({originalBlock, timeStamp}){
        const {difficulty} = originalBlock;

        //Amount of time needed to mine this block
        const difference = timeStamp - originalBlock.timeStamp;
        if(difficulty <1) return 1;

        //If the time is greater than desired rate lower the difficulty by one
        if (difference > MINE_RATE) return difficulty - 1;
        //otherwise add
        return difficulty +1;
    }


}

module.exports = Block;