import React from "react";
import {Header, Footer, Pane, InitialContent} from "../components";
import {NewAccountPane, HomeView, SignInPane} from "../components";
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
            authData: [],
            isAuthenticated: false,
            CurrentComponent: null
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
                this.handleChangeHeaderTitle((data && data instanceof Array && data.length>0)? "SIGN-IN" : "DEV-HONCHO")
                this.renderThisComponent(constants.SIGNIN_PANE)
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

    getUserData = (userName) =>{
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
                    console.log("payload data: ", data.payload)
                    this.setState({ authData:data.payload }, ()=>{
                        this.handleAuthenticateUser(newAuthData.userName, newAuthData.password)
                    });
                    callback(true);
                }else{
                    callback(false, data.error);
                }
            }
        })
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
                secureSSH: userData.secureSSH
            }
        }
        
    }

    handleOpenNewServerModal = ()=>{
        ipc.send("open-new-server-window", this.state.currentUser);
        ipc.once("open-new-server-window-response", ()=>{
            alert("you can continue")
        })
    }

    renderThisComponent = (component, props)=>{
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
                                renderComponent = {this.renderThisComponent} />
                             
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
                                openNewServerModal = {this.handleOpenNewServerModal} />
                break;                          
        }
        this.setState({
            CurrentComponent: null   //so that if we want to rerender the same component, react shouldn't stop us.
        }, ()=>{
            this.setState({
                CurrentComponent: Component,
                selectedMenu: menuTitle
            });
        });
        
    }

    render(){
        return (
            <div className="app-container">
                <Header 
                    currentServer={this.state.currentServer}
                    currentUser={this.state.currentUser}
                    selectedMenu={this.state.selectedMenu}
                    isAuthenticated = {this.state.isAuthenticated} />
                <Pane>
                    {
                        this.state.CurrentComponent
                    }
                </Pane>
                <Footer />
            </div>
        )
    }
}