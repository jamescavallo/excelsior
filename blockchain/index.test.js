const Blockchain = require('.');
const Block = require('./block');
const {cryptoHash} = require('../util');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

describe('Blockchain', () =>{
    let blockchain, newChain, originalChain, errorMock;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;
        errorMock = jest.fn();
        global.console.error = errorMock;

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
        let logMock;
        beforeEach(() => {
            logMock = jest.fn();
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

        describe('and the valid transactions flag is true', () =>{
            it('calls validTransactionData()', () =>{
                const validTransactionDataMock = jest.fn();
                blockchain.validTransactionData = validTransactionDataMock;
                newChain.addBlock({data: 'foo'});

                blockchain.replaceChain(newChain.chain, true);

                expect(validTransactionDataMock).toHaveBeenCalled();


            });

        });



    });

    describe('validTransactionData()', () =>{
        let transaction, rewardTransaction, wallet;

        beforeEach(() =>{
            wallet = new Wallet();
            transaction = wallet.createTransaction({recipient: 'foo', amount: 60});
            rewardTransaction = Transaction.rewardTransaction({minerWallet: wallet});
        });

        describe('the transaction data is valid', () =>{
            it('returns true', () =>{
                newChain.addBlock({data: [transaction, rewardTransaction]});
                expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();
            });

        });

        describe('the transaction data has multiple rewards', () =>{
            it('returns false and logs an error', () =>{
                newChain.addBlock({data: [transaction, rewardTransaction, rewardTransaction]});
                expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });

        });

        describe('the transaction data has at least one bad output map', () =>{
            describe('the transaction is not a reward transaction', () =>{
                it('returns false and logs an error', () =>{
                    transaction.outputMap[wallet.publicKey] = 999999;
                    newChain.addBlock({data: [transaction, rewardTransaction]});
                    expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('the transaction is a reward transaction', () =>{
                it('returns false and logs an error', () =>{
                    rewardTransaction.outputMap[wallet.publicKey] = 9999999;
                    newChain.addBlock({data: [transaction, rewardTransaction]});
                    expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

        });

        describe('the transaction data has at least one bad input', () =>{
            it('returns false and logs an error', () =>{
                wallet.balance = 9000;

                const evilOutputMap = {[wallet.publicKey]: 8900, fooRecipient: 100};

                const evilTransaction = {
                    input: {timestamp: Date.now(), amount: wallet.balance, address: wallet.publicKey, signature: wallet.sign(evilOutputMap)},
                    outputMap: evilOutputMap
                };

                newChain.addBlock({data:[evilTransaction, rewardTransaction]});
                expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('the block contains multiple identical transactions', () =>{
            it('returns false and logs an error', () =>{
                newChain.addBlock({data: [transaction, transaction, transaction]})
                expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();

            });
        });

    });



});