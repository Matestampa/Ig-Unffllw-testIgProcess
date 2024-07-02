const {APP_VARS}=require("./config.js");

const {JsonFile_Access,sleep}=require("./utils.js");

const {userInfo_igRequest}=require("./req_userInfo.js");
const {followers_igRequest}=require("./followers_request.js");


const TEST_USERNAME="matestamparin";
const TEST_USER_ID=3407050365; //(matestamparin)

async function test_AllProcess(){
    const JsonAccess=new JsonFile_Access(APP_VARS.igAccounts_file);

    let ACCOUNTS_DATA=JsonAccess.read();
    console.log(Object.keys(ACCOUNTS_DATA));

    let AccountsUse_Manager=create_AccountsUse_Manager(ACCOUNTS_DATA);
    
    let accountKey;
    
    //----------------- Traer user info -----------------------------------------------
    //Cuenta para hacer la request.
    accountKey=AccountsUse_Manager.get_availAccount();
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
        console.log(error);
        console.log("Account fail:",accountKey);
        return;
    }
    
    console.log(user_info);
    let user_id=user_info.id;
    
    await(sleep(5000))  //esperar un tiempo para lo de followers (como seria en la pag)
    //------------------ Traer followers -------------------------------------------------
    console.log("STARTING FOLLOWERS");
    let followers={};
    let cursor;
    
    //Hacemos las requests para traer de a poco los followers
    do{ 
        
        //Cuenta para hacer la request.
        accountKey=AccountsUse_Manager.get_availAccount();
        
        console.log(`Cuenta actual:${accountKey}`);

        //Si ya no hay cuentas disponibles
        if (!accountKey){
            throw new Error("No available Accounts");
        }

        let accountAuth=ACCOUNTS_DATA[accountKey]["auth"]
        let accountProxy=ACCOUNTS_DATA[accountKey]["proxy"];

        //hacer la request
        let data={};
        
        try{
            data=await followers_igRequest(user_id,cursor,accountAuth.cookies,accountProxy.url);
        } 
        
        //Ver si tiro errror la req
        catch(error){
            console.log(error);
            console.log("Account fail:",accountKey);
            return;
        }
        
        //Si no, vamos agregando los followers.
        
        followers={...followers,...data.followers};

        cursor=data.cursor;
        
        //console.log(data.followers);
        console.log("Cursor desde tutee",cursor);
        
        //Ponemos un rate-limiting
        if (req_cont%3==0){ //si llego a 3 req seguidas
            await sleep(randNum(2000,2300))
        }
        else{ //el resto
           await sleep(randNum(1000,1300));
        }

        /*Chequear limit de request para test
        req_cont++;
        if (req_cont>=cantReq){
            break
        }*/
    }
    
    //Mientras el cursor siga teniendo contenido(es decir q todavia falten por traer)
    while(cursor!="");

    let totalFollowers=Object.keys(followers).length;
    console.log("Cant followers:",totalFollowers);

}


//------------------------- UTILS -------------------------------------------

function create_AccountsUse_Manager(accounts_data){
    let accounts_keys=[];
    
    //Solo metemos las keys de las account q esten activas
    for (let key of Object.keys(accounts_data)){
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

test_AllProcess();
