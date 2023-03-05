/*

--fileRequirements--
/js/firebase.js
/js/performance.js
--endFileRequirements--

*/

import { getHeaders } from '/js/firebase.js';
import { startTrace, stopTrace } from '/js/performance.js';

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
            ...(await getHeaders())
        }
    });
    if ([401, 403].includes(response.status)) throw new Error('Unauthorized');
    const result = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(result));

    return result;
};

async function getRequest(path, params) {
    const response = await fetch(`/dbApi/${path}${paramsToQuery(params)}`, {
        method: 'GET',
        headers: {
            ...(await getHeaders())
        }
    });
    if ([401, 403].includes(response.status)) throw new Error('Unauthorized');
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
            ...(await getHeaders())
        }
    });
    if ([401, 403].includes(response.status)) throw new Error('Unauthorized');
    const result = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(result));

    return result;
};

async function deleteRequest(path, params) {
    const response = await fetch(`/dbApi/${path}${paramsToQuery(params)}`, {
        method: 'DELETE',
        headers: {
            ...(await getHeaders())
        }
    });
    if ([401, 403].includes(response.status)) throw new Error('Unauthorized');
    const result = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(result));

    return result;
};

class Database {
    constructor() {
        this.wait = this._init();
    }

    async refresh() {
        await this.wait;
        this.wait = this._init();
        await this.wait;
    }

    async _init() {

        startTrace('database_get_database')
        const communityIds = await getRequest('');
        stopTrace('database_get_database')

        const communityCache = {};

        const customCommunityProperties = {
            async create(properties) {

                startTrace('database_create_community')
                const community = await postRequest('community', properties);
                stopTrace('database_create_community')

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

                startTrace('database_delete_community')
                deleteRequest('community', { community: key })
                    .then(() => stopTrace('database_delete_community'));

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

        startTrace('database_get_community')
        const { posts: postIds, ...properties } = await getRequest('community', { community });
        stopTrace('database_get_community')

        const postCache = {};

        const customPostProperties = {
            async create(properties) {

                startTrace('database_create_post')
                const post = await postRequest('post', { community, ...properties });
                stopTrace('database_create_post')

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

                    startTrace('database_modify_community')
                    const newProperties = await putRequest('community', { community, properties: { [key]: newValue } });
                    stopTrace('database_modify_community')

                    if (newProperties)
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

                startTrace('database_delete_post')
                deleteRequest('post', { community, post: key })
                    .then(() => stopTrace('database_delete_post'));

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

        startTrace('database_get_post')
        const { votes: voteIds, ...properties } = await getRequest('post', { community, post });
        stopTrace('database_get_post')

        const voteCache = {};

        const customVoteProperties = {
            async create(properties) {

                startTrace('database_create_vote')
                const vote = await postRequest('vote', { community, post, ...properties });
                stopTrace('database_create_vote')

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

                    startTrace('database_modify_post')
                    const newProperties = await putRequest('post', { community, post, properties: { [key]: newValue } });
                    stopTrace('database_modify_post')

                    if (newProperties)
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

                startTrace('database_delete_vote')
                deleteRequest('vote', { community, post, vote: key })
                    .then(() => stopTrace('database_delete_vote'));

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

        startTrace('database_get_vote')
        const properties = await getRequest('vote', { community, post, vote });
        stopTrace('database_get_vote')

        for (const key of Object.keys(properties))
            Object.defineProperty(this, key, {
                configurable: false,
                enumerable: true,
                get: () => properties[key],
                set: async newValue => {
                    properties[key] = newValue;

                    startTrace('database_modify_vote')
                    const newProperties = await putRequest('vote', { community, post, vote, properties: { [key]: newValue } });
                    stopTrace('database_modify_vote')

                    if (newProperties)
                        for (const [name, value] of Object.entries(newProperties))
                            if (name in properties) properties[name] = value;
                }
            });


    }
}

//todo: create new Database or fetch Database again when authState changes
export default new Database();