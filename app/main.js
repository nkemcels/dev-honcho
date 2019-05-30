const electron = require("electron");
const url = require("url");
const path = require("path");
const ipc = require("electron").ipcMain;
const ssh = require("./ssh")
const {getHashedString} = require("./src/utils/helpers");
const constants = require("./constants");

const app = electron.app
const BrowserWindow = electron.BrowserWindow;

let window;  //the main window for the renderer process.

/**
 * Creates, Initializes, Configures and Loads the main app renderer process.
 * 
 */
function createMainWindow(){
    window = createWindow(null, "index");
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
        auth.updateUserAuthCredentials(currentUser, args, function(allUsers, error){
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

function createWindow(parent, html, options){
    options = options? options : {};
    let window = new BrowserWindow({
        width:1150,
        height:650,
        title:"Dev-Honcho",
        webPreferences:{nodeIntegration:true},
        parent,
        ...options
    });
    window.loadURL(url.format({
        pathname: path.join(__dirname, ".", "dist", `${html}.html`),
        protocol:"file:",
        slashes: true
    }));
    
    window.on("close", function(){
        window = null;
    });
    return window;
}

function openModalWindow(event, args){
    const parent = BrowserWindow.fromWebContents(event.sender);
    const page = args.windowType == constants.NEW_SERVER_INSTANCE_WINDOW? "newServerPage":
                 args.windowType == constants.NEW_APP_INSTANCE_WINDOW? "newAppPage": null;
    let modalWindow = createWindow(parent, page, {width:800, height:600, title:"Add New Server"})    
    modalWindow.user = args.user;
    modalWindow.windowType = args.windowType;
    modalWindow.props = args.props;    
}

function submitModalWindowResponse(event, args){
    const window = BrowserWindow.fromWebContents(event.sender);
    if(args!=null){
        switch(window.windowType){
            case constants.NEW_SERVER_INSTANCE_WINDOW:
                handleServerInstanceModalWindowResponse(args, window);
                break;
            case constants.NEW_APP_INSTANCE_WINDOW:
                handleServerInstanceAppModalWindowResponse(args, window);
                break;    
        }
    }
    else window.close();
}

function handleServerInstanceModalWindowResponse(args, window){
    const auth = require("./res/auth");
    const serverInstanceName = args.isToUpdate? window.props.serverName : null;
    delete args.isToUpdate;

    auth.updateServerInstance(window.user, serverInstanceName, args, function(data, error){
        console.log("data is ", data, " and error is ", error);
        if(error){
            window.webContents.send("notification", getResponse(null, error));
        }else{
            window.getParentWindow().webContents.send("open-modal-window-response", getResponse(data, null));
            window.close();
        }
    });
}

function handleServerInstanceAppModalWindowResponse(args, window){
    const auth = require("./res/auth");
    const serverInstanceName = args.serverName;
    const serverInstanceApp = args.isToUpdate? window.props.appName : null;
    console.log("window.props: ", window.props)
    delete args.isToUpdate;
    delete args.serverName;

    auth.updateServerInstanceApp(window.user, serverInstanceName, serverInstanceApp, args, function(data, error){
        if(error){
            window.webContents.send("notification", getResponse(null, error));
        }else{
            window.getParentWindow().webContents.send("open-modal-window-response", getResponse(data, null));
            window.close();
        }
    });
}

function deleteServerInstance(event, args){
    const auth = require("./res/auth");
    const window = BrowserWindow.fromWebContents(event.sender);
    auth.deleteServerInstance(args.user, args.serverName, function(data, error){
        if(error){
            window.webContents.send("notification", getResponse(null, error));
        }else{
            window.webContents.send("delete-server-instance-response", getResponse(data, null));
        }
    });
}

function deleteServerInstanceApp(event, args){
    const auth = require("./res/auth");
    const window = BrowserWindow.fromWebContents(event.sender);
    auth.deleteServerInstanceApp(args.user, args.serverName, args.appName, function(data, error){
        if(error){
            window.webContents.send("notification", getResponse(null, error));
        }else{
            window.webContents.send("delete-server-instance-app-response", getResponse(data, null));
        }
    });
}

function sendModalWindowProps(event, args){
    const window = BrowserWindow.fromWebContents(event.sender);
    window.webContents.send("get-modal-window-props-response", getResponse(window.props));
}

function connectToServer(event, args){
    const host = args.ipDns;
    const username = args.serverUser;
    const password = args.serverUserPwd;
    const privateKey = args.pemFilePath;
    const port = args.sshPort?args.sshPort:22;
    const authOption = /*args.authOption*/ constants.AUTH_OPTION_PERMISSION_KEY  //for now

    //TODO: Add auth option on the new server page.


    let options = {
        host,
        username,
        port
    }

    if(authOption === constants.AUTH_OPTION_PERMISSION_KEY){
        options = {...options, privateKey}
    }
    else if(authOption === constants.AUTH_OPTION_PASSWORD){
        options = {...options, password}
    }
    else if(authOption === constants.AUTH_OPTION_PERMISSION_KEY_AND_PASSWORD){
        options = {...options, password, privateKey}
    } 

    const window = BrowserWindow.fromWebContents(event.sender);
    ssh.connectToServer(options, function(connected, error){
        console.log("connected: ", connected, ", error: ", error)
        if(connected){
            window.webContents.send("connect-to-server-response", getResponse("CONNECTED"))    
        }else{
            window.webContents.send("connect-to-server-response", getResponse(null, error))
        }
    });
}

function parseListedFiles(stdout){
    if(!stdout) return null;
    let results = stdout.split("\n");
    let processed = []
    for (let line of results){
        let fileParts = line.split(/\s+/);
        if(fileParts.length>=9){
            const name = fileParts.slice(8, fileParts.length).join(" ").trim();
            processed = [...processed, {
                name:name.endsWith("/")?name.substring(0, name.lastIndexOf("/")):name,
                type: name.endsWith("/")?"DIRECTORY":"FILE",
                extension: path.extname(name),
                size: fileParts[4],
                metadata: fileParts[0]+" "+fileParts[1]+" "+fileParts[2]+" "+fileParts[3],
                created : fileParts[5]+" "+fileParts[6]+" "+fileParts[7]
            }];
        }
    }

    return processed.length==0?null:processed;
}

function handleDefaultResponse(window, statusOk, stdout, stderr){
    console.log("error: ", stderr)
    if(statusOk){
        let parsedResult = parseListedFiles(stdout);
        window.webContents.send("server-operation-response", getResponse({error:stderr, data:parsedResult}));
    }else{
        window.webContents.send("server-operation-response", getResponse(null, stdout||stderr));
    }
}

function performServerOperation(event, args){
    if(args && args.type){
        const window = BrowserWindow.fromWebContents(event.sender);
        switch(args.type){
            case constants.SERVER_OP_LIST_DIR:
                ssh.listFiles(args.payload, function(statusOk, stdout, stderr){
                    handleDefaultResponse(window, statusOk, stdout, stderr);
                });
            break
            case constants.SERVER_OP_CREATE_NEW_FILE:
                ssh.createNewFile(args.payload.name, args.payload.currentDirectory, function(statusOk, stdout, stderr){
                    handleDefaultResponse(window, statusOk, stdout, stderr);
                });
            break;
            case constants.SERVER_OP_CREATE_NEW_FOLDER:
                ssh.createNewFolder(args.payload.name, args.payload.currentDirectory, function(statusOk, stdout, stderr){
                    handleDefaultResponse(window, statusOk, stdout, stderr);
                });
            break;
            case constants.SERVER_OP_DELETE:
                ssh.deleteItems(args.payload.items,  args.payload.currentDirectory, function(statusOk, stdout, stderr){
                    handleDefaultResponse(window, statusOk, stdout, stderr);
                });
            break;
            case constants.SERVER_OP_RENAME:
                ssh.renameFileOrFolder(args.payload.oldName, args.payload.newName, args.payload.currentDirectory, function(statusOk, stdout, stderr){
                    handleDefaultResponse(window, statusOk, stdout, stderr);
                });
            break;
            case constants.SERVER_OP_COPY_PASTE:
                ssh.copyPasteFilesOrFolders(args.payload.selectedFiles, args.payload.destination, function(statusOk, stdout, stderr){
                    handleDefaultResponse(window, statusOk, stdout, stderr);
                });
            break;
            case constants.SERVER_OP_CUT_PASTE:
                ssh.cutPasteFilesOrFolders(args.payload.selectedFiles, args.payload.destination, function(statusOk, stdout, stderr){
                    handleDefaultResponse(window, statusOk, stdout, stderr);
                });
            break;
            case constants.SERVER_OP_DOWNLOAD:
                ssh.downloadFiles(args.payload.files, args.payload.destination, ars.payload.downloadId, function(chunkData){
                    window.webContents.send("stray-data", chunkData);
                });
                break;      
        }
    }
}

/**
 * IPC Main Channel to get all user authentication data
 */
ipc.on("user-auth-data-request", getAllUserAuthDataRequest);

/**
 * IPC Main Channel to create a new user
 */
ipc.on("create-new-user", createNewUserRequest);

/**
 * IPC Main Channel to change user password
 */
ipc.on("change-user-password", changeUserPassword);

ipc.on("update-user-auth-data", updateUserAccessCredentials);
ipc.on("open-modal-window", openModalWindow);
ipc.on("get-modal-window-props", sendModalWindowProps)
ipc.on("open-modal-window-response", submitModalWindowResponse);
ipc.on("delete-server-instance", deleteServerInstance);
ipc.on("delete-server-instance-app", deleteServerInstanceApp);
ipc.on("connect-to-server", connectToServer);
ipc.on("server-operation", performServerOperation);
