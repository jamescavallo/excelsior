//Constants
const STARTING_BALANCE = 1000;
const initialDifficulty = 3;
const MINE_RATE = 1000;
const GENESIS_DATA = {
    timeStamp: '1',
    lastHash: '----',
    hash: 'hash one',
    difficulty: initialDifficulty,
    nonce: 0,
    data: []
};

const REWARD_INPUT = {
    address: '*authorized-reward*'
};

const MINING_REWARD = 50;

module.exports = {GENESIS_DATA, MINE_RATE, STARTING_BALANCE, REWARD_INPUT, MINING_REWARD};