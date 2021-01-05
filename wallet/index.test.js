const Wallet = require('./index');
const {verifySignature} = require('../util');
const Transaction = require('./transaction');
const Blockchain = require('../blockchain');
const { STARTING_BALANCE } = require('../config');

describe('Wallet', () =>{
    let wallet;

    beforeEach(() =>{
        wallet = new Wallet();
    });

    it('has a valid balance', () =>{
        expect(wallet).toHaveProperty('balance');

    });

    it('has a public key', () =>{
        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing data', () =>{
        const data = 'foo-bar';

        it('verifies a signature', () =>{
            expect(verifySignature({publicKey: wallet.publicKey, data, signature: wallet.sign(data)})).toBe(true);

        });

        it('does not verify an invalid signature', () =>{
            expect(verifySignature({publicKey: wallet.publicKey, data, signature: new Wallet().sign(data)})).toBe(false);
        });

    });

    describe('createTransaction()', () =>{
        describe('The amount exceeds the wallet balance', () =>{
            it('throws an error', () =>{
                expect(() => wallet.createTransaction({amount: 9999999, recipient: 'anyone' })).toThrow('Amount exceeds balance');
            });

        })

        describe('The amount is valid', () =>{
            let transaction, amount, recipient;
            beforeEach(() => {
                amount = 50;
                recipient = 'anyone';
                transaction = wallet.createTransaction({amount, recipient});
            });

            it('creates an instance of a transaction', () =>{
                expect(transaction instanceof Transaction).toBe(true);

            });

            it('matches the input of the wallet', () =>{
                expect(transaction.input.address).toEqual(wallet.publicKey);

            });

            it('outputs the amount recipient', () =>{
                expect(transaction.outputMap[recipient]).toEqual(amount);

            });
            
        })

        describe('and a chain is passed', () =>{
            it('calls Wallet.calculateBalance()', () =>{

                const calculateBalanceMock = jest.fn();
                originalCalculateBalance = Wallet.calculateBalance;
                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTransaction({
                    recipient: "foo",
                    amount: 50,
                    chain: new Blockchain().chain
                });

                expect(calculateBalanceMock).toHaveBeenCalled();

                Wallet.calculateBalance = originalCalculateBalance;

            });
        })

    });

    describe('calculateBalance()', () =>{
        let blockchain;

        beforeEach(() =>{
            blockchain = new Blockchain();
        });

        describe('there are no outputs for the wallet ', () =>{
            it('returns the value of STARTING_BALANCE', () =>{
                expect(Wallet.calculateBalance({chain: blockchain.chain, address: wallet.publicKey})).toEqual(STARTING_BALANCE);

            });

        });

        describe('there are outputs for the wallet', () =>{
            let transactionOne, transactionTwo;

            beforeEach(() =>{
                transactionOne = new Wallet().createTransaction({recipient: wallet.publicKey, amount: 50});
                transactionTwo = new Wallet().createTransaction({recipient: wallet.publicKey, amount: 60});

                blockchain.addBlock({data: [transactionOne, transactionTwo]});
            });

            it('adds the sum of all transaction outputs to the wallet balance', () =>{
                expect(Wallet.calculateBalance({chain: blockchain.chain, address: wallet.publicKey})).toEqual(STARTING_BALANCE 
                    + transactionOne.outputMap[wallet.publicKey] + transactionTwo.outputMap[wallet.publicKey] );
            });

            describe(' and the wallet has made a transaction', () =>{
                let recentTransaction;

                beforeEach(() =>{
                    recentTransaction = wallet.createTransaction({
                        recipient: 'foo-address',
                        amount: 30,
                    })

                    blockchain.addBlock({data: [recentTransaction]});
                });

                it('returns the output of the recent transaction', () =>{
                    expect(Wallet.calculateBalance({chain: blockchain.chain, address: wallet.publicKey})).toEqual(recentTransaction.outputMap[wallet.publicKey]);

                });
                
                describe(' and there are outputs next to and after the recent transaction', () =>{
                    let sameBlockTransaction, nextBlockTransaction;

                    beforeEach(() =>{
                        recentTransaction = wallet.createTransaction({
                            recipient: 'later-foo',
                            amount: 60,
                        });

                        sameBlockTransaction = Transaction.rewardTransaction({minerWallet: wallet});
                        blockchain.addBlock({data: [recentTransaction, sameBlockTransaction]});

                        nextBlockTransaction = new Wallet().createTransaction({
                            recipient: wallet.publicKey,
                            amount: 75
                        });

                        blockchain.addBlock({data: [nextBlockTransaction]});


                    });

                    it('includes the output amounts in the returned balance', () =>{
                        expect(Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: wallet.publicKey
                        })).toEqual(recentTransaction.outputMap[wallet.publicKey] + sameBlockTransaction.outputMap[wallet.publicKey]
                            + nextBlockTransaction.outputMap[wallet.publicKey]);

                    });

                });


            });

        });

    });





});