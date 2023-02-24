import {
    getIdToken
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const { auth } = (await import('/sdk/auth.js'))._.firebase;

const getAuthHeaders = async () => ({
    auth_token: await getIdToken(auth.currentUser)
});

const paramsToQuery = params =>
    Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');

async function post(path, params) {
    const response = await fetch(`/dbApi/${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(await getAuthHeaders())
        },
        body: JSON.stringify(params)
    });
    const json = await response.json();

    return json;
};

async function get(path, params) {
    const response = await fetch(`/dbApi/${path}?${paramsToQuery(params)}`, {
        method: 'GET',
        headers: {
            ...(await getAuthHeaders())
        }
    });
    const json = await response.json();

    return json;
};

async function put(path, params) {
    const response = await fetch(`/dbApi/${path}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(await getAuthHeaders())
        },
        body: JSON.stringify(params)
    });
    const json = await response.json();

    return json;
};

async function del(path, params) {
    const response = await fetch(`/dbApi/${path}?${paramsToQuery(params)}`, {
        method: 'DELETE',
        headers: {
            ...(await getAuthHeaders())
        }
    });
    const json = await response.json();

    return json;
};

class Database {
    constructor() {
        this.wait = this._init();
    }

    async _init() {
        const communityIds = await get('');
        const communityCache = {};

        const customCommunityProperties = {
            async create(properties) {
                const community = await post('community', properties);
                communityCache[community] = new Community({ community });
                communityIds.push(community);

                return communityCache[community];
            }
        };

        this.communities = new Proxy({}, {
            ownKeys: () => Object.assign([], communityIds),
            has: (target, key) => communityIds.includes(key),
            get: (target, key) => {
                if (key in customCommunityProperties) return customCommunityProperties[key];

                if (!communityIds.includes(key)) return undefined;
                if (!(key in communityCache)) communityCache[key] = new Community({ community: key });

                return communityCache[key];
            },
            deleteProperty: (target, key) => {
                if (!communityIds.includes(key)) return false;

                communityIds.splice(communityIds.indexOf(key), 1);
                delete communityCache[key];
                del('community', { community: key });

                return true;
            }
        });
    }
}

class Community {
    constructor(inf) {
        this.wait = this._init(inf);
    }

    async _init({ community }) {
        const { posts: postIds, ...properties } = await get('community', { community });
        const postCache = {};

        const customPostProperties = {
            async create(properties) {
                const post = await post('post', properties);
                postCache[post] = new Post({ community, post });
                postIds.push(post);

                return postCache[post];
            }
        };

        for (const key of Object.keys(properties))
            Object.defineProperty(this, key, {
                configurable: false,
                enumerable: true,
                get: () => properties[key],
                set: newValue => {
                    properties[key] = newValue;
                    put('community', { community, ...properties });
                }
            });

        this.posts = new Proxy({}, {
            ownKeys: () => Object.assign([], postIds),
            has: (target, key) => postIds.includes(key),
            get: (target, key) => {
                if (key in customPostProperties) return customPostProperties[key];

                if (!postIds.includes(key)) return undefined;
                if (!(key in postCache)) postCache[key] = new Post({ community, post: key });

                return postCache[key];
            },
            deleteProperty: (target, key) => {
                if (!postIds.includes(key)) return false;

                postIds.splice(postIds.indexOf(key), 1);
                delete postCache[key];
                del('post', { community, post: key });

                return true;
            }
        });
    }
}

class Post {
    constructor(inf) {
        this.wait = this._init(inf);
    }

    async function({ community, post }) {
        const { votes: voteIds, ...properties } = await get('post', { community, post });
        const voteCache = {};

        const customVoteProperties = {
            async create(properties) {
                const vote = await post('vote', properties);
                voteCache[vote] = new Vote({ community, post, vote });
                voteIds.push(vote);

                return voteCache[vote];
            }
        };

        for (const key of Object.keys(properties))
            Object.defineProperty(this, key, {
                configurable: false,
                enumerable: true,
                get: () => properties[key],
                set: newValue => {
                    properties[key] = newValue;
                    put('post', { community, post, ...properties });
                }
            });

        this.votes = new Proxy({}, {
            ownKeys: () => Object.assign([], voteIds),
            has: (target, key) => voteIds.includes(key),
            get: (target, key) => {
                if (key in customVoteProperties) return customVoteProperties[key];

                if (!voteIds.includes(key)) return undefined;
                if (!(key in voteCache)) voteCache[key] = new Vote({ community, post, vote: key });

                return voteCache[key];
            },
            deleteProperty: (target, key) => {
                if (!voteIds.includes(key)) return false;

                voteIds.splice(voteIds.indexOf(key), 1);
                delete voteCache[key];
                del('vote', { community, post, vote: key });

                return true;
            }
        });
    }
}

class Vote {
    constructor(inf) {
        this.wait = this._init(inf);
    }

    async _init({ community, post, vote }) {
        const properties = await get('vote', { community, post, vote });

        for (const key of Object.keys(properties))
            Object.defineProperty(this, key, {
                configurable: false,
                enumerable: true,
                get: () => properties[key],
                set: newValue => {
                    properties[key] = newValue;
                    put('vote', { community, post, vote, ...properties });
                }
            });


    }
}

export default new Database();