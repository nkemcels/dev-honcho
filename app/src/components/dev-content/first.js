import React from "react";
import {Button} from "semantic-ui-react"
import {NEW_ACCOUNT_PANE} from "../../../constants"

export default class InitialDisplay extends React.Component{
    /**
     * Renders the new account creation pane on the main view.
     */
    handleCreateNewAccount = ()=>{
        this.props.renderComponent(NEW_ACCOUNT_PANE)
    }
    render(){
        return (
            <div className="centered-content match-parent">
                <div style={{textAlign:"center", marginTop:-40}}>
                    <h2>WELCOME</h2>
                    <h5><a href="#">DEV-HONCHO</a> is here to help you get things done FASTER!</h5>
                    <h6>To get started, you need to secure your content by providing access credentials</h6>
                    <Button onClick={this.handleCreateNewAccount} size="big"> Get Started </Button>
                </div>
            </div>
        )
    }
}