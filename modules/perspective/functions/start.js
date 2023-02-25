const { get, set } = require('../../database/functions/database.js');
const perspective = require('./perspective.js');

const fs = require('fs');
const path = require('path');

const wait = ms => new Promise(res => setTimeout(res, ms));

module.exports = async () => {
    setTimeout(execute, 0);
}

async function execute() {
    await wait(1500); // Perspective API has a rate limit of 60 requests per minute, so with 1.5s we're safe

    if (require('../data/queue.json').length === 0) return setTimeout(execute, 0);
    const { community, post } = require('../data/queue.json')[0];

    const db = get();
    const dbPost = db.communities?.[community]?.posts?.[post];

    if (dbPost) {
        const result = await perspective(dbPost.message);
        dbPost.perspective = result;
        set(db);
    }

    const newQueue = require('../data/queue.json').slice(1);
    fs.writeFileSync(path.resolve(__dirname, '../data/queue.json'), JSON.stringify(newQueue));

    setTimeout(execute, 0);
}