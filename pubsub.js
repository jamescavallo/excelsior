const redis = require('redis');

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN'
};

class PubSub{

    constructor({blockchain}){

        this.blockchain = blockchain;
        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        this.subscribeToChannels();
        this.subscriber.on('message', (channel, message ) => this.handleMessage(channel, message));
    }

    handleMessage(channel, message) {
        console.log('Message recieved. Channel: ' + channel + ' Message: ' + message);

        const parsedMessage = JSON.parse(message);

        //If a new message is recieved on the blockchain channel, replace the chain with the parse

        if (channel === CHANNELS.BLOCKCHAIN){
            this.blockchain.replaceChain(parsedMessage);
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
        this.publisher.publish(channel, message);
    }

    broadcastChain(){
        //If the chain updates this publishes the new updated chain to the channel blockchain as a string
        this.publish({channel: CHANNELS.BLOCKCHAIN, message: JSON.stringify(this.blockchain.chain)});


    }

}

module.exports = PubSub;