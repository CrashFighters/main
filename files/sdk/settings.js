import {
    updateProfile
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const { updateUserObject, onStateChangeCallbacks, firebase: { auth } } = (await import('/sdk/auth.js'))._;

export const setDisplayName = async (displayName) => {
    if (!window.auth.user)
        throw new Error('User is not logged in')

    await updateProfile(auth.currentUser, {
        displayName
    });
    updateUserObject(auth.currentUser);
    for (const callback of onStateChangeCallbacks)
        callback(window.auth.user);
};

export const setPicture = async (picture) => {
    if (!window.auth.user)
        throw new Error('User is not logged in')

    await updateProfile(auth.currentUser, {
        photoURL: picture
    });
    updateUserObject(auth.currentUser);
    for (const callback of onStateChangeCallbacks)
        callback(window.auth.user);
};