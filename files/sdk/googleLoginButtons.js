window.googleSignInCallback = (a) => {
    signInWithCredential(auth, GoogleAuthProvider.credential(a.credential));
};

const smallButtons = document.getElementsByClassName('smallGoogleLoginButton');
const newSmallButton = document.createElement('div');
newSmallButton.className = 'g_id_signin';
newSmallButton.dataset.type = 'icon';
newSmallButton.dataset.shape = 'circle';
newSmallButton.dataset.theme = 'outline';
newSmallButton.dataset.text = 'signin_with';
newSmallButton.dataset.size = 'large';

for (const smallButton of smallButtons)
    smallButton.replaceWith(newSmallButton);

const bigButtons = document.getElementsByClassName('bigGoogleLoginButton');
const newBigButton = document.createElement('div');
newBigButton.className = 'g_id_signin';
newBigButton.dataset.type = 'standard';
newBigButton.dataset.shape = 'pill';
newBigButton.dataset.theme = 'outline';
newBigButton.dataset.text = 'signin_with';
newBigButton.dataset.size = 'large';
newBigButton.dataset.logo_alignment = 'left';

for (const bigButton of bigButtons)
    bigButton.replaceWith(newBigButton);

if (!document.getElementById('g_id_onload'))
    document.head.innerHTML += `
    <div id="g_id_onload"
        data-client_id="478395146629-9g1so59tp8p4iqn61g3iruksa99rmk0l.apps.googleusercontent.com"
        data-context="signin"
        data-ux_mode="popup"
        data-callback="googleSignInCallback"
        data-auto_prompt="false">
    </div>
    `;

if (!hasScriptLoaded('https://accounts.google.com/gsi/client')) {
    let script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    document.head.appendChild(script);
};

function hasScriptLoaded(url) {
    const scripts = [...document.getElementsByTagName('script')];
    return Boolean(scripts.find(script => script.src === url));
};