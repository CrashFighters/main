const firebase=require("../../../modules/authentication/functions/authentication.js");module.exports={async execute({request:t,parseError:e}){try{const e=t.headers.auth_token;if(!e)return{authenticated:!1};try{return{authenticated:!0,authentication:await firebase.auth().verifyIdToken(e,!0)}}catch{return{authenticated:!1,authentication:null}}}catch(t){e(t)}}};
