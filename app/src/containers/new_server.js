import React from "react";
import {Grid, Segment, Form, Button, Message} from "semantic-ui-react";
import {Header, Footer, Pane} from "../components";
import {ipcRenderer} from "electron";
import "../styles.css";

export default class NewServerPane extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            serverName:"",
            ipDns:"",
            sshPort:"",
            serverUser:"",
            serverUserPwd:"",
            pemFileName:"",
            pemFilePath:"",
            isToUpdate:false,
            notification:null
        }
        ipcRenderer.on("notification", this.handleNewNotification);
        ipcRenderer.send("get-modal-window-props");
        ipcRenderer.once("get-modal-window-props-response", this.initializeComponent)
    }

    initializeComponent = (event, response)=>{
        if(response && response.payload){
            const data = response.payload;
            this.setState({
                serverName:data.serverName?data.serverName:"",
                ipDns:data.ipDns?data.ipDns:"",
                sshPort:data.sshPort?data.sshPort:"",
                serverUser:data.serverUser?data.serverUser:"",
                serverUserPwd:data.serverUserPwd?data.serverUserPwd:"",
                pemFileName:data.pemFileName?data.pemFileName:"",
                pemFilePath:data.pemFilePath?data.pemFilePath:"",
                isToUpdate:data.serverName?true:false
            });
        }
    }

    displayError = (error)=>{
        this.setState({
            notification: error
        }, ()=>{
            setTimeout(() => {
                this.setState({ notification:null })
            }, 5000);
        });
    }

    handleNewNotification = (event, args)=>{
        if(args.result=="FAILED"){
            this.displayError(args.error)
        }
    }
    onInputChange = (field, evt)=>{
        this.setState({
            [field]: evt.target.value,
            pemFilePath: field === "pemFileName" ? evt.target.files[0].path : this.state.pemFilePath
        });
    }
    handleSaveInstanceData = ()=>{
        if(!this.state.serverName || this.state.serverName.trim() == ""){
            this.displayError("Please provide a valid server name");return;
        }
        if(!this.state.ipDns || this.state.ipDns.trim() == ""){
            this.displayError("Please provide a Ip Address or Domain name for '"+this.state.serverName+"'");return;
        }
        if(!this.state.serverUser || this.state.serverUser.trim() == ""){
            this.displayError("Your server username is required");return;
        }
        ipcRenderer.send("open-modal-window-response", {
            serverName: this.state.serverName.trim(),
            serverUser: this.state.serverUser.trim(),
            serverUserPwd: this.state.serverUserPwd,
            ipDns: this.state.ipDns.trim(),
            pemFilePath: this.state.pemFilePath.trim(),
            sshPort: this.state.sshPort.trim(),
            isToUpdate: this.state.isToUpdate
        });
    }
    handleCancelOperation = ()=>{
        ipcRenderer.send("open-modal-window-response", null)
    }
    render(){
        return (
            <div className="app-container" style={{overflow:"hidden"}}>
                <Header selectedMenu={this.props.title?this.props.title:this.state.isToUpdate?"Update Server Instance":"Add Server Instance"} />
                <Pane>
                    <div className="match-parent">
                        <Segment placeholder size="huge" className="match-parent">
                            <Grid textAlign='center' className="match-parent">
                                <div className="match-parent">
                                    {this.state.notification&&
                                        <Message
                                            error
                                            header='Error'
                                            content={this.state.notification}
                                        />
                                    }
                                    <Form size="big" style={{marginLeft:-100, marginTop:50}}>
                                        <Form.Input 
                                            style={{width:350}}
                                            label="Server Name"
                                            value={this.state.serverName}
                                            onChange={(evt)=>this.onInputChange("serverName", evt)}
                                            placeholder="Server's name e.g `Dev-Honcho Production Server - Root`"
                                            required/>
                                        <Form.Input 
                                            style={{width:350}}
                                            label="IP / DNS"
                                            value={this.state.ipDns}
                                            onChange={(evt)=>this.onInputChange("ipDns", evt)}
                                            placeholder="Server's IP address or domain name e.g `192.168.0.1`"
                                            required/>
                                        <Form.Group style={{width:350, marginLeft:293}} widths="equal">
                                            <Form.Input 
                                                label="User Name"
                                                //style={{width:170}}
                                                fluid
                                                value={this.state.serverUser}
                                                onChange={(evt)=>this.onInputChange("serverUser", evt)}
                                                placeholder="Your user name on the server e.g `root`"
                                                required/>
                                            <Form.Input 
                                                label="Password"
                                                //style={{width:170}}
                                                fluid
                                                value={this.state.serverUserPwd}
                                                onChange={(evt)=>this.onInputChange("serverUserPwd", evt)}
                                                type="password"
                                                placeholder="Your access password"/>
                                        </Form.Group>
                                        <Form.Input 
                                            style={{width:350}}
                                            label="SSH Port"
                                            value={this.state.sshPort}
                                            onChange={(evt)=>this.onInputChange("sshPort", evt)}
                                            placeholder="Default 22`"/>    
                                        <Form.Input
                                            style={{width:350}} 
                                            value={this.state.pemFileName}
                                            onChange={(evt)=>this.onInputChange("pemFileName", evt)}
                                            label="Permission File"
                                            labelPosition="left"
                                            type="file"/>            
                                    </Form>
                                    <hr />
                                    <div style={{textAlign:"center"}}>
                                        <Button 
                                            size="big" 
                                            style={{display:"inline-block", marginRight:10}} 
                                            onClick={this.handleSaveInstanceData}
                                            primary >{this.state.isToUpdate?"Update":"Save"}</Button>
                                        <Button 
                                            size="big" 
                                            style={{display:"inline-block"}} 
                                            onClick={this.handleCancelOperation}
                                            negative >Cancel</Button>
                                    </div>
                                </div>
                            </Grid>
                        </Segment>
                    </div>
                </Pane>
                <Footer />
            </div>
        )
    }
}