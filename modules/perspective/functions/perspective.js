const{google:google}=require("googleapis"),{apiKey:apiKey,discoveryUrl:discoveryUrl}=require("../../../credentials/perspective.json");function analyzeAsync(e,r){return new Promise(((t,a)=>{e.comments.analyze({key:apiKey,resource:r},((e,r)=>{e?a(e):t(r.data)}))}))}module.exports=async e=>{const r=await google.discoverAPI(discoveryUrl),t={comment:{text:e},requestedAttributes:{TOXICITY:{},SEVERE_TOXICITY:{},IDENTITY_ATTACK:{},INSULT:{},PROFANITY:{},THREAT:{}}},a=await analyzeAsync(r,t);return{languages:a.languages,attributes:Object.fromEntries(Object.entries(a.attributeScores).map((([e,r])=>[e,r.summaryScore.value])))}};
