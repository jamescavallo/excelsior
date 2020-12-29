const EC = require('elliptic').ec;
const cryptoHash = require('./crypto-hash');

const ec = new EC('secp256k1');

const verifySignature = ({publicKey, data, signature}) => {
    //creates key object from key
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');

    //uses ec object to verify a signature based on hashed data
    return keyFromPublic.verify(cryptoHash(data), signature);

}

module.exports = {ec, verifySignature, cryptoHash};