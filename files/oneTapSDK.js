import {
    GoogleAuthProvider,
    signInWithCredential
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const { app, auth } = window.firebase;

window.googleSignInCallback = (a) => {
    signInWithCredential(auth, GoogleAuthProvider.credential(a.credential));
};

document.body.innerHTML += `
<div id="g_id_onload" data-client_id="478395146629-9g1so59tp8p4iqn61g3iruksa99rmk0l.apps.googleusercontent.com"
    data-context="signin" data-ux_mode="popup" data-callback="googleSignInCallback" data-auto_select="true"
    data-close_on_tap_outside="false" data-itp_support="true">
</div>
`;

let script = document.createElement('script');
script.src = 'https://accounts.google.com/gsi/client';
document.head.appendChild(script);