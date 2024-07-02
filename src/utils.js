const fs=require("fs");

//Acceso facil a los archivos json que tengamos
class JsonFile_Access{
    constructor(file_path){
        this.filePath=file_path;
    }
    
    //Esto traeria todo lo q hay en el file
    read(){

        let jsonString_data=fs.readFileSync(this.filePath);

        return JSON.parse(jsonString_data);
    }
    
    //Aca le pasariamos el coso en memoria, y lo meteria al json
    write(data){

        let jsonString_data=JSON.stringify(data);

        fs.writeFile(this.filePath,jsonString_data,(err)=>{
            if (err){
                console.log(err);
            }
        })

    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


module.exports={JsonFile_Access,sleep};