import React from "react";
import {Header, Footer, Pane, InitialContent} from "../components";
import {NewAccountPane, HomeView, SignInPane, FileSystemView, TerminalView, DevOpsView} from "../components";
import { Menu, Sidebar } from 'semantic-ui-react'
import {SettingsPane} from "../components"
import {getHashedString} from "../utils/helpers"
import * as constants from "../../constants"
const ipc = require("electron").ipcRenderer;

export default class AppContainer extends React.Component{
    constructor(props){
        super(props)
        this.state={
            currentServer: null,
            currentUser: null,
            selectedMenu: null,
            isServerConnected:false,
            authData: [],
            isAuthenticated: false,
            sidebarVisibility: false,
            CurrentComponent: null,
            currentComponentName:null
        }

        this.loadUserAuthData(true);
    }

    /**
     * Loads user authentication data through the user-auth-data-request ipc channel. 
     */
    loadUserAuthData = (redirectToSignIn=false)=>{
        ipc.send("user-auth-data-request");
        ipc.once("user-auth-data-response", (evt, data)=>this.handleReceiveUserData(evt, data, redirectToSignIn))
    }
    
    /**
     * Gets all the user login info and saves it in the state.
     */
    handleReceiveUserData = (evt, response, redirectToSignIn=false)=>{
        const data = response.payload;
        this.setState({
            authData: (data && data instanceof Array && data.length>0)? data : [],
        }, ()=>{
            if(redirectToSignIn && this.state.authData.length>0){
                if(this.state.authData[0].enableLogin){
                    this.handleChangeHeaderTitle((data && data instanceof Array && data.length>0)? "SIGN-IN" : "DEV-HONCHO")
                    this.renderThisComponent(constants.SIGNIN_PANE)
                }else{
                    this.setState({
                        currentUser: this.state.authData[0].userName,
                        isAuthenticated: true
                    }, ()=>{
                        this.handleChangeHeaderTitle("DEV-HONCHO")
                        this.renderThisComponent(constants.HOME_VIEW)
                    })
                }
                
            }else if(redirectToSignIn){
                this.handleChangeHeaderTitle((data && data instanceof Array && data.length>0)? "SIGN-IN" : "DEV-HONCHO")
                this.renderThisComponent(constants.INITIAL_CONTENT);
            }
        });
    }

    handleCreateNewUserIpcResponse = (evt, data, successCallback, failureCallback)=>{
        if (data.result == "OK"){
            if(successCallback && successCallback instanceof Function){
                successCallback(data.payload);
            }
        }else if(failureCallback && failureCallback instanceof Function){
            failureCallback(data.error);
        }
    }

    handleCreateNewUser = (userData, successCallback, failureCallback)=>{
        ipc.send("create-new-user", userData);
        ipc.once("create-new-user-response", (evt, data)=>this.handleCreateNewUserIpcResponse(evt, data, successCallback, failureCallback))
    }

    handleCreateNewUserAndSignIn=(userData, failureCallback)=>{
        this.handleCreateNewUser(userData, (authData)=>{
            this.setState({
                authData
            }, ()=>{
                this.handleAuthenticateUser(userData.userName, userData.password,(isAuthenticated)=>{
                    if(isAuthenticated){
                        this.renderThisComponent(constants.HOME_VIEW);
                    }else {
                        alert(`This is weird. Could not login with newly created credentials.
                                Please restart the app and try again. 
                                If it persists, consider reinstalling the application.`)
                        console.log("This is weird. Could not login with newly created password")
                    }
                })
                
            })
        }, failureCallback)
    }

    getUserData = (userName) => {
        for (let userData of this.state.authData){
            if (userName == userData.userName){
                return userData;
            }
        }
        return null;
    }

    handleAuthenticateUser = (userName, password, callback)=>{
        let isAuthenticated = false;
        let userData = this.getUserData(userName);
        if(userData && userData.password === getHashedString(password)){
            isAuthenticated = true;
            this.setState({
                currentUser:userName,
                currentUserPassword: password
            });
        }
        this.setState({
            isAuthenticated
        });
        if(callback && callback instanceof Function){
            callback(isAuthenticated);
        }
    }

    getSecurityQuestion = (userName)=>{
        let userData = this.getUserData(userName);
        if(userData){
            return userData.securityQuestion;
        }
        
        return null;
    }

    validateSecurityAnswer = (userName, securityAnswer)=>{
        let userData = this.getUserData(userName);
        if(userData){
            return userData.securityAnswer === getHashedString(securityAnswer);
        }

        return false;
    }

