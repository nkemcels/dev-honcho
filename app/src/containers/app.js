import React from "react";
import {Header, Footer, Pane, InitialContent} from "../components";
import {NewAccountPane} from "../components"
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
            authenticated: false,
            currentComponent: null
        }

        ipc.send("sign-in-request");
        ipc.once("sign-in-response", this.handleInitialData)
    }
    /**
     * Gets all the user login info and saves it in the state.
     */
    handleInitialData = (evt, data)=>{
        this.setState({
            authData: (data && data instanceof Array && data.length>0)? data : [],
            selectedMenu: (data && data instanceof Array && data.length>0)? "SIGN-IN" : "DEV-HONCHO"
        })
    }

    renderThisComponent = (component, props)=>{
        let Component = null;
        switch(component){
            case constants.INITIAL_CONTENT:
                 Component = <InitialContent  {...props} renderComponent = {this.renderThisComponent} />
                 break;
            case constants.NEW_ACCOUNT_PANE:
                Component =  <NewAccountPane  {...props} renderComponent = {this.renderThisComponent} />
                break;
        }
        this.setState({
            currentComponent: Component
        })
    }

    render(){
        return (
            <div className="app-container">
                <Header 
                    currentServer={this.state.currentServer}
                    currentUser={this.state.currentUser}
                    selectedMenu={this.state.selectedMenu}
                    isAuthenticated = {this.state.authenticated} />
                <Pane>
                    {this.state.currentComponent?
                        this.state.currentComponent : 
                        this.state.authData.length>0 ?
                            this.renderThisComponent(constants.SIGNIN_PANE):
                            this.renderThisComponent(constants.INITIAL_CONTENT)
                    }
                </Pane>
                <Footer />
            </div>
        )
    }
}