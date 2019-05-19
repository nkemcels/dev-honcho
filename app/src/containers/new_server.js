import React from "react";
import {Menu, Card, Grid, Segment, Form, Button, Message} from "semantic-ui-react";
import {Header, Footer, Pane} from "../components";
import {ipcRenderer} from "electron";
import "../styles.css";

export default class NewServerPane extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            serverName:"",
            ipDns:"",
            serverUser:"",
            pemFileName:"",
            pemFilePath:"",
            notification:null
        }
        ipcRenderer.on("notification", this.handleNewNotification)
    }
    handleNewNotification = (event, args)=>{
        if(args.type=="FAILURE"){
            this.setState({
                notification: args.payload
            }, ()=>{
                setTimeout(() => {
                    this.setState({notification:null})
                }, 5000);
            })
        }
        
    }
    onInputChange = (field, evt)=>{
        this.setState({
            [field]: evt.target.value,
            pemFilePath: field === "pemFileName" ? evt.target.files[0].path : this.state.pemFilePath
        })
    }
    handleSaveInstanceData = ()=>{
        ipcRenderer.send("submit-server-instance-data", {
            serverName: this.state.serverName,
            serverUser: this.state.serverUser,
            ipDns: this.state.ipDns,
            pemFilePath: this.state.pemFilePath
        });
    }
    handleCancelOperation = ()=>{
        ipcRenderer.send("submit-server-instance-data", null)
    }
    render(){
        return (
            <div className="app-container">
                <Header selectedMenu="Add New Server"/>
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
                                            placeholder="Server's name e.g `Dev-Honcho Production Server - Root`"/>
                                        <Form.Input 
                                            style={{width:350}}
                                            label="IP / DNS"
                                            value={this.state.ipDns}
                                            onChange={(evt)=>this.onInputChange("ipDns", evt)}
                                            placeholder="Server's IP address or domain name e.g `192.168.0.1`"/>
                                        <Form.Input 
                                            label="User Name"
                                            style={{width:350}}
                                            value={this.state.serverUser}
                                            onChange={(evt)=>this.onInputChange("serverUser", evt)}
                                            placeholder="Your user name on the server e.g `root`"/>
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
                                            primary >Done</Button>
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