export function get(): database;
export function set(database: database): void;

type database = {
    communities: {
        [communityName: string]: community;
    };
};

type community = {
    posts: post[];
    id: string;
    name: string;
    owner: string;
};

type post = {
    id: string;
    user: string;
    message: string;
    votes: vote[];
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