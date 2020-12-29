const Blockchain = require('.');
const Block = require('./block');
const {cryptoHash} = require('../util');

describe('Blockchain', () =>{
    let blockchain, newChain, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;

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

            describe('The chain contains a block with a jumped difficulty', () =>{
                it('Returns false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length-1];
                    lastHash = lastBlock.hash;
                    timeStamp = lastBlock.timeStamp;
                    nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty - 3;

                    const hash = cryptoHash(lastHash, timeStamp, data, nonce, difficulty);
                    
                    const badBlock = new Block({timeStamp, lastHash,hash, nonce, difficulty, data});
                    blockchain.chain.push(badBlock);

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

    describe('replaceChain()', () =>{
        let errorMock, logMock;
        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();
            global.console.error = errorMock;
            global.console.log = logMock;

        });
        describe('the new chain is not longer', () =>{
            beforeEach(() => {
                newChain.chain[0] = { new: 'chain'};
                blockchain.replaceChain(newChain.chain);

            });
            it('does not replace the chain', () =>{
                expect(blockchain.chain).toEqual(originalChain);

            });

            it('logs and error', () =>{
                expect(errorMock).toHaveBeenCalled();

            });

        });
        describe('the new chain is longer', () =>{
            beforeEach(() => {
                newChain.addBlock({data: 'Bears'});
                newChain.addBlock({data: 'Beats'});
                newChain.addBlock({data: 'Battlestar'});

            });
            describe('the new chain is invalid', () =>{
                beforeEach(() =>{
                    newChain.chain[2] = 'somefakehash';
                    blockchain.replaceChain(newChain.chain);

                });
                it('does not replace the chain', () =>{
                    expect(blockchain.chain).toEqual(originalChain);

                });

                it('logs and error', () =>{
                    expect(errorMock).toHaveBeenCalled();
    
                });

            });
            describe('the new chain is valid', () =>{
                beforeEach(() =>{
                    blockchain.replaceChain(newChain.chain);
                });
                it('does replace the chain', () =>{
                    expect(blockchain.chain).toEqual(newChain.chain);

                });

                it('logs about the chain replacement', () =>{
                    expect(logMock).toHaveBeenCalled();
                });
                
            

            });

        });

    });



});