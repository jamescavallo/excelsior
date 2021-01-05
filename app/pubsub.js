const redis = require('redis');

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
};

class PubSub{

    constructor({blockchain, transactionPool}){

        this.blockchain = blockchain;
        this.transactionPool = transactionPool;

        //creates a sub and pub
        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        //subscribes the subscriber to all channels in the channels map
        this.subscribeToChannels();

        this.subscriber.on('message', (channel, message ) => this.handleMessage(channel, message));
    }


//called when a new message is added to the channel
    handleMessage(channel, message) {
        console.log('Message recieved. Channel: ' + channel + ' Message: ' + message);

        const parsedMessage = JSON.parse(message);

        //If a new message is recieved on the blockchain channel, replace the chain with the parse

        switch(channel){
            case CHANNELS.BLOCKCHAIN:
                //If the channel was a blockchain broadcast try and replace local chain
                this.blockchain.replaceChain(parsedMessage, () =>{
                    //when a new message comes in clear the pool of the new transactions
                    this.transactionPool.clearBlockchainTransactions({
                        chain: parsedMessage
                    });
                });
                break;
            case CHANNELS.TRANSACTION:
                //If a new transaction was broadcast set the transaction into the pool
                this.transactionPool.setTransaction(parsedMessage)
                break;
            default:
                return;
        }
    }

    subscribeToChannels(){
        //runs a for loop and subscribes to all channels
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel);

        });
    }

    publish({ channel, message }){
        //publishes a message to a channel
        this.subscriber.unsubscribe(channel, () =>{
            this.publisher.publish(channel, message, () => {
                this.subscriber.subscribe(channel);
            });
        });
    }


    //publishes any changes to the channel
    broadcastChain(){
        //If the chain updates this publishes the new updated chain to the channel blockchain as a string
        this.publish({channel: CHANNELS.BLOCKCHAIN, message: JSON.stringify(this.blockchain.chain)});

    }

    broadcastTransaction(transaction){
        //Publishes new transaction to the transaction channel so all nodes can update their pools
        this.publish({channel: CHANNELS.TRANSACTION, message: JSON.stringify(transaction)})
    }

}

module.exports = PubSub;