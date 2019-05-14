const {AUTH_TABLE_FILENAME} = require("../constants");
const fs = require("fs");
const path = require("path");

function loadData(){
   let loadedData = []
   if( fs.existsSync(path.join("data", AUTH_TABLE_FILENAME)) ){
       loadedData = fs.readFileSync(path.join("data", AUTH_TABLE_FILENAME))
   }

   return loadedData;
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
    authenticateUser
}