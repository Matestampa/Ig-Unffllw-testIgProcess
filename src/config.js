const dotenv=require("dotenv");
const {join}=require("path")

let env_absPath=join(__dirname,`../.env.${process.env.APP_ENV}`);
dotenv.config({path:env_absPath});


const APP_VARS={
    igAccounts_file:process.env.IG_ACCOUNTS_FILE
}

console.log(APP_VARS);

module.exports={APP_VARS};