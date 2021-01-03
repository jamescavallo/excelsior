const express = require('express');
const Blockchain = require('./blockchain');
const bodyParser = require('body-parser');
const PubSub = require('./app/pubsub');
const request = require('request');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = 'http://localhost:' + DEFAULT_PORT;

//Creates a new express webapp
const app = express();

//Creates a new blockchain
const blockchain = new Blockchain();

//Create an instance of the transaction pool
const transactionPool = new TransactionPool();

//Create an instance of Wallet
const wallet = new Wallet();

//Create pubsub object with the current blockchain 
const pubsub = new PubSub({blockchain});

//setTimeout(() => pubsub.broadcastChain(), 1000);


app.use(bodyParser.json());



//******API*******
//callback fires in response to a request displaying a json of the current chain at the localhost
app.get('/api/blocks', (req, res) => {
    //reply to an api request with the 'response' of res as the chain in json form
    res.json(blockchain.chain);

});

//sends data to the application
app.post('/api/mine', (req, res) =>{
    //gets data in the form of a json body and adds it to the blockchain object
    const { data } = req.body;

    //broadcasts the new change to all other blockchains within the network through sub/pub
    blockchain.addBlock({data});
    pubsub.broadcastChain();

    res.redirect('/api/blocks');

});

app.post('/api/transact', (req, res) =>{
    //get amount and recipient from request body
    const {amount, recipient} = req.body;

    let transaction;

    try {
        //create a new transaction from the local wallet with this data
        transaction = wallet.createTransaction({recipient, amount});
    } catch(error){
        //if transaction cannot be created throw an error and respond to the request with the json of it
        return res.status(400).json({type: 'error', message: error.message});
    }

    //send this transaction to the pool
    transactionPool.setTransaction(transaction);

    console.log('transactionPool: ' + transactionPool);

    //respond with a json of the transaction
    res.json({type: 'sucess', transaction});
})


const syncChains = () => {
    request({url: ROOT_NODE_ADDRESS + '/api/blocks'}, (error, response, body) => {
        if (!error && response.statusCode  === 200){
            const root = JSON.parse(body);
            blockchain.replaceChain(root);
            console.log('replace chain on a sync with' + root);
        }else{
            console.log('There was an error with response: ' + response.statusCode);
        }

    });
}
//Starts the app and listens to api requests on port 3000

let PEER_PORT;

//runs with dev-peer command set in package and changes port
if (process.env.GENERATE_PEER_PORT === 'true'){
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);

}

//if peer_port is undefined use default
const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () =>{
    console.log('listening at localhost:' + PORT);

    //prevents from sync with itself
    if (PORT != DEFAULT_PORT){
        syncChains();
    }


});