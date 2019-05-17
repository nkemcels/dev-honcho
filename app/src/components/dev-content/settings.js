import React from "react";
import {Form, Divider} from "semantic-ui-react";
import {ClassicCardPane} from "../index"
import {SETTINGS_PANE} from "../../../constants"

export default class SettingsPane extends React.Component{
    constructor(props){
        super(props);
        this.state={
            errorMsg:null,
            userName:props.settingsData.currentUser,
            password:props.settingsData.currentUserPassword,
            shouldModifyUserName:false,
            shouldModifyPassword:false,
            enableLogin: props.settingsData.enableLogin,
            secureSettings: props.settingsData.secureSettings,
            secureFileSystem: props.settingsData.secureFileSystem,
            secureDevops: props.settingsData.secureDevops,
            secureSSH: props.settingsData.secureSSH
        }
    }

    shouldUpdateAccessCredentials = ()=>{
        const props = this.props;
        return (this.state.userName !== props.settingsData.currentUser || 
                this.state.password !== props.settingsData.currentUserPassword ||
                this.state.enableLogin !== props.settingsData.enableLogin ||
                this.state.secureSettings !== props.settingsData.secureSettings ||
                this.state.secureFileSystem !== props.settingsData.secureFileSystem ||
                this.state.secureDevops !== props.settingsData.secureDevops ||
                this.state.secureSSH !== props.settingsData.secureSSH);
    }

    handleUpdateAccessCredentials = ()=>{
        const data = {
            userName: this.state.userName,
            password: this.state.password,
            enableLogin: this.state.enableLogin,
            secureSettings: this.state.secureSettings,
            secureFileSystem: this.state.secureFileSystem,
            secureDevops: this.state.secureDevops,
            secureSSH: this.state.secureSSH
        }
        this.props.updateUserAccessCredentials(this.props.settingsData.currentUser, data, (didUpdate, error)=>{
            if(didUpdate){
                this.props.renderComponent(SETTINGS_PANE);
            }else{
                alert("Update failed because of "+error);
            }
        });
    }

    onInputChanged = (field, event, isCheckField)=>{
        this.setState({
            [field]: isCheckField? !this.state[field] : event.target.value
        })
    }
    
    render(){
        return(
            <div className="match-parent">
                <div className="col-md-3 hidden-sm hidden-xs" style={{height:"100%"}}>
                    <div style={{padding:10, paddingTop:25}}>
                        <ClassicCardPane
                            headerComponent={<h5>Current Access Credentials{this.shouldUpdateAccessCredentials()&&"*"}</h5>}
                            bottomButtonText={this.shouldUpdateAccessCredentials()?"UPDATE":null}
                            bottomButtonAction = {this.handleUpdateAccessCredentials}
                        >
                            {this.state.errorMsg&&
                                <Message
                                    error
                                    header='Error'
                                    content={this.state.errorMsg}
                                />
                            }
                            <Form size="big">
                                <Form.Input 
                                    id="user-name-field"
                                    label="User Name"
                                    value={this.state.shouldModifyUserName?this.state.userName:this.props.settingsData.currentUser}
                                    onChange={(evt)=>this.state.shouldModifyUserName?this.onInputChanged("userName", evt):{}}/>
                                <a href="#user-name-field" 
                                    className="pull-right" 
                                    style={{marginTop:-15}} 
                                    onClick={()=>this.setState({shouldModifyUserName:!this.state.shouldModifyUserName})}>
                                        {this.state.shouldModifyUserName?"cancel":"modify"}
                                    </a>  
                                <Form.Input 
                                    id="password-field"
                                    label="Password"
                                    type="password"
                                    value={this.state.shouldModifyPassword?this.state.password:this.props.settingsData.currentUserPassword}
                                    onChange={(evt)=>this.state.shouldModifyPassword?this.onInputChanged("password", evt):{}} />
                                    <a href="#password-field" 
                                       className="pull-right" 
                                       style={{marginTop:-15}} 
                                       onClick={()=>this.setState({shouldModifyPassword:!this.state.shouldModifyPassword})}>
                                        {this.state.shouldModifyPassword?"cancel":"modify"}
                                    </a>
                                <Divider style={{paddingTop:15}} />    
                                <Form.Checkbox
                                    label = "Enable Login"
                                    value={this.state.enableLogin}
                                    style={{fontSize:12}}
                                    checked={this.state.enableLogin}
                                    onChange={(evt)=>this.onInputChanged("enableLogin", evt, true)} />
                                <Form.Checkbox
                                    label = "Secure Access to Settings"
                                    value={this.state.secureSettings}
                                    style={{fontSize:12, marginTop:-10}}
                                    checked={this.state.secureSettings}
                                    onChange={(evt)=>this.onInputChanged("secureSettings", evt, true)} />
                                <Form.Checkbox
                                    label = "Secure Access to File System View"
                                    value={this.state.secureFileSystem}
                                    style={{fontSize:11, marginTop:-10}}
                                    checked={this.state.secureFileSystem}
                                    onChange={(evt)=>this.onInputChanged("secureFileSystem", evt, true)} />
                                <Form.Checkbox
                                    label = "Secure Access to DevOps Pane"
                                    value={this.state.secureDevops}
                                    style={{fontSize:12, marginTop:-10}}
                                    checked={this.state.secureDevops}
                                    onChange={(evt)=>this.onInputChanged("secureDevops", evt, true)} />
                                <Form.Checkbox
                                    label = "Secure Access to Server SSH Session"
                                    value={this.state.secureSSH}
                                    style={{fontSize:11, marginTop:-10}}
                                    checked={this.state.secureSSH}
                                    onChange={(evt)=>this.onInputChanged("secureSSH", evt, true)} />                        
                            </Form>
                        </ClassicCardPane>
                    </div>
                    
                </div>
                <div className="col-md-9 centered-content" style={{height:"100%"}}>
                    <ClassicCardPane
                        headerComponent={<h5>Registered Servers</h5>}
                        matchParent={true}
                        style={{minWidth:"100%", minHeight:"97%"}}
                        
                    >
                        
                    </ClassicCardPane>            
                </div>
            </div>
        )
    }
}