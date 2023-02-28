const getPermissions=require("../modules/authentication/functions/getPermissions.js");module.exports={execute({end:e,middlewareData:i}){e(JSON.stringify(getPermissions(i.authentication)))}};
