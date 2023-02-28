const getMessages=require("../main/functions/get/messages");module.exports={execute({request:e,end:s}){const t=getMessages.execute({request:e}).mainFunction();s(JSON.stringify(t))}};
