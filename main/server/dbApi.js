const { get, set } = require('../../modules/database/functions/database.js');
const parseErrorOnline = require('../functions/error/parseErrorOnline.js').execute;
const addPostToQueue = require('../../modules/perspective/functions/addPostToQueue.js');

const statusCode = (response, code, { text, short }) => {
    response.writeHead(code, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({
        successful: `${code}`.startsWith('2'),
        code,
        text,
        short
    }));
}

module.exports = {
    execute(request, response, { middlewareData }) {
        const parseError = (error, customText) => parseErrorOnline(error, response, customText);

        try {
            const { path, params } = require('../functions/parse/dbApiCall.js').execute(request);
            const { authentication } = middlewareData;

            const db = get();

            doApiCall({
                db,
                set,
                path,
                params,
                method: request.method,
                userId: authentication?.uid,
                end: json => {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify(json));
                },
                statusCode: (code, { text, short }) => statusCode(response, code, { text, short }),
                require: ({ name, type }, { community, post }, checkTypes) => {
                    if (checkTypes.includes('correctType') && !params[name]) {
                        statusCode(response, 400, { text: `Missing parameter ${name}`, short: 'missingParameter' });
                        return false;
                    }

                    if (type === 'communityId') {
                        const community = db.communities[params[name]];

                        if (checkTypes.includes('correctType') && !community) {
                            statusCode(response, 404, { text: `No community found with id ${params[name]}`, short: 'communityNotFound' });
                            return false;
                        }
                        if (checkTypes.includes('allowChange') && community.owner !== authentication.uid) {
                            statusCode(response, 403, { text: `You do not have the permission to change community ${params[name]}`, short: 'noPermission' });
                            return false;
                        }
                    } else if (type === 'postId') {
                        if (!community)
                            throw new Error("Can't get post without community");

                        const post = db.communities[community].posts[params[name]];

                        if (checkTypes.includes('correctType') && !post) {
                            statusCode(response, 404, { text: `No post found with id ${params[name]} in community ${community}`, short: 'postNotFound' });
                            return false;
                        }
                        if (checkTypes.includes('allowChange') && post.user !== authentication.uid) {
                            statusCode(response, 403, { text: `You do not have the permission to change post ${params[name]} in community ${community}`, short: 'noPermission' });
                            return false;
                        }
                    } else if (type === 'voteId') {
                        if (!community)
                            throw new Error("Can't get vote without community");

                        if (!post)
                            throw new Error("Can't get vote without post");

                        const vote = db.communities[community].posts[post].votes[params[name]];

                        if (checkTypes.includes('correctType') && !vote) {
                            statusCode(response, 404, { text: `No vote found with index ${params[name]} in post ${post} in community ${community}`, short: 'voteNotFound' });
                            return false;
                        }
                        if (checkTypes.includes('allowChange') && vote.user !== authentication.uid) {
                            statusCode(response, 403, { text: `You do not have permission to change vote ${params[name]} in post ${post} in community ${community}`, short: 'noPermission' });
                            return false;
                        }
                    } else if (type === 'communityName') {
                        if (checkTypes.includes('correctType')) {
                            const value = params[name];
                            const correctType = value.length > 2 && value.length <= 20 && value.match(/^[a-zA-Z0-9_\- ]+$/);

                            if (!correctType) {
                                statusCode(response, 400, { text: 'Invalid community name', short: 'invalidCommunityName' });
                                return false;
                            }
                        }
                    } else if (type === 'postMessage') {
                        if (checkTypes.includes('correctType')) {
                            const value = params[name];
                            const correctType = value.length > 10 && value.length <= 500;

                            if (!correctType) {
                                statusCode(response, 400, { text: 'Invalid post message', short: 'invalidPostMessage' });
                                return false;
                            }
                        }
                    } else if (type === 'boolean') {
                        if (checkTypes.includes('correctType'))
                            if (typeof params[name] !== 'boolean') {
                                statusCode(response, 400, { text: `Parameter ${name} must be a boolean`, short: 'invalidParameter' });
                                return false;
                            }
                    } else
                        throw new Error(`Unknown type ${type}`)

                    return true;
                }
            });

        } catch (err) {
            parseError(err);
        }
    }
}

