const {AUTH_TABLE_FILENAME} = require("../constants");
const fs = require("fs");
const path = require("path");

/**
 * Loads and returns user authentication data from the data store
 */
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

//Helper function to write object to a file
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

/**
 * Adds a new user to the list of existing users and saves it in the data store.
 * @param {Object} userData 
 * @param {Function} callback 
 */
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

/**
 * Updates a given user's password. The callback is called with two arguments,
 * the first being all the user authentication data if the update succeeded and
 * the second being the error message otherwise.
 * 
 * @param {string} userName 
 * @param {string} newPassword 
 * @param {Function} callback 
 */
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

function updateUserCredentials(currentUser, newAuthData, callback){
    let authData = loadAuthData();
    authData = authData instanceof Array? authData : []
    authData = authData.filter((elt, ind)=>elt.userName!==currentUser);
    authData = [...authData, newAuthData];
    const fpath = path.join(".", "data", AUTH_TABLE_FILENAME);
    if( !fs.existsSync(fpath) ){
        fs.mkdirSync("./data");
    }
    writeToFile(fpath, authData, callback)
}

module.exports = {
    getAllUsers,
    addNewUser,
    updateUserPassword,
    updateUserCredentials
}