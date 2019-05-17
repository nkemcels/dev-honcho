import React from "react";
import {Card, Form, Message} from "semantic-ui-react";
import {HOME_VIEW, SIGNIN_PANE} from "../../../constants"

export default class SignInPane extends React.Component{
    state = {
        userName: "cels",
        password: "celsoppe",
        securityAnswer: "",
        newPassword:"",
        newPasswordConfirm:""
    }
    
    /**
     * Updates the state values for the controlled input fields 
     */
    onInputChange = (field, event)=>{
        this.setState({
            [field]:event.target.value
        })
    }

    // helper method to render home view if authentication was successfull
    // or display an error text otherwise
    handleAuthenticationResponse = (isAuthenticated)=>{
        if(isAuthenticated){
            this.props.renderComponent(HOME_VIEW);
        }else{
            this.displayError("User Name or Password incorrect!");
        }
    }

    /**
     * Validates new password fields and submit the password data to be modified for the provided user
     */
    handleChangePassword = ()=>{
        if(this.isNewPasswordValid()!==true){
            this.displayError("Password provided is invalid")
        }else if (this.isConfirmNewPasswordValid()!==true){
            this.displayError("Confirmation password does not match or is invalid");
        }else{
            this.props.changePassword(this.state.userName, this.state.newPassword, (passwordChanged, error)=>{
                if(passwordChanged){
                    this.props.renderComponent(HOME_VIEW);
                }else{
                    this.displayError(error);
                }
            })
        }
    }

    /**
     * Main function to handle user input action depending on the selected context (change password, answer security question, etc)
     */
    handleValidateInput = ()=>{
        if(this.state.changePassword){
            this.handleChangePassword()
        }
        else if (this.state.forgotPassword){
            this.handleVerifySecurityQuestionAnswer()
        }
        else{
            this.props.authenticateUser(this.state.userName, this.state.password, this.handleAuthenticationResponse);
        }
    }

    handleVerifySecurityQuestionAnswer = ()=>{
        if(this.props.validateSecurityAnswer(this.state.userName, this.state.securityAnswer)){
            this.setState({
                changePassword: true
            });
            this.props.setHeaderTitle("CHANGE PASSWORD")
        }else{
            this.displayError("Incorrect answer!")
        }
    }

    displayError = (error)=>{
        this.setState({
            errorMsg: error
        }, ()=>{
            setTimeout(()=>{
                this.setState({errorMsg:null})
            }, 5000)
        })
    }

    isNewPasswordValid = ()=>{
        if(this.state.newPassword){
            if(this.state.newPassword.length>6){
                return true;
            }
            return false;
        }
    }

    isConfirmNewPasswordValid = ()=>{
        if(this.state.newPasswordConfirm){
            return this.isNewPasswordValid() && this.state.newPasswordConfirm == this.state.newPassword
        }
    }

    handleForgotPassword = ()=>{
        const securityQuestion = this.props.getSecurityQuestion(this.state.userName);
        if(securityQuestion){
            this.setState({
                forgotPassword: true,
                securityQuestion
            });
            this.props.setHeaderTitle("SECURITY QUESTION CHECK")
        }else{
            this.displayError("A valid user name is required before this action can be performed!");
        }
        
    }
    
    render(){
        return (
            <div className="match-parent">
                <div className="match-parent centered-content">
                    <Card>
                        <Card.Content>
                            {this.state.errorMsg&&
                                    <Message
                                        error
                                        header='Error'
                                        content={this.state.errorMsg}
                                    />
                                }
                            {this.state.forgotPassword?
                                this.state.changePassword?
                                    <Form size="big">
                                        <Form.Input 
                                            label="New Password" 
                                            value={this.state.newPassword} 
                                            onChange={(evt)=>this.onInputChange("newPassword", evt)}
                                            type="password"
                                            error={this.isNewPasswordValid()===false}
                                            required />
                                        <Form.Input 
                                            label="Confirm Password" 
                                            value={this.state.newPasswordConfirm} 
                                            onChange={(evt)=>this.onInputChange("newPasswordConfirm", evt)}
                                            type="password"
                                            error={this.isConfirmNewPasswordValid()===false}
                                            required />    
                                    </Form>
                                :
                                    <Form size="big">
                                        <Form.Input 
                                                label={this.state.securityQuestion} 
                                                value={this.state.securityAnswer} 
                                                onChange={(evt)=>this.onInputChange("securityAnswer", evt)} />
                                    </Form>
                            :
                                <Form size="big">
                                    <Form.Input 
                                        label="User Name" 
                                        value={this.state.userName} 
                                        onChange={(evt)=>this.onInputChange("userName", evt)} />
                                    <Form.Input 
                                        label="Password" 
                                        value={this.state.password} 
                                        onChange={(evt)=>this.onInputChange("password", evt)}
                                        type="password" />
                                    <a href="#" className="pull-right" onClick={this.handleForgotPassword}>Forgot Password</a>    
                                </Form>
                            }
                        </Card.Content>
                        <div class="ui bottom attached button big" size="big" onClick={this.handleValidateInput}>
                            {this.state.changePassword?"CHANGE PASSWORD":this.state.forgotPassword?"SUBMIT ANSWER":"SIGN IN"}
                        </div>
                    </Card>
                </div>
            </div>
        )
    }
}