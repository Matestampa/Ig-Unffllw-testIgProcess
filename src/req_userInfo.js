const fetch=require("node-fetch");

const HEADERS={
    "accept": "*/*",
    "accept-language": "es-ES,es;q=0.9,en;q=0.8",
    "dpr": "1.25",
    "sec-ch-prefers-color-scheme": "dark",
    "sec-ch-ua": "\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
    "sec-ch-ua-full-version-list": "\"Chromium\";v=\"118.0.5993.70\", \"Google Chrome\";v=\"118.0.5993.70\", \"Not=A?Brand\";v=\"99.0.0.0\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-model": "\"\"",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-ch-ua-platform-version": "\"10.0.0\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "viewport-width": "883",
    "x-asbd-id": "129477",
    "x-ig-app-id": "936619743392459",
    "x-ig-www-claim": "hmac.AR3eCCGBUzr8zDNp3e3GgRImPDGr4m9EUyUBTIKOg9bGIXdB",
    "x-requested-with": "XMLHttpRequest",
    "Referrer-Policy": "strict-origin-when-cross-origin"
}


const BASE_URL="https://www.instagram.com/api/v1/users/web_profile_info/?username="


async function userInfo_igRequest(username,auth_cookies,auth_headers){
    
    let headers={
        "cookie":auth_cookies,
        ...auth_headers,
        ...HEADERS,
    }

    let URL=BASE_URL+username
    
    let data;
    try{
        let response=await fetch(URL,{
            "headers":headers,
            "body":null,
            "method":"GET"
        })
    
        //console.log(response);
    
        data=await response.json();
        //console.log(data);
    }

    catch(e){
        console.log(e);
        return;
    }
    
    let id=data.data.user.id;
    let cant_followers=data.data.user.edge_followed_by.count;
    let isPrivate=data.data.user.is_private

    return {id:id,cant_followers:cant_followers,isPrivate:isPrivate};


}

module.exports={userInfo_igRequest};