const express = require('express');
const Blockchain = require('./blockchain');
const bodyParser = require('body-parser');
const PubSub = require('./pubsub');

//Creates a new express webapp
const app = express();

//Creates a new blockchain
const blockchain = new Blockchain();

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


//Starts the app and listens to api requests on port 3000
const DEFAULT_PORT = 3000;
let PEER_PORT;

//runs with dev-peer command set in package and changes port
if (process.env.GENERATE_PEER_PORT === 'true'){
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);

}

//if peer_port is undefined use default
const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () =>{
    console.log('listening at localhost:' + PORT);

});