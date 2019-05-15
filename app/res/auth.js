const {AUTH_TABLE_FILENAME} = require("../constants");
const fs = require("fs");
const path = require("path");

function loadData(){
   let loadedData = []
   if( fs.existsSync(path.join(".", "data", AUTH_TABLE_FILENAME)) ){
       loadedData = fs.readFileSync(path.join("data", AUTH_TABLE_FILENAME), {encoding:"utf8"})
       
       try{
           loadedData = JSON.parse(loadedData);
       }catch(Error){
           loadedData = []
       }
   }

   return loadedData;
}

function addNewUser(userData, successCallback, failureCallback){
    let loadedData = [...loadData(), userData];
    if( !fs.existsSync(path.join(".", "data", AUTH_TABLE_FILENAME)) ){
        fs.mkdirSync("./data");
    }
    fs.writeFile(path.join(".", "data", AUTH_TABLE_FILENAME), JSON.stringify(loadedData), function(err){
        if(err){
            if(failureCallback && failureCallback instanceof Function){
                failureCallback(err)
            }
        }else{
            if(successCallback && successCallback instanceof Function){
                successCallback(loadedData);
            }
        }
    });
}

function getAllUsers(){
    return loadData();
}

function authenticateUser(username, password){
    let pwdHash = password;
    let users = getAllUsers();
    for (let user of users){
        if(user.username == username && user.password == pwdHash){
            return true;
        }
    }

    return false;
}

module.exports = {
    getAllUsers,
    authenticateUser,
    addNewUser
}