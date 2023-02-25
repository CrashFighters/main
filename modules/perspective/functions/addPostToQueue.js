const queue = require('../data/queue.json');

module.exports = ({ community, post }) => {
    queue.push({ community, post });
};