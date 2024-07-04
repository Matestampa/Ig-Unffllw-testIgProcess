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

function getOrdered_AccountsArray(array, value) {
    let resultArray = [];
    let startIndex = array.indexOf(value)+1;
    
    if (startIndex==array.length){
        startIndex=0;
    }

    if (startIndex === -1) {
        // El valor no se encontró en el array
        return resultArray;
    }

    // Concatenar los valores desde el valor encontrado hasta el final del array
    resultArray = array.slice(startIndex);
    
    // Concatenar los valores desde el principio del array hasta justo antes del valor encontrado
    resultArray = resultArray.concat(array.slice(0, startIndex));

    return resultArray;
}

class Time_Calculator{
    constructor(){
        this.total_seconds=0;
        this.actual_time;
    }

    start(){
        this.start_time=new Date();
    };

    finish(){
        //CALCULAR DIFERENCIA.
        let time_difference=new Date() - this.start_time;
        let time_difference_secs=time_difference/1000
        this.total_seconds+=(time_difference_secs);

        console.log(`Time difference:${time_difference_secs}`);


    };

    get_summary(){
        return this.total_seconds;
    };

}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports={JsonFile_Access,getOrdered_AccountsArray,Time_Calculator,sleep};