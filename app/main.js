const electron = require("electron")
const url = require("url")
const path = require("path")
const ipc = require("electron").ipcMain;
const {getHashedString} = require("./src/utils/helpers")

const app = electron.app
const BrowserWindow = electron.BrowserWindow;

let window;

function createMainWindow(){
    window = new BrowserWindow({
        width:1150,
        height:650,
        webPreferences:{nodeIntegration:true}
    });
    window.loadURL(url.format({
        pathname: path.join(__dirname, ".", "dist", "index.html"),
        protocol:"file:",
        slashes: true
    }));
    
    window.on("close", function(){
        window = null;
    })
}

app.on("ready", createMainWindow)


/***************************************** 
 *  Inter-Process Communication methods  *
 *****************************************/
function getAllUserDataRequest(event){
    const data = require("./res/auth").getAllUsers();
    event.sender.send("user-data-response", data)
}

function getResponse(data, error){
    return {
        result: error?"FAILED":"OK",
        payload: data,
        error
    }
}

function userExists(userName){
    const users = require("./res/auth").getAllUsers();
    for (let user of users){
        if (user.userName == userName){
            return true;
        }
    }
    return false;
}

function createNewUserRequest(event, args){
    const {userName} = args;
    if(userExists(userName)){
        event.sender.send("create-new-user-response", getResponse(null, "User Already Exists"));
        return;
    }
    args.password = getHashedString(args.password);
    args.securityAnswer = getHashedString(args.securityAnswer);
    const auth = require("./res/auth");
    auth.addNewUser(args, function(allUsers, error){
        if(error){
            event.sender.send("create-new-user-response", getResponse(null, error));
        }else{
            event.sender.send("create-new-user-response", getResponse(allUsers));
        }
    })
}

function changeUserPassword(event, args){
    const {userName} = args;
    const auth = require("./res/auth");
    if(userExists(userName)){
        args.newPassword = getHashedString(args.newPassword);
        auth.updateUserPassword(userName, args.newPassword, function(allUsers, error){
            if(error){
                event.sender.send("change-user-password-response", getResponse(null, error));
            }else{
                event.sender.send("change-user-password-response", getResponse(allUsers));
            }
        });
    }else{
        event.sender.send("change-user-password-response", getResponse(null, "User does not exists"));
    }
}

ipc.on("user-data-request", getAllUserDataRequest)
ipc.on("create-new-user", createNewUserRequest)
ipc.on("change-user-password", changeUserPassword)
