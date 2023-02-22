const fs=require("fs"),{readdirSync:readdirSync,existsSync:existsSync,statSync:statSync}=fs,isModuleInstalled=require("../../functions/isModuleInstalled").execute,parseErrorRaw=require("../../functions/error/parseErrorRaw").execute,evalErrors=require("../../functions/error/evalErrors").execute,messages=require("../../functions/get/messages").execute().mainFunction(),generic=require("../../../settings.json").generic,api={};for(const e of readdirSync(generic.path.files.modules))addApiCalls("/",generic.path.files.moduleApi.replace("{modules}",generic.path.files.modules).replace("{name}",e));function addApiCalls(e,r){if(existsSync(r))for(const s of readdirSync(r))if(statSync(`${r}${s}`).isDirectory())addApiCalls(`${e}${s}/`,`${r}${s}/`);else{const i=s.split(".js")[0],n=require(`../../../${r}${i}`);let a=!0;const l=[];if(n.dependencies&&n.dependencies.modules)for(const e of n.dependencies.modules)existsSync(`${generic.path.files.modules}${e}/`)||(a=!1,l.push(e));api[`${e}${i}`]={file:require(`../../../${r}${i}`),enabled:{dependencies:{installed:a,dependenciesNotInstalled:l}}},a||isModuleInstalled("text")&&(parseErrorRaw(new Error(messages.error.moduleNotInstalledForShort.replace("{api}",`${e}${i}`)),messages.error.moduleNotInstalledFor.replace("{api}",`${e}${i}`).replace("{dependency}",l.join(", "))),evalErrors())}}addApiCalls("/",generic.path.files.api),module.exports={execute:()=>api};
