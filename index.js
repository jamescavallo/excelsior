const express = require('express');
const Blockchain = require('./blockchain');
const bodyParser = require('body-parser');
const PubSub = require('./pubsub');

const app = express();
const blockchain = new Blockchain();

//Create pubsub object with the current blockchain 
const pubsub = new PubSub({blockchain});

setTimeout(() => pubsub.broadcastChain(), 1000);


app.use(bodyParser.json());

//callback fires in response to a request displaying a json of the current chain at the localhost
app.get('/api/blocks', (req, res) => {
    //reply to an api request with the 'response' of res as the chain in json form
    res.json(blockchain.chain);

});

//sends data to the application
app.post('/api/mine', (req, res) =>{
    //gets data in the form of a json body and adds it to the blockchain object
    const { data } = req.body;

    //redirects the user to the get request
    blockchain.addBlock({data});
    res.redirect('/api/blocks');

});


//Starts the app and listens to api requests on port 3000
const PORT = 3000;
app.listen(PORT, () =>{
    console.log('listening at localhost:' + PORT);

});