function doApiCall({ db, set, path, params, method, require, end, statusCode, userId }) {
    if (path === '/community') {
        if (method === 'GET') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;

            end(db.communities[params.community]);
        } else if (method === 'DELETE') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType', 'allowChange']))
                return;

            delete db.communities[params.community];

            set(db);

            statusCode(204, { text: 'Community deleted', short: 'deleted' });
        } else if (method === 'PUT') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType', 'allowChange']))
                return;

            if (!require({ name: 'name', type: 'communityName' }, {}, ['correctType']))
                return;

            db.communities[params.community].name = params.name;

            set(db);

            end(db.communities[params.community]);
        } else if (method === 'POST') {
            if (!require({ name: 'name', type: 'communityName' }, {}, ['correctType']))
                return;

            if (!db.communities) db.communities = {}

            let id;
            while (!id || db.communities[id])
                id = Math.random().toString(36).substr(2, 9);

            db.communities[id] = {
                posts: {},
                id,
                name: params.name,
                owner: userId
            };

            set(db);

            end(db.communities[id]);
        }
    } else if (path === '/communities') {
        if (method === 'GET') {
            end(Object.keys(db.communities));
        } else {
            statusCode(405, { text: 'Method not allowed', short: 'invalidMethod' });
            return;
        }
    } else if (path === '/post') {
        if (method === 'GET') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;
            if (!require({ name: 'post', type: 'postId' }, { community: params.community }, ['correctType']))
                return;

            end(db.communities[params.community].posts[params.post]);
        } else if (method === 'DELETE') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;
            if (!require({ name: 'post', type: 'postId' }, { community: params.community }, ['correctType', 'allowChange']))
                return;

            delete db.communities[params.community].posts[params.post];

            set(db);

            statusCode(204, { text: 'Post deleted', short: 'deleted' });
        } else if (method === 'PUT') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;
            if (!require({ name: 'post', type: 'postId' }, { community: params.community }, ['correctType', 'allowChange']))
                return;

            if (!require({ name: 'message', type: 'postMessage' }, { community: params.community }, ['correctType']))
                return;

            db.communities[params.community].posts[params.post].message = params.message;

            set(db);

            end(db.communities[params.community].posts[params.post]);
        } else if (method === 'POST') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;
            if (!require({ name: 'message', type: 'postMessage' }, { community: params.community }, ['correctType']))
                return;

            if (!db.communities[params.community].posts) db.communities[params.community].posts = {};
            const posts = db.communities[params.community].posts;

            let id;
            while (!id || posts[id])
                id = Math.random().toString(36).substr(2, 9);

            posts[id] = {
                votes: {},
                id,
                message: params.message,
                user: userId,
                perspective: null
            };

            addPostToQueue({ community: params.community, post: id });

            end(db.communities[params.community].posts[id]);
        }
    } else if (path === '/posts') {
        if (method === 'GET') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;

            end(Object.keys(db.communities[params.community].posts));
        } else {
            statusCode(405, { text: 'Method not allowed', short: 'invalidMethod' });
            return;
        }
    } else if (path === '/vote') {
        if (method === 'GET') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;
            if (!require({ name: 'post', type: 'postId' }, { community: params.community }, ['correctType']))
                return;
            if (!require({ name: 'vote', type: 'voteId' }, { community: params.community, post: params.post }, ['correctType']))
                return;

            end(db.communities[params.community].posts[params.post].votes[params.vote]);
        } else if (method === 'DELETE') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;
            if (!require({ name: 'post', type: 'postId' }, { community: params.community }, ['correctType']))
                return;
            if (!require({ name: 'vote', type: 'voteId' }, { community: params.community, post: params.post }, ['correctType', 'allowChange']))
                return;

            delete db.communities[params.community].posts[params.post].votes[params.vote];

            set(db);

            statusCode(204, { text: 'Post deleted', short: 'deleted' });
        } else if (method === 'PUT') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;
            if (!require({ name: 'post', type: 'postId' }, { community: params.community }, ['correctType']))
                return;
            if (!require({ name: 'vote', type: 'voteId' }, { community: params.community, post: params.post }, ['correctType', 'allowChange']))
                return;

            if (!require({ name: 'isUpVote', type: 'boolean' }, { community: params.community, post: params.post, vote: params.vote }, ['correctType']))
                return;

            db.communities[params.community].posts[params.post].votes[params.vote] = params.isUpVote;

            set(db);

            end(db.communities[params.community].posts[params.post]);
        } else if (method === 'POST') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;
            if (!require({ name: 'post', type: 'postId' }, { community: params.community }, ['correctType']))
                return;

            if (!db.communities[params.community].posts[params.post].votes) db.communities[params.community].posts[params.post].votes = {};
            const votes = db.communities[params.community].posts[params.post].votes;

            if (votes[userId]) {
                statusCode(400, { text: 'You have already voted', short: 'voted' });
                return;
            }

            votes[userId] = {
                user: userId,
                isUpVote: params.isUpVote
            };

            end(db.communities[params.community].posts[params.post].votes[userId]);
        }
    } else if (path === 'GET') {
        if (method === 'GET') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;
            if (!require({ name: 'post', type: 'postId' }, { community: params.community }, ['correctType']))
                return;

            end(Object.keys(db.communities[params.community].posts[params.post].votes));
        } else {
            statusCode(405, { text: 'Method not allowed', short: 'invalidMethod' });
            return;
        }
    } else {
        statusCode(404, { text: 'Endpoint not found', short: 'endpointNotFound' });
        return;
    }
}