    handleChangeHeaderTitle = (newTitle)=>{
        this.setState({
            selectedMenu:newTitle
        })
    }

    handleChangePassword = (userName, newPassword, callback)=>{
        ipc.send("change-user-password", {userName, newPassword});
        ipc.once("change-user-password-response", (event, data)=>{
            if (callback && callback instanceof Function){
                if(data.result ==="OK"){
                    this.setState({ authData:data.payload })
                    callback(true);
                }else{
                    callback(false, data.error);
                }
            }
        });
    }

    updateUserAccessCredentials = (user, newAuthData, callback)=>{
        ipc.send("update-user-auth-data", {currentUser:user, ...newAuthData});
        ipc.once("update-user-auth-data-response", (event, data)=>{
            if (callback && callback instanceof Function){
                if(data.result ==="OK"){
                    this.setState({ authData:data.payload }, ()=>{
                        this.handleAuthenticateUser(newAuthData.userName, newAuthData.password)
                        callback(true);
                    });
                }
                else{ callback(false, data.error); }
            }
        });
    }

    getSettingsData = (userName)=>{
        let userData = this.getUserData(userName);
        if(userData){
            return {
                currentUser: this.state.currentUser===userName && userName,
                currentUserPassword: this.state.currentUser===userName && this.state.currentUserPassword,
                enableLogin: userData.enableLogin,
                secureSettings: userData.secureSettings,
                secureFileSystem: userData.secureFileSystem,
                secureDevops: userData.secureDevops,
                secureSSH: userData.secureSSH,
                serverInstances: userData.serverInstances
            }
        }
    }

    getQuickRuns = (userName)=>{
        let userData = this.getUserData(userName);
        if(userData){
            return userData.quickRuns
        }
    }

    handleDeleteServerInstance = (serverName, callback)=>{
        ipc.send("delete-server-instance", {user:this.state.currentUser, serverName});
        ipc.once("delete-server-instance-response", (event, data)=>{
            this._handleDefaultResponse(data, callback)
        })
    }

    handleDeleteServerInstanceApp = (serverName, appName, callback)=>{
        ipc.send("delete-server-instance-app", {user:this.state.currentUser, serverName, appName});
        ipc.once("delete-server-instance-app-response", (event, data)=>{
            this._handleDefaultResponse(data, callback)
        })
    }

    handleDeleteQuickRun = (qrLabel, callback)=>{
        ipc.send("delete-quick-run", {user:this.state.currentUser, qrLabel});
        ipc.once("delete-quick-run-response", (event, data)=>{
            this._handleDefaultResponse(data, callback)
        })
    }

    _handleDefaultResponse = (data, callback)=>{
        if(data.result==="OK"){
            this.setState({ authData:data.payload }, ()=>{
                if(callback && callback instanceof Function){
                    callback(true, data);
                }
            });
        }else if(callback && callback instanceof Function){ 
            callback(false);
        }
    }

    handleServerOperation = (options, callback)=>{
        options = options?options:{}
        if(!this.operationId || this.operationId >= Number.MAX_SAFE_INTEGER) this.operationId = 0;
        this.operationId++;

        ipc.send(`server-operation`, {...options, operationId:this.operationId});
        ipc.once(`server-operation${this.operationId}-response`, (event, data)=>{
            if(callback && callback instanceof Function){
                callback(data);
            }
        })
    }

