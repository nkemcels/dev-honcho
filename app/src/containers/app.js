import React from "react";
import {Header, Footer, Pane, InitialContent} from "../components";
import {NewAccountPane, HomeView, SignInPane} from "../components"
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

        ipc.send("user-data-request");
        ipc.once("user-data-response", (evt, data)=>this.handleReceiveUserData(evt, data, true))
    }
    /**
     * Gets all the user login info and saves it in the state.
     */
    handleReceiveUserData = (evt, data, redirectToSignIn=false)=>{
        this.setState({
            authData: (data && data instanceof Array && data.length>0)? data : [],
            selectedMenu: (data && data instanceof Array && data.length>0)? "SIGN-IN" : "DEV-HONCHO"
        }, ()=>{
            if(redirectToSignIn && this.state.authData.length>0){
                this.renderThisComponent(constants.SIGNIN_PANE)
            }else if(redirectToSignIn){
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
            failureCallback(data.payload);
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
                this.renderThisComponent(constants.HOME_VIEW);
            })
        }, failureCallback)
    }

    handleAuthenticateUser = (userName, password, callback)=>{
        let isAuthenticated = false;
        for (let user of this.state.authData){
            if (getHashedString(password) === user.password && userName == user.userName){
                isAuthenticated = true;
                break;
            }
        }
        if(callback && callback instanceof Function){
            callback(isAuthenticated);
            this.setState({
                isAuthenticated
            });
            if(isAuthenticated){
                this.setState({
                    currentUser:userName
                });
            }
        }
    }

    getSecurityQuestion = (userName)=>{
        for (let user of this.state.authData){
            if(userName == user){
                return user.securityQuestion;
            }
        }

        return null;
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
                                getSecurityQuestion = {this.getSecurityQuestion} />
                break;          
        }
        this.setState({
            CurrentComponent: Component,
            selectedMenu: menuTitle
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