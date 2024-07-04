const {APP_VARS}=require("./config.js");

const {JsonFile_Access,getOrdered_AccountsArray,
       Time_Calculator,sleep}=require("./utils.js");

const {userInfo_igRequest}=require("./req_userInfo.js");
const {followers_igRequest}=require("./followers_request.js");


const TEST_USERNAME="miuchi.b";
const TEST_USER_ID=3407050365; //(matestamparin)

const MS_BTW_REQ=400;
const MS_BTW_REQGROUP=2000;

async function test_AllProcess(ACCOUNTS_DATA,AccountsUse_Manager,Time_Calc){

    let accountKey;
    //----------------- Traer user info -----------------------------------------------
    //Cuenta para hacer la request.
    accountKey=await AccountsUse_Manager.get_availAccount();
    console.log(`Cuenta actual:${accountKey}`);

    //Si ya no hay cuentas disponibles
    if (!accountKey){
        throw new Error("No available Accounts");
    }

    let accountAuth=ACCOUNTS_DATA[accountKey]["auth"]
    let accountProxy=ACCOUNTS_DATA[accountKey]["proxy"];
    
    //hacer la request.
    let user_info;
    try{
        user_info=await userInfo_igRequest(TEST_USERNAME,accountAuth.cookies,
                                     accountAuth.headers,accountProxy.url);
    }
    catch(e){
        console.log(e);
        console.log("Account fail:",accountKey);
        return accountKey;
    }
    
    console.log(user_info);
    let user_id=user_info.id;
    
    await(sleep(5000))  //esperar un tiempo para lo de followers (como seria en la pag)
    //------------------ Traer followers -------------------------------------------------
    console.log("STARTING FOLLOWERS");
    let followers={};
    let cursor;
    let req_cont=1;
    
    //Hacemos las requests para traer de a poco los followers
    do{ 
        
        //Cuenta para hacer la request.
        accountKey=await AccountsUse_Manager.get_availAccount();
        
        console.log(`Cuenta actual:${accountKey}`);
        console.log(`Req actual: ${req_cont}`);

        //Si ya no hay cuentas disponibles
        if (!accountKey){
            throw new Error("No available Accounts");
        }

        let accountAuth=ACCOUNTS_DATA[accountKey]["auth"]
        let accountProxy=ACCOUNTS_DATA[accountKey]["proxy"];

        //hacer la request
        let data={};
        
        try{
            Time_Calc.start()
            data=await followers_igRequest(user_id,cursor,accountAuth.cookies,accountProxy.url);
            Time_Calc.finish();
        } 
        
        //Ver si tiro errror la req
        catch(error){
            console.log(error);
            console.log("Account fail:",accountKey);
            break;
        }
        
        //Si no, vamos agregando los followers.
        
        followers={...followers,...data.followers};

        cursor=data.cursor;
        
        //console.log(data.followers);
        console.log("Cursor desde tutee",cursor);
        
        //Ponemos un rate-limiting
        if (req_cont%3==0){ //si llego a 3 req seguidas
            await sleep(randNum(MS_BTW_REQGROUP,MS_BTW_REQGROUP+1200))
        }
        else{ //el resto
           await sleep(randNum(MS_BTW_REQ,MS_BTW_REQ+200));
        }
        req_cont++
        
    }
    
    //Mientras el cursor siga teniendo contenido(es decir q todavia falten por traer)
    while(cursor!="");

    let totalFollowers=Object.keys(followers).length;
    console.log("Cant followers:",totalFollowers);

    return accountKey;

}


//------------------------- UTILS -------------------------------------------

function create_AccountsUse_Manager(accountsArr,accounts_data){
    let accounts_keys=[];
    
    //Solo metemos las keys de las account q esten activas
    for (let key of accountsArr){
        if (accounts_data[key].active){
            accounts_keys.push(key);
        }
    }
    return new IgAccountsUse_Manager(accounts_keys);
}


class IgAccountsUse_Manager{
    constructor(accounts_keys){
        this.accounts=[]; //arr con las keys
        this.accounts_data={}; //obj con las keys y su "data de uso"

        [this.accounts,this.accounts_data]=this.__initialize(accounts_keys);

        this.account_iterator=this.__iterator(this.accounts);
        
        //this.accounts=[key1,key2,key3]
        //this.accounts_data={key:{active,req_x_hr,last_time}}

        //el carrousel elije del arr la key, y con eso se trae la data del obj
    }

    __initialize(accounts_keys){
        //Esto deberia crear el obj con la data de las cuentas,
        //pero solo la data q tenga q ver con el uso.

        //ademas deberia crear el carrousel q usemos.
        //llenaer accounts_data y accounts
        accounts_keys.forEach(key=>{
            this.accounts.push(key);

            //Crear el obj si fuera necesario
            this.accounts_data[key]={};
        })

        return [this.accounts,this.accounts_data];
    }
    
    //Return key de la cuenta.
    get_availAccount(){
       let next_availAccount=this.account_iterator.next();

       return next_availAccount;
    }
    
    //
    enable_account(key){
        this.accounts.push(key);
    }
    
    //saca accounts de las posibles avail, y return cuantas avail quedan
    disable_account(key){
        //Sacar la key de la cuenta del array.

        for (let i=0;i<this.accounts.length;i++){
            if (this.accounts[i]==key){
                this.accounts.splice(i,1);
                break;
            }
        }

        return this.accounts.length;

    }

    __iterator(accounts){
        let index=0;
        return{
            next:function(){
                if(index>=accounts.length){
                    index=0;
                }
                return accounts[index++];
            }
        }
    }
}


function randNum(min,max){
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}


async function dale(){
    //leer archivo de ultima cuenta usada
    let lastAccJson=new JsonFile_Access(APP_VARS.lastAccount_file);
    let lastAcc=lastAccJson.read().account;
    

    //leer archivo de data de cuentas
    let AccDataJson=new JsonFile_Access(APP_VARS.igAccounts_file);
    let ACCOUNTS_DATA=AccDataJson.read();

    //hacer array ordenado
    let orderedArray=getOrdered_AccountsArray(Object.keys(ACCOUNTS_DATA),lastAcc);

    //Crear account use manager
    let AccountsUse_Manager=create_AccountsUse_Manager(orderedArray,ACCOUNTS_DATA);

    //llamar a la func con (data de cuentas,accounts use manager)
    let TimeCalculator=new Time_Calculator();
    lastAcc=await test_AllProcess(ACCOUNTS_DATA,AccountsUse_Manager,TimeCalculator);
    
    console.log(TimeCalculator.get_summary());

    //escribir ultima cuenta usada
    lastAccJson.write({"account":lastAcc})
}

dale();
