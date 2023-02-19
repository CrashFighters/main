const fs=require("fs"),settings=require("../../settings.json");module.exports={execute:e=>fs.existsSync(`${settings.generic.path.files.modules}${e}/`)};
