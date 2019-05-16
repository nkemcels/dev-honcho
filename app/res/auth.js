const {AUTH_TABLE_FILENAME} = require("../constants");
const fs = require("fs");
const path = require("path");

function loadAuthData(){
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

function writeToFile(filepath, data, callback){
    
    fs.writeFile(filepath, JSON.stringify(data), function(err){
        if(err){
            if(callback && callback instanceof Function){
                callback(null, err)
            }
        }else{
            if(callback && callback instanceof Function){
                callback(data, null);
            }
        }
    });
}

function addNewUser(userData, callback){
    let loadedData = [...loadAuthData(), userData];
    const fpath = path.join(".", "data", AUTH_TABLE_FILENAME);
    if( !fs.existsSync(fpath) ){
        fs.mkdirSync("./data");
    }
    writeToFile(fpath, loadedData, callback)
}

function getAllUsers(){
    return loadAuthData();
}

function updateUserPassword(userName, newPassword, callback){
    let authData = loadAuthData();
    let pwdUpdated = false;
    for (let user of authData){
        if (user.userName == userName){
            user.password = newPassword;
            pwdUpdated = true;
        }
    }

    if(pwdUpdated){
        const fpath = path.join(".", "data", AUTH_TABLE_FILENAME);
        writeToFile(fpath, authData, callback)
    }else{
        callback(null, "Could not update password")
    }
}

module.exports = {
    getAllUsers,
    addNewUser,
    updateUserPassword
}