    renderThisComponent = (component, props, callback)=>{
        let Component = null; let menuTitle = "";
        switch(component){
            case constants.INITIAL_CONTENT:
                 menuTitle = props && props.menuTitle?props.menuTitle:"DEV-HONCHO";
                 Component = <InitialContent  
                                {...props} 
                                renderComponent = {this.renderThisComponent} />
                 break;
            case constants.NEW_ACCOUNT_PANE:
                menuTitle = props && props.menuTitle?props.menuTitle:"CREATE NEW ACCOUNT";
                Component =  <NewAccountPane  
                                {...props} 
                                renderComponent = {this.renderThisComponent}
                                createNewUserAndSignIn = {this.handleCreateNewUserAndSignIn} />
                break;
            case constants.HOME_VIEW:
                menuTitle = props && props.menuTitle?props.menuTitle:"DEV-HONCHO";
                Component = <HomeView  
                                {...props} 
                                renderComponent = {this.renderThisComponent}
                                serverName = {this.state.currentServer}
                                 />
                break; 
            case constants.SIGNIN_PANE:
                menuTitle = props && props.menuTitle?props.menuTitle:"SIGNIN";
                Component = <SignInPane 
                                {...props} 
                                renderComponent = {this.renderThisComponent}
                                authenticateUser = {this.handleAuthenticateUser}
                                getSecurityQuestion = {this.getSecurityQuestion}
                                validateSecurityAnswer = {this.validateSecurityAnswer}
                                setHeaderTitle = {this.handleChangeHeaderTitle}
                                changePassword = {this.handleChangePassword} />
                break;
            case constants.SETTINGS_PANE:
                menuTitle = props && props.menuTitle?props.menuTitle:"SETTINGS";
                Component = <SettingsPane
                                {...props}
                                renderComponent = {this.renderThisComponent}
                                settingsData = {this.getSettingsData(this.state.currentUser)}
                                updateUserAccessCredentials = {this.updateUserAccessCredentials}
                                openNewServerModal = {this.handleOpenNewServerModal}
                                deleteServerInstance = {this.handleDeleteServerInstance}
                                deleteServerInstanceApp = {this.handleDeleteServerInstanceApp} />
                break;
            case constants.FILE_SYSTEM_VIEW:
                menuTitle = props && props.menuTitle?props.menuTitle:"FILE SYSTEM";
                Component = <FileSystemView
                                {...props}
                                renderComponent = {this.renderThisComponent}
                                connected = {this.state.isServerConnected}
                                serverName = {this.state.currentServer}
                                serverOperation = {this.handleServerOperation}
                                connectToServer = {(callback)=>this.handleConnectToServer(this.state.currentUser, this.state.currentServer, callback)} />
                break;
            case constants.DEVOPS_VIEW:
                menuTitle = props && props.menuTitle?props.menuTitle:"DEVOPS";
                Component = <DevOpsView
                                {...props}
                                currentUser={this.state.currentUser}
                                renderComponent = {this.renderThisComponent}
                                serverName = {this.state.currentServer} />    
                break;                
            case constants.TERMINAL_VIEW:
                menuTitle = props && props.menuTitle?props.menuTitle:"DH-TERMINAL";
                Component = <TerminalView
                                {...props}
                                quickRuns={this.getQuickRuns(this.state.currentUser)}
                                currentUser={this.state.currentUser}
                                renderComponent = {this.renderThisComponent}
                                deleteQuickRun = {this.handleDeleteQuickRun}
                                serverName = {this.state.currentServer} />
                break;                     
            case constants.NEW_SERVER_INSTANCE_WINDOW: 
            case constants.NEW_APP_INSTANCE_WINDOW:
            case constants.NEW_QUICK_RUN_WINDOW:
                ipc.send("open-modal-window", {user:this.state.currentUser, windowType:component, props} );
                ipc.once("open-modal-window-response", (event, data)=>{
                    this._handleDefaultResponse(data, callback);
                });
                break;
        }
        if(Component!=null){
            this.setState({
                CurrentComponent: null,   //so that if we want to rerender the same component, react shouldn't stop us.
                currentComponentName:null
            }, ()=>{
                this.setState({
                    CurrentComponent: Component,
                    currentComponentName:component,
                    selectedMenu: menuTitle
                });
            });
        }
        this.setState({sidebarVisibility:false})
    }

    getUserServerInstances = (userName)=>{
        const userData = this.getUserData(userName);
        return userData ? userData.serverInstances:null;
    }

    getUserServerInstance = (userName, serverName)=>{
        const serverInstances = this.getUserServerInstances(userName);
        for(let serverInstance of serverInstances){
            if(serverInstance.serverName === serverName){
                return serverInstance;
            }
        }
    }

    setCurrentServer = (serverName)=>{
        this.setState({
            currentServer: serverName,
            isServerConnected:false
        }, ()=>{
            this.renderThisComponent(this.state.currentComponentName);
        });
    }

    handleToggleSideBar = ()=>{
        this.setState({
            sidebarVisibility:!this.state.sidebarVisibility
        });
    }

    handleConnectToServer = (userName, serverName, callback)=>{
        const serverInstance = this.getUserServerInstance(userName, serverName);
        ipc.send("connect-to-server", serverInstance);
        ipc.once("connect-to-server-response", (event, data)=>{
            if(userName === this.state.currentUser && serverName === this.state.currentServer){
                this.setState({
                    isServerConnected: (data.result === "OK")
                }, ()=>{
                    if(callback && callback instanceof Function){
                        callback((data.result === "OK"), data.error);
                    }
                });
            }
        });
    }

