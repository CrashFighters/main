const https=require("https"),{endpoint:endpoint,private:secret}=require("../credentials/recaptchaV3.json"),headers={"Content-Type":"application/x-www-form-urlencoded","Content-Length":null},allowedTokenCharacters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("");module.exports={async execute({params:e,end:n,statusCode:r,request:o,parseError:t}){try{if(!e.token)return r(400,"noTokenProvided","No token provided");if(526!==e.token.length)return r(400,"invalidToken","Invalid token");if(e.token.split("").some((e=>!allowedTokenCharacters.includes(e))))return r(400,"invalidToken","Invalid token");const t=Object.entries({secret:secret,response:e.token,remoteip:o.socket.remoteAddress}).map((([e,n])=>`${e}=${n}`)).join("&");headers["Content-Length"]=t.length;const s=await fetch(endpoint,{method:"POST",body:t,headers:headers}),i=await s.json();if(!i.success){if(i["error-codes"].includes("missing-input-secret")||i["error-codes"].includes("invalid-input-secret")||i["error-codes"].includes("bad-request"))throw new Error(`Recaptcha: Server has invalid config: ${i["error-codes"].join(", ")}`);return i["error-codes"].includes("missing-input-response")||i["error-codes"].includes("invalid-input-response")?r(400,"invalidToken","Invalid token"):i["error-codes"].includes("timeout-or-duplicate")?r(400,"tokenExpired","Token has expired or has already been used"):r(400,"unknown","Unknown error")}n(`${i.score}`)}catch(e){return t(e)}}};
