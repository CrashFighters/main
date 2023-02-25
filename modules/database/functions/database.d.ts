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
    id: string;
    user: string; //todo: change to owner
    message: string;
    votes: {
        [userId: string]: vote;
    };
    perspective: perspective;
};

type vote = {
    //todo: add separate id value
    user: string; //todo: change to owner
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