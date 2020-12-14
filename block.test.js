const Block = require("./block");
const { GENESIS_DATA } = require("./config");
const cryptoHash = require("./crypto-hash");

describe ('Block',() => {
    const timeStamp = 'a-date'
    const lastHash = 'foo hash'
    const hash = 'bar-hash'
    const data = ["blockchain", "data"];
    const block = new Block({timeStamp, lastHash, hash, data});
    it("has timestamp, lastHash, hash and data fields", () => {
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
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
            expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timeStamp, lastBlock.hash, data));
            

        });


    });

});