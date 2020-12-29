const Wallet = require('./index');
const {verifySignature} = require('../util');

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



});