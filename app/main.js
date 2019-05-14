const electron = require("electron")
const url = require("url")
const path = require("path")
const ipc = require("electron").ipcMain;

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
function signInRequest(event){
    const data = require("./res/auth").getAllUsers();
    event.sender.send("sign-in-response", data)
}

ipc.on("sign-in-request", signInRequest)
