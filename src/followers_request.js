const fetch=require("node-fetch");
const {HttpsProxyAgent}=require("https-proxy-agent");

const GEN_HEADERS={
    //"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept":"application/json",
    "accept-language": "es-ES,es;q=0.9,en;q=0.8",
    "cache-control": "max-age=0",
    "dpr": "1.25",
    "sec-ch-prefers-color-scheme": "dark",
    "sec-ch-ua": "\"Google Chrome\";v=\"117\", \"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"117\"",
    "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"117.0.5938.149\", \"Not;A=Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"117.0.5938.149\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-model": "\"\"",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-ch-ua-platform-version": "\"10.0.0\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "viewport-width": "883"
 };
 
const CONFIG={
      followers: {
         hash: 'c76146de99bb02f6415203be841dd25a',
         path: 'edge_followed_by'
      }
       
};
 
const GEN_PARAMS={
       "include_reel": true,
       "fetch_mutual": true,
       "first": 46
}
 
const BASE_URL="https://www.instagram.com/graphql/query/"
 
 
 
function generate_url(base_url,hash,params){
      return `${base_url}?query_hash=${hash}&variables=${encodeURIComponent(JSON.stringify(params))}`
}


//Return {data:{followers,next_cursor}, error}
async function followers_igRequest(user_id,cursor,auth_cookies,proxyUrl){
    
    let headers={
       "cookie":auth_cookies,
       ...GEN_HEADERS
    }
 
    let params={
       "id":user_id,
       ...GEN_PARAMS
    }

    const proxyAgent = new HttpsProxyAgent(proxyUrl);

    if (cursor){ params["after"]=cursor };

    let users_data_map={};
    
    let URL=generate_url(BASE_URL, CONFIG.followers.hash, params)
    console.log(URL);
    //return {followers:{},cursor:"tuteee"}
    
    let response,json_data;
    try{
        response=await fetch(URL,{
            "agent":proxyAgent,
            "headers":headers,
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body":null,
            "method":"GET"
        });

        //data de la response
        json_data=await response.json(); //---------------- CATCHEAR EL ERROR ACA ------
        
        if (json_data.require_login){
           throw new Error("not auth")
        }

    }
    
    catch(e){
        //igRequest_errorHandler(e);
        throw e;
    }
    
    //en que user se quedo, para saber a partir de cual traer despues
    let next_cursor=json_data.data.user.edge_followed_by.page_info.end_cursor;
    
    //objs de los users
    let nextUsers_data=json_data.data.user.edge_followed_by.edges;
    
    nextUsers_data.forEach((user)=>{
        users_data_map[user.node.id]=user.node.username;
    });
       
    //console.log(users_data_map);

    return {followers:users_data_map,cursor:next_cursor};

}


module.exports={followers_igRequest};
