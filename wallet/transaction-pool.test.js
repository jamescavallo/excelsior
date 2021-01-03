const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');

describe('TransactionPool', () =>{
    let transactionPool, transaction, senderWallet;

    beforeEach(() =>{
        senderWallet = new Wallet();
        transactionPool = new TransactionPool();
        transaction = new Transaction({senderWallet, recipient: 'fake-recipient', amount: 50});
    });

    describe('setTransaction()', () =>{
        it('adds a transaction to the pool', () =>{
            transactionPool.setTransaction(transaction);
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);

        });

    });

    describe('existingTransaction()', () =>{
        it('returns an existing transactiom given an input address', () =>{
            transactionPool.setTransaction(transaction);

            expect(transactionPool.existingTransaction({inputAddress: senderWallet.publicKey})).toBe(transaction);
            
        });

    });

});