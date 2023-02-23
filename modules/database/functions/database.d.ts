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
    user: string;
    message: string;
    votes: {
        [userId: string]: vote;
    };
    perspective: perspective;
};

type vote = {
    user: string;
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