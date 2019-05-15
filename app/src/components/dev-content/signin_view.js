import React from "react";
import {Card, Form, Message} from "semantic-ui-react";
import {HOME_VIEW} from "../../../constants"

export default class SignInPane extends React.Component{
    state = {
        userName: "celso",
        password: "celsoppe"
    }
    
    onInputChange = (field, event)=>{
        this.setState({
            [field]:event.target.value
        })
    }

    handleValidateInputs = ()=>{
        this.props.authenticateUser(this.state.userName, this.state.password, this.handleAuthenticationResponse);
    }

    handleAuthenticationResponse = (isAuthenticated)=>{
        if(isAuthenticated){
            this.props.renderComponent(HOME_VIEW);
        }else{
            this.setState({
                errorMsg: "User Name or Password incorrect!"
            }, ()=>{
                setTimeout(()=>{
                    this.setState({errorMsg:null})
                }, 5000)
            })
        }
    }

    handleForgotPassword = ()=>{
        const securityQuestion = this.props.getSecurityQuestion(this.state.userName);
        if(securityQuestion){
            this.setState({
                forgotPassword: true,
                securityQuestion
            });
        }else{
            this.setState({
                errorMsg: "A valid user name is required before this action can be performed!"
            }, ()=>{
                setTimeout(()=>{
                    this.setState({errorMsg:null})
                }, 5000)
            })
        }
        
    }
    
    render(){
        return (
            <div className="match-parent">
                <div className="match-parent centered-content">
                    <Card>
                        <Card.Content>
                            {this.state.forgotPassword?
                            <div>
                                <Form size="big">
                                    <Form.Input 
                                            label={this.state.securityQuestion} 
                                            value={this.state.userName} 
                                            onChange={(evt)=>this.onInputChange("userName", evt)} />
                                </Form>
                            </div>
                            :
                            <div>
                                {this.state.errorMsg&&
                                    <Message
                                        error
                                        header='Error'
                                        content={this.state.errorMsg}
                                    />
                                }
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
                            </div>
                            }
                        </Card.Content>
                        <div class="ui bottom attached button big" size="big" onClick={this.handleValidateInput}>
                            {this.state.forgotPassword?"SUBMIT":"SIGN IN"}
                        </div>
                    </Card>
                </div>
            </div>
        )
    }
}