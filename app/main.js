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
        payload: data?data:error
    }
}

function createNewUserRequest(event, args){
    const {userName} = args;
    const users = require("./res/auth").getAllUsers();
    for (let user of users){
        if (user.userName == userName){
            event.sender.send("create-new-user-response", getResponse(null, "User Already Exists"));
            return;
        }
    }
    args.password = getHashedString(args.password);
    args.securityAnswer = getHashedString(args.securityAnswer);
    const auth = require("./res/auth");
    auth.addNewUser(args, function(allUsers){
        event.sender.send("create-new-user-response", getResponse(allUsers));
    }, function(error){
        event.sender.send("create-new-user-response", getResponse(null, error));
    })
}

ipc.on("user-data-request", getAllUserDataRequest)
ipc.on("create-new-user", createNewUserRequest)
