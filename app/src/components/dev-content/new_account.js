import React from "react";
import {Card, Form, Divider, Button, Message} from "semantic-ui-react";
export default class NewAccountPane extends React.Component{
    state = {
        userName: "",
        password: "",
        confirmPassword: "",
        securityQuestion:"",
        securityAnswer:"",
        confirmPasswordError:false,
        userNameError:false,
        passwordError:false
    }
    getSecurityQuestions = ()=>{
        return [
            {key:"1", text:"What is your favorite meal?", value:"What is your favorite meal?"},
            {key:"2", text:"What is the name of your favorite childhood friend?", value:"What is the name of your favorite childhood friend?"},
            {key:"3", text:"What is your favorite movie?", value:"What is your favorite movie?"},
            {key:"4", text:"Who was your childhood hero?", value:"Who was your childhood hero?"}
        ]
    }
    isPasswordValid = ()=>{
        if(this.state.password){
            if(this.state.password.length>6){
                return true;
            }
            return false;
        }
    }
    isUserNameValid = ()=>{
        if(this.state.userName){
            let re = /^[a-zA-Z0-9]+$/;
            return re.test(this.state.userName)
        }
    }
    isConfirmPasswordValid = ()=>{
        if(this.state.confirmPassword){
            return this.isPasswordValid() && this.state.confirmPassword == this.state.password
        }
    }
    hasSecurityQuestion = ()=>{
        if(this.state.securityQuestion){
            return true;
        }
    }
    hasSecurityAnswer = ()=>{
        if(this.state.securityAnswer){
            return this.hasSecurityQuestion();
        }
    }
    onInputChange = (field, event, value)=>{
        let targetValue = event.target.value
        if (field === "securityQuestion"){
            targetValue = event.target.textContent;
        }

        this.setState({
            [field]:targetValue
        }, ()=>{
            this.setState({
                userNameError: this.isUserNameValid(),
                passwordError: this.isPasswordValid(),
                confirmPasswordError: this.isConfirmPasswordValid()
            })
        })
    }
    handleValidateInputs = ()=>{
        let errorMsg = null;
        if(this.isUserNameValid()!==true){
            errorMsg = "Invalid user name provided";
        }
        else if(this.isPasswordValid()!==true){
            errorMsg = "Invalid password provided";
        }
        else if(this.isConfirmPasswordValid()!==true){
            errorMsg = "Confirmation password does not match";
        }
        else if(this.hasSecurityQuestion()!==true){
            errorMsg = "No security question provided";
        }
        else if(this.hasSecurityAnswer()!==true){
            errorMsg = "No answer provided to the selected security question";
        }

        if(errorMsg){
            this.setState({
                errorMsg
            }, ()=>{
                setTimeout(()=>{
                    this.setState({errorMsg:null})
                }, 5000)
            })
        }
        else this.handleSubmitUserInputs();
    }

    handleSubmitUserInputs = ()=>{
        const qdata = {
            userName: this.state.userName,
            password: this.state.password,
            securityQuestion: this.state.securityQuestion,
            securityAnswer: this.state.securityAnswer
        }
        this.props.createNewUserAndSignIn(qdata, this.handleCreateUserFailed);
    }

    handleCreateUserFailed = (error)=>{
        this.setState({
            errorMsg: error
        }, ()=>{
            setTimeout(()=>{
                this.setState({errorMsg:null})
            }, 5000)
        })
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
                            <Form size="big">
                                <Form.Input 
                                    label="User Name" 
                                    value={this.state.userName} 
                                    onChange={(evt)=>this.onInputChange("userName", evt)}
                                    error={this.isUserNameValid()===false}
                                    required />
                                <Form.Input 
                                    label="Password" 
                                    value={this.state.password} 
                                    onChange={(evt)=>this.onInputChange("password", evt)}
                                    error={this.isPasswordValid()===false}
                                    type="password"
                                    required />
                                <Form.Input 
                                    label="Confirm Password" 
                                    value={this.state.confirmPassword} 
                                    onChange={(evt)=>this.onInputChange("confirmPassword", evt)}
                                    error={this.isConfirmPasswordValid()===false}
                                    type="password"
                                    required />
                                <Divider />
                                <Form.Field 
                                    control={Form.Select}
                                    label="Security Question" 
                                    options={this.getSecurityQuestions()}
                                    onChange={(evt, {value})=>this.onInputChange("securityQuestion", evt, value)} />
                                <Form.Input
                                    label="Answer" 
                                    value={this.state.securityAnswer} 
                                    onChange={(evt)=>this.onInputChange("securityAnswer", evt)}
                                    disabled={!this.hasSecurityQuestion()}/>    
                            </Form>
                        </Card.Content>
                        <div class="ui bottom attached button big" size="big" onClick={this.handleValidateInputs}>
                            Done
                        </div>
                    </Card>
                </div>
            </div>
        )
    }
}