    render(){
        const serverInstances = this.getUserServerInstances(this.state.currentUser);
        return (
            <div className="app-container">
                <Header 
                    currentServer={this.state.currentServer}
                    currentUser={this.state.currentUser}
                    selectedMenu={this.state.selectedMenu}
                    isAuthenticated = {this.state.isAuthenticated}
                    toggleSideBar = {this.handleToggleSideBar} />
                <div className="pane">
                    <Sidebar.Pushable >
                        <Sidebar
                            as={Menu}
                            animation='overlay'
                            icon='labeled'
                            inverted
                            onHide={()=>this.setState({sidebarVisibility:false})}
                            vertical
                            visible={this.state.sidebarVisibility}
                            style={{padding:7}}
                            width="wide"
                        >
                            <Menu style={{backgroundColor:"#212121"}}>
                                {serverInstances?
                                    <b style={{fontSize:15,color:"#E0E0E0"}} className="pull-left">Server Instances</b> : <b style={{fontSize:15, color:"#E0E0E0"}} className="pull-left">No Server Instances</b>
                                }
                            </Menu>
                            {serverInstances && serverInstances instanceof Array&&
                                serverInstances.map((elt, indx)=>{
                                    return (
                                        <Menu.Item as='a' position="left" onClick={()=>{this.setCurrentServer(elt.serverName); this.setState({sidebarVisibility:false})}}>
                                            <span className="sidebar-menuitem" style={this.state.currentServer == elt.serverName? {width:"100%", color:"#66BB6A"}:{width:"100%"}}>
                                                <span className="glyphicon glyphicon-triangle-right pull-left"/>
                                                <span className="pull-left">{elt.serverName}</span>
                                                <a 
                                                    className="btn btn-xs btn-primary pull-right" 
                                                    onClick={(evt)=>{evt.stopPropagation();this.renderThisComponent(
                                                                    constants.NEW_SERVER_INSTANCE_WINDOW, 
                                                                    this.getUserServerInstance(this.state.currentUser, elt.serverName),
                                                                    ()=>{ if(this.state.currentComponentName === constants.SETTINGS_PANE){
                                                                            this.renderThisComponent(constants.SETTINGS_PANE);
                                                                        }}
                                                    )}}> Edit </a>
                                            </span> 
                                        </Menu.Item>
                                    )
                                })
                            }
                            <Menu style={{backgroundColor:"#212121"}}>
                                <b style={{fontSize:15,color:"#E0E0E0"}} className="pull-left">Main Items</b>
                            </Menu>
                            <Menu.Item as='a' onClick={()=>this.renderThisComponent(constants.FILE_SYSTEM_VIEW)} disabled={!this.state.currentServer}>
                                <span className="sidebar-menuitem" style={{marginLeft:5}}>
                                    <span className="glyphicon glyphicon-duplicate pull-left"/>
                                    <span className="pull-left">File System</span> 
                                </span>
                            </Menu.Item>
                            <Menu.Item as='a' onClick={()=>this.renderThisComponent(constants.DEVOPS_VIEW)} disabled={!this.state.currentServer}>
                                <span className="sidebar-menuitem" style={{marginLeft:5}}>
                                    <span className="glyphicon glyphicon-hdd pull-left"/>
                                    <span className="pull-left">Manage Deployments</span> 
                                </span>
                            </Menu.Item>
                            <Menu.Item as='a' onClick={()=>this.renderThisComponent(constants.TERMINAL_VIEW)}>
                                <span className="sidebar-menuitem" style={{marginLeft:5}}>
                                    <span className="glyphicon glyphicon-console pull-left"/>
                                    <span className="pull-left">Terminal</span> 
                                </span>
                            </Menu.Item>
                            <Menu.Item as='a' onClick={()=>this.renderThisComponent(constants.SETTINGS_PANE)}>
                                <span className="sidebar-menuitem" style={{marginLeft:5}}>
                                    <span className="glyphicon glyphicon-cog pull-left"/>
                                    <span className="pull-left">Settings</span> 
                                </span>
                            </Menu.Item>
                            <Menu.Item as='a' onClick={()=>this.renderThisComponent(constants.HOME_VIEW)}>
                                <span className="sidebar-menuitem" style={{marginLeft:5}}>
                                    <span className="glyphicon glyphicon-home pull-left"/>
                                    <span className="pull-left">Home</span> 
                                </span>
                            </Menu.Item>    
                        </Sidebar>

                        <Sidebar.Pusher style={{width:"100%", height:"100%"}} className="centered-content" dimmed={this.state.sidebarVisibility}>
                            <div className="match-parent">
                                {
                                    this.state.CurrentComponent
                                }
                            </div>
                        </Sidebar.Pusher>
                    </Sidebar.Pushable>
                </div>
                <Footer />
            </div>
        )
    }
}