const hexToBinary = require('hex-to-binary');
const Block = require("./block");
const { GENESIS_DATA, MINE_RATE } = require("../config");
const cryptoHash = require("../util/crypto-hash");

describe ('Block',() => {
    const timeStamp = 2000
    const lastHash = 'foo hash'
    const hash = 'bar-hash'
    const data = ["blockchain", "data"];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({timeStamp, lastHash, hash, data, nonce, difficulty});

    it("has timestamp, lastHash, hash and data fields", () => {
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);

        expect(block.timeStamp).toEqual(timeStamp);

    });

    describe ('genesis()', () => {
        const genesisBlock = Block.genesis();
        it('returns a block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);

        });

        it('returns genesis data', () =>{
            expect(genesisBlock).toEqual(GENESIS_DATA);

        });
    });

    describe('mineBlock()', () => {
        const lastBlock = Block.genesis();
        const data = 'minedData';
        const minedBlock = Block.minedBlock({lastBlock, data});

        it('returns block instance', () =>{
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('sets the lasth to be the hash of the last block', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);

        });

        it('sets the data', () => {
            expect(minedBlock.data).toEqual(data);

        });

        it('sets the timestamp', () => {
            expect(minedBlock.timeStamp).not.toEqual(undefined);

        });

        it('creates SHA hash', () => {
            expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timeStamp, minedBlock.nonce, minedBlock.difficulty, lastBlock.hash, data));
            

        });

        it('Sets a hash with a leading number of zeros equal to the set difficulty', () =>{
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));

        });

        it('Has a lower limit of 1', () =>{
            block.difficulty = -1;
            expect(Block.adjustDifficulty({originalBlock: block})).toEqual(1);

        });


    });

});