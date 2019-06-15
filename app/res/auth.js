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

function getServerInstance(userName, serverName){
    let userData = getUserData(userName);
    if (userData && userData.serverInstances){
        for(let serverInstance of userData.serverInstances){
            if(serverInstance.serverName == serverName){
                return serverInstance;
            }
        }
    }

    return null;
}

function getQuickRun(userName, quickRunLabel){
    let userData = getUserData(userName);
    if (userData && userData.quickRuns){
        for(let quickRun of userData.quickRuns){
            if(quickRun.qrLabel == quickRunLabel){
                return quickRun;
            }
        }
    }

    return null;
}

function getServerInstanceApp(userName, serverName, appName){
    let serverInstance = getServerInstance(userName, serverName);
    if(serverInstance && serverInstance.apps&&serverInstance.apps instanceof Array){
        for (let app of serverInstance.apps){
            if(app.appName == appName){
                return app;
            }
        }
    }

    return null;
}

function addNewServerInstance(userName, serverInstanceData, callback){
    let userData = getUserData(userName);
    let serverInstance = getServerInstance(userName, serverInstanceData.serverName);
    if(serverInstance){
        if(callback && callback instanceof Function){
            callback(null, "A Server Instance with that name already exist!");
        }
    }else{
        if(!userData.serverInstances){
            userData.serverInstances = [];
        }
        userData.serverInstances = [serverInstanceData, ...userData.serverInstances];
        replaceUserData(userName, userData, callback);
    }
}

function addNewServerInstanceApp(userName, serverInstanceName, appData, callback){
    let serverInstance = getServerInstance(userName, serverInstanceName);
    let serverInstanceApp = getServerInstanceApp(userName, serverInstanceName, appData.appName)
    if(serverInstanceApp){
        if(callback && callback instanceof Function){
            callback(null, "An App with that name is already registered for this server");
        }
    }else{
        if(!serverInstance.apps){
            serverInstance.apps = [];
        }
        serverInstance.apps = [...serverInstance.apps, appData];
        updateServerInstance(userName, serverInstanceName, serverInstance, callback)
    }
}

function addNewQuickRun(userName, quickRunData, callback){
    let userData = getUserData(userName);
    let quickRun = getQuickRun(userName, quickRunData.qrLabel);
    if(quickRun){
        if(callback && callback instanceof Function){
            callback(null, "A Quick Run with that label already exist!");
        }
    }else{
        if(!userData.quickRuns){
            userData.quickRuns = [];
        }
        userData.quickRuns = [quickRunData, ...userData.quickRuns];
        replaceUserData(userName, userData, callback);
    }
}

function updateServerInstance(userName, serverInstanceName, serverInstanceData, callback){
    if(serverInstanceName===null){
        addNewServerInstance(userName, serverInstanceData, callback);
        return;
    }
    let userData = getUserData(userName);
    if(userData.serverInstances ){
        const index = userData.serverInstances.findIndex(instance=>instance.serverName===serverInstanceName)
        if(Number.isInteger(index)){
            userData.serverInstances[index] = serverInstanceData
        }
    }
    replaceUserData(userName, userData, callback);
}

function updateQuickRuns(userName, quickRunLabel, qrData, callback){
    if(quickRunLabel===null){
        addNewQuickRun(userName, qrData, callback);
        return;
    }
    let userData = getUserData(userName);
    if(userData.quickRuns){
        const index = userData.quickRuns.findIndex(qr=>qr.qrLabel===quickRunLabel)
        if(Number.isInteger(index)){
            userData.quickRuns[index] = qrData
        }
    }
    replaceUserData(userName, userData, callback);
}

function updateServerInstanceApp(userName, serverInstanceName, serverInstanceApp, appData, callback){
    if(serverInstanceApp===null){
        addNewServerInstanceApp(userName,serverInstanceName, appData, callback);
        return;
    }
    let serverInstance = getServerInstance(userName, serverInstanceName);
    if(serverInstance.apps){
        const index = serverInstance.apps.findIndex(app=>app.appName===serverInstanceApp)
        if(Number.isInteger(index)){
            serverInstance.apps[index] = appData
        }
    }
    updateServerInstance(userName, serverInstanceName, serverInstance, callback);
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

function getUserData(userName){
    let authData = loadAuthData();
    for (let user of authData){
        if (user.userName == userName){
            return user;
        }
    }
}

function replaceUserData(userName, newAuthData, callback){
    let authData = loadAuthData();
    authData = authData instanceof Array? authData : []
    authData = authData.filter((elt, ind)=>elt.userName!==userName);
    authData = [...authData, newAuthData];
    const fpath = path.join(".", "data", AUTH_TABLE_FILENAME);
    if( !fs.existsSync(fpath) ){
        fs.mkdirSync("./data");
    }
    writeToFile(fpath, authData, callback)
}

function updateUserAuthCredentials(userName, newAuthData, callback){
    let userData = getUserData(userName);
    if(userData){
        userData = {...userData, ...newAuthData};
        replaceUserData(userName, userData, callback)
    }
}

function deleteServerInstance(userName, serverInstanceName, callback){
    let userData = getUserData(userName);
    if(userData.serverInstances ){
        userData.serverInstances = userData.serverInstances.filter((instance, ind)=>instance.serverName!==serverInstanceName);
    }
    replaceUserData(userName, userData, callback);
}

function deleteServerInstanceApp(userName, serverInstanceName, serverInstanceApp, callback){
    let serverInstance = getServerInstance(userName, serverInstanceName);
    console.log("will delete ", serverInstanceApp, " of ", serverInstanceName)
    if(serverInstance.apps ){
        console.log("deleting...")
        serverInstance.apps = serverInstance.apps.filter((app, ind)=>app.appName!==serverInstanceApp);
    }
    updateServerInstance(userName, serverInstanceName, serverInstance, callback);
}

function deleteQuickRun(userName, qrLabel, callback){
    let userData = getUserData(userName);
    if(userData.quickRuns ){
        userData.quickRuns = userData.quickRuns.filter((qr, ind)=>qr.qrLabel!==qrLabel);
    }
    replaceUserData(userName, userData, callback);
}

module.exports = {
    getAllUsers,
    getUserData,
    addNewServerInstance,
    addNewServerInstanceApp,
    updateServerInstance,
    updateServerInstanceApp,
    updateQuickRuns,
    addNewUser,
    updateUserPassword,
    updateUserAuthCredentials,
    deleteServerInstance,
    deleteServerInstanceApp,
    deleteQuickRun
}