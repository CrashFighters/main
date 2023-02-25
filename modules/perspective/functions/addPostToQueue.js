const fs = require('fs');
const path = require('path');

if (!fs.existsSync(path.resolve(__dirname, '../data/queue.json')))
    fs.writeFileSync(path.resolve(__dirname, '../data/queue.json'), JSON.stringify([]));

module.exports = ({ community, post }) => {
    console.log('added to queue', community, post)

    const queue = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/queue.json')).toString());

    queue.push({ community, post });

    fs.writeFileSync(path.resolve(__dirname, '../data/queue.json'), JSON.stringify(queue));
};