const dotenv=require("dotenv");
const {join}=require("path")
const minimist=require("minimist");

//--------------------- Traer .env ----------------------------------
let env_absPath=join(__dirname,`../.env.${process.env.APP_ENV}`);
dotenv.config({path:env_absPath});

//--------------------- Traer args ---------------------------------
let args=minimist(process.argv.slice(2));


const APP_VARS={
    igAccounts_file:process.env.IG_ACCOUNTS_FILE,
    lastAccount_file:process.env.LAST_ACCOUNT_FILE,
    test_username:args.username
}

console.log(APP_VARS);

module.exports={APP_VARS};