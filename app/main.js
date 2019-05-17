const electron = require("electron")
const url = require("url")
const path = require("path")
const ipc = require("electron").ipcMain;
const {getHashedString} = require("./src/utils/helpers")

const app = electron.app
const BrowserWindow = electron.BrowserWindow;

let window;  //the main window for the renderer process.

/**
 * Creates, Initializes, Configures and Loads the main app renderer process.
 * 
 */
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

 /**
  * Main IPC listener to send the user authentication data
  * @param {Event} event 
  */
function getAllUserAuthDataRequest(event){
    const data = require("./res/auth").getAllUsers();
    event.sender.send("user-auth-data-response", getResponse(data))
}

//simple helper function to parse responses sent to the renderer process via ipc
function getResponse(data, error){
    return {
        result: error?"FAILED":"OK",
        payload: data,
        error
    }
}

/**
 * Checks for the existence of a user. 
 * Returns true if user exists and false otherwise
 * @param {string} userName 
 */
function userExists(userName){
    const users = require("./res/auth").getAllUsers();
    for (let user of users){
        if (user.userName == userName){
            return true;
        }
    }
    return false;
}

function getDefaultSettings(){
    return {
        enableLogin: true,
        secureSettings: false,
        secureFileSystem: false,
        secureDevops: false,
        secureSSH: true
    }
}

/**
 * Main IPC listener to create a new user. 
 * The args object is expected to contain the following fields:
 * ```
 * {
 *    userName,
 *    password,
 *    securityQuestion,
 *    securityAnswer
 * }
 * ```
 * The passwords and security answers are hashed with the sha512 hashing algorithms.
 * the `create-new-user-response` channel is used to respond to the renderer process that
 * initiated the request. The response either contains a list of all the users (if the user creation was sucessfull),
 * or an error message otherwise.
 * @param {Event} event 
 * @param {Object} args 
 */
function createNewUserRequest(event, args){
    const {userName} = args;
    if(userExists(userName)){
        event.sender.send("create-new-user-response", getResponse(null, "User Already Exists"));
        return;
    }
    args.password = getHashedString(args.password);
    args.securityAnswer = getHashedString(args.securityAnswer);
    args = {...args, ...getDefaultSettings()}
    const auth = require("./res/auth");
    auth.addNewUser(args, function(allUsers, error){
        if(error){
            event.sender.send("create-new-user-response", getResponse(null, error));
        }else{
            event.sender.send("create-new-user-response", getResponse(allUsers));
        }
    })
}

/**
 * IPC Main Listener for changing the password of a given user. 
 * The args object is contains the user name for who's password is to be changed and equally the new password.
 * Its fields must be as follows:
 * ```
 * {
 *   userName,
 *   newPassword
 * }
 * ```
 * @param {Event} event 
 * @param {string} args 
 */
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

function updateUserAccessCredentials(event, args){
    const {currentUser} = args;
    delete args.currentUser;
    const auth = require("./res/auth");
    if(userExists(currentUser)){
        args.password = getHashedString(args.password);
        auth.updateUserCredentials(currentUser, args, function(allUsers, error){
            if(error){
                event.sender.send("update-user-auth-data-response", getResponse(null, error));
            }else{
                event.sender.send("update-user-auth-data-response", getResponse(allUsers));
            }
        });
    }else{
        event.sender.send("update-user-auth-data-response", getResponse(null, "User does not exists"));
    }
}

/**
 * IPC Main Channel to get all user authentication data
 */
ipc.on("user-auth-data-request", getAllUserAuthDataRequest)

/**
 * IPC Main Channel to create a new user
 */
ipc.on("create-new-user", createNewUserRequest)

/**
 * IPC Main Channel to change user password
 */
ipc.on("change-user-password", changeUserPassword)

ipc.on("update-user-auth-data", updateUserAccessCredentials)
