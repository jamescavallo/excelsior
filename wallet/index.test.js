const Wallet = require('./index');
const {verifySignature} = require('../util');
const Transaction = require('./transaction');

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

    });



});