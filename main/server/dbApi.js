const { get, set } = require('../modules/database/functions/database.js');
const parseErrorOnline = require('../functions/error/parseErrorOnline.js').execute;

const statusCode = (response, code, { text, short }) => {
    response.writeHead(code, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({
        error: true,
        code,
        text,
        short
    }));
}

module.exports = {
    execute(request, response, { middleWareData, extraData }) {
        const parseError = (error, customText) => parseErrorOnline(error, response, customText);

        try {
            const { path, params } = require('../functions/parse/dbApiCall.js').execute(request.url);
            const { authentication, authenticated } = middleWareData;

            let db = get();

            doApiCall({
                db,
                set,
                path,
                params,
                method: request.method,
                require: (params, { community, post }, types) => {
                    for (const { name, type } of params) {
                        if (types.includes('correctType') && !params[name]) {
                            statusCode(response, 400, { text: `Missing parameter; ${name}`, short: 'missingParameter' });
                            return false;
                        }

                        if (type === 'communityId') {
                            const community = db.communities[params[name]];

                            if (types.includes('correctType') && !community) {
                                statusCode(response, 404, { text: `No community found with id ${params[name]}`, short: 'communityNotFound' });
                                return false;
                            }
                        } else if (type === 'postId') {
                            if (!community)
                                throw new Error("Can't get post without community");

                            const post = db.communities[community].posts[params[name]];

                            if (types.includes('correctType') && !post) {
                                statusCode(response, 404, { text: `No post found with id ${params[name]} in community ${community}`, short: 'postNotFound' });
                                return false;
                            }
                        } else if (type === 'voteIndex') {
                            if (!community)
                                throw new Error("Can't get vote without community");

                            if (!post)
                                throw new Error("Can't get vote without post");

                            const vote = db.communities[community].posts[post].votes[params[name]];

                            if (types.includes('correctType') && !vote) {
                                statusCode(response, 404, { text: `No vote found with index ${params[name]} in post ${post} in community ${community}`, short: 'voteNotFound' });
                                return false;
                            }
                        } else if (type === 'boolean') {
                            if (types.includes('correctType') && typeof params[name] !== 'boolean') {
                                statusCode(response, 400, { text: `Parameter ${name} is not a boolean`, short: 'notBoolean' });
                                return false;
                            }
                        } else if (type === 'string') {
                            if (types.includes('correctType') && typeof params[name] !== 'string') {
                                statusCode(response, 400, { text: `Parameter ${name} is not a string`, short: 'notString' });
                                return false;
                            }
                        } else
                            throw new Error(`Unknown type ${type}`)
                    }

                    return true;
                }
            })

            throw new Error('Not implemented');

        } catch (err) {
            parseError(err);
        }
    }
}

function doApiCall({ db, set, path, params, method, require }) {
    throw new Error('not implemented')
}