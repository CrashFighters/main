const { get, set } = require('../../database/functions/database.js');
const perspective = require('./perspective.js');

const fs = require('fs');
const path = require('path');

if (!fs.existsSync(path.resolve(__dirname, '../data/queue.json')))
    fs.writeFileSync(path.resolve(__dirname, '../data/queue.json'), JSON.stringify([]));

module.exports = async () => {
    setTimeout(execute, 1500);
}

async function execute() {
    const queue = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/queue.json')).toString());
    if (queue.length === 0) return setTimeout(execute, 0);

    const { community, post } = queue[0];
    console.log('Processing', community, post)

    const db = await get();
    const dbPost = db.communities?.[community]?.posts?.[post];

    if (dbPost) {
        const result = await perspective(dbPost.message);
        dbPost.perspective = result;
        await set(db);
    }

    const newQueue = queue.slice(1);
    fs.writeFileSync(path.resolve(__dirname, '../data/queue.json'), JSON.stringify(newQueue));

    setTimeout(execute, 1500); // Perspective API has a rate limit of 60 requests per minute, so with 1.5s we're safe
}