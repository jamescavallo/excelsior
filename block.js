const { GENESIS_DATA } = require("./config");
const cryptoHash = require("./crypto-hash");

class Block {
    constructor({timeStamp, lastHash, hash, data}){
        this.timeStamp = timeStamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;

    }

    static genesis(){
        return  new this(GENESIS_DATA);
    }

    static minedBlock({lastBlock, data}){
        const timeStamp = Date.now();
        const lastHash = lastBlock.hash;
        
        return  new this({timeStamp: timeStamp, lastHash:lastBlock.hash, data, hash: cryptoHash(timeStamp, lastHash, data)});
    }


}

module.exports = Block;