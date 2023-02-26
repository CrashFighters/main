console.log('Running perspective container');

const { get, set } = require('../../database/functions/database.js');
const perspective = require('./functions/perspective.js');

const fs = require('fs');
const path = require('path');

const wait = ms => new Promise(res => setTimeout(res, ms));

if (!fs.existsSync(path.resolve(__dirname, '../data/queue.json')))
    fs.writeFileSync(path.resolve(__dirname, '../data/queue.json'), JSON.stringify([]));

(async () => {
    while (true) {
        await wait(1500); // Perspective API has a rate limit of 60 requests per minute, so with 1.5s we're safe
        await execute();
    }
})();

async function execute() {
    const queue = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/queue.json')).toString());
    if (queue.length === 0) return;

    console.log()
    console.log('\x1b[31m\x1b[1m', 'Queue:', queue.length, '\x1b[0m') // red, bright, reset

    const { community, post } = queue[0];

    console.log()
    console.log(community, post)
    console.log('Getting post from database...')

    const db = await get();
    const dbPost = db.communities?.[community]?.posts?.[post];

    if (dbPost) {
        console.log('Running perspective...')
        const result = await perspective(dbPost.message);

        console.log('Saving to database...')
        dbPost.perspective = result;
        await set(db);
    } else
        console.log('Post not found in database. Skipping...')

    console.log('Updating queue...')
    const newQueue = queue.slice(1);
    fs.writeFileSync(path.resolve(__dirname, '../data/queue.json'), JSON.stringify(newQueue));
}