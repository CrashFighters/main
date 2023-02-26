export function get(): database;
export function set(database: database): void;

type database = {
    communities: {
        [communityId: string]: community;
    };
};

type community = {
    posts: {
        [postId: string]: post;
    };
    id: string;
    name: string;
    owner: string;
};

type post = {
    votes: {
        [userId: string]: vote;
    };
    id: string;
    user: string; //todo: rename to owner
    message: string; //todo: rename to content
    visibility: 'pending' | 'verified' | 'flagged' | 'hidden';
    visibilityAuthor: 'automatic' | 'manual';
    perspective: perspective;
};

type vote = {
    //todo: add separate id value
    user: string; //todo: rename to owner
    isUpvote: boolean;
};

type perspective = {
    languages: string[];
    attributes: {
        IDENTITY_ATTACK: number,
        TOXICITY: number,
        INSULT: number,
        THREAT: number,
        PROFANITY: number,
        SEVERE_TOXICITY: number
    };
};