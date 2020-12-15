const Blockchain = require('./blockchain');
const Block = require('./block');

describe('Blockchain', () =>{
    let blockchain;

    beforeEach(() => {
        blockchain = new Blockchain();
    })

    it('Contains a chain array instance', () => {
        expect(blockchain.chain).toBeInstanceOf(Array);
    });

    it('Starts with genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('Adds a block to the chain', () => {
        const newData = 'fooBar';
        blockchain.addBlock({data: newData});
        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);

    });

    describe('isValidChain()', () => {
        describe('chain does not start w genesis block', () => {
            it('returns false', () =>{
                blockchain.chain[0] = {data: 'evil data'};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });

        });
        describe('chain does start w genesis block and has multiple blocks', () => {
            describe('a last has reference has change', () =>{
                it('returns false', () =>{
                    blockchain.addBlock({data: 'Bears'});
                    blockchain.addBlock({data: 'Beats'});
                    blockchain.addBlock({data: 'Battlestar'});
                    blockchain.chain[2].lastHash = 'broken hash';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);

                });
            });

            describe('The change contains a block with an invalid field', () =>{
                it('returns false', () =>{
                    blockchain.addBlock({data: 'Bears'});
                    blockchain.addBlock({data: 'Beats'});
                    blockchain.addBlock({data: 'Battlestar'});
                    blockchain.chain[2].data = 'something wrong';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('The change does not contain any invalid blocks', () =>{
                it('returns true', () =>{
                    blockchain.addBlock({data: 'Bears'});
                    blockchain.addBlock({data: 'Beats'});
                    blockchain.addBlock({data: 'Battlestar'});
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });

        });


    });



});