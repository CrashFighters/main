const fs=require("fs"),settings=require("../settings.json");module.exports={execute(e){e||(e="");let s=fs.readFileSync(`.${settings.path.files.console}`);s=`${s}${e}\n`,fs.writeFileSync(`.${settings.path.files.console}`,s),console.warn(e)}};
