import { onStateChange } from '/sdk/auth.js';
const { getAuthHeaders } = (await import('/sdk/auth.js'))._;

const paramsToQuery = params =>
    params ?
        '?' + Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&') :
        '';

async function postRequest(path, params) {
    const response = await fetch(`/dbApi/${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            body: JSON.stringify(params),
            ...(await getAuthHeaders())
        }
    });
    const result = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(result));

    return result;
};

async function getRequest(path, params) {
    const response = await fetch(`/dbApi/${path}${paramsToQuery(params)}`, {
        method: 'GET',
        headers: {
            ...(await getAuthHeaders())
        }
    });
    const result = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(result));

    return result;
};

async function putRequest(path, params) {
    const response = await fetch(`/dbApi/${path}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            body: JSON.stringify(params),
            ...(await getAuthHeaders())
        }
    });
    const result = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(result));

    return result;
};

async function deleteRequest(path, params) {
    const response = await fetch(`/dbApi/${path}${paramsToQuery(params)}`, {
        method: 'DELETE',
        headers: {
            ...(await getAuthHeaders())
        }
    });
    const result = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(result));

    return result;
};

class Database {
    constructor() {
        this.wait = new Promise(res => {
            onStateChange(async () => {
                res(await this._init());
            })
        });
    }

    async refresh() {
        await this.wait;
        this.wait = this._init();
        await this.wait;
    }

    async _init() {
        const communityIds = await getRequest('');
        const communityCache = {};

        const customCommunityProperties = {
            async create(properties) {
                const community = await postRequest('community', properties);
                communityCache[community] = new Community({ community });
                communityIds.push(community);

                return communityCache[community];
            }
        };

        this.communities = new Proxy({}, {
            getOwnPropertyDescriptor: () => ({
                enumerable: true,
                configurable: true
            }),
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
                deleteRequest('community', { community: key });

                return true;
            }
        });
    }
}

class Community {
    constructor(inf) {
        this.wait = this._init(inf);
    }

    async refresh() {
        await this.wait;
        this.wait = this._init(this);
        await this.wait;
    }

    async _init({ community }) {
        const { posts: postIds, ...properties } = await getRequest('community', { community });
        const postCache = {};

        const customPostProperties = {
            async create(properties) {
                const post = await postRequest('post', properties);
                postCache[post] = new Post({ community, post });
                postIds.push(post);

                return postCache[post];
            }
        };

        for (const key of Object.keys(properties))
            Object.defineProperty(this, key, {
                configurable: true,
                enumerable: true,
                get: () => properties[key],
                set: async newValue => {
                    properties[key] = newValue;
                    const newProperties = await putRequest('community', { community, properties: { [key]: newValue } });
                    for (const [name, value] of Object.entries(newProperties))
                        if (name in properties) properties[name] = value;
                }
            });

        this.posts = new Proxy({}, {
            getOwnPropertyDescriptor: () => ({
                enumerable: true,
                configurable: true
            }),
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
                deleteRequest('post', { community, post: key });

                return true;
            }
        });
    }
}

class Post {
    constructor(inf) {
        this.wait = this._init(inf);
    }

    async refresh() {
        await this.wait;
        this.wait = this._init(this);
        await this.wait;
    }

    async _init({ community, post }) {
        const { votes: voteIds, ...properties } = await getRequest('post', { community, post });
        const voteCache = {};

        const customVoteProperties = {
            async create(properties) {
                const vote = await postRequest('vote', properties);
                voteCache[vote] = new Vote({ community, post, vote });
                voteIds.push(vote);

                return voteCache[vote];
            }
        };

        for (const key of Object.keys(properties))
            Object.defineProperty(this, key, {
                configurable: true,
                enumerable: true,
                get: () => properties[key],
                set: async newValue => {
                    properties[key] = newValue;
                    const newProperties = await putRequest('post', { community, post, properties: { [key]: newValue } });
                    for (const [name, value] of Object.entries(newProperties))
                        if (name in properties) properties[name] = value;
                }
            });

        this.votes = new Proxy({}, {
            getOwnPropertyDescriptor: () => ({
                enumerable: true,
                configurable: true
            }),
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
                deleteRequest('vote', { community, post, vote: key });

                return true;
            }
        });
    }
}

class Vote {
    constructor(inf) {
        this.wait = this._init(inf);
    }

    async refresh() {
        await this.wait;
        this.wait = this._init(this);
        await this.wait;
    }

    async _init({ community, post, vote }) {
        const properties = await getRequest('vote', { community, post, vote });

        for (const key of Object.keys(properties))
            Object.defineProperty(this, key, {
                configurable: false,
                enumerable: true,
                get: () => properties[key],
                set: async newValue => {
                    properties[key] = newValue;
                    const newProperties = putRequest('vote', { community, post, vote, properties: { [key]: newValue } });
                    for (const [name, value] of Object.entries(newProperties))
                        if (name in properties) properties[name] = value;
                }
            });


    }
}

export default new Database();