import {
    getIdToken
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const { auth } = (await import('/sdk/auth.js'))._.firebase;

export const _ = {
    async getRequestOptions() {
        const userIdToken = await getIdToken(auth.currentUser);

        return {
            headers: {
                auth_token: userIdToken
            }
        }

    }
};