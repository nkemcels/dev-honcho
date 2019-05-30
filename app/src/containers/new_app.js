import React from "react";
import { Grid, Segment, Form, Button, Message} from "semantic-ui-react";
import {Header, Footer, Pane} from "../components";
import {ipcRenderer} from "electron";
import "../styles.css";
import {UnControlled as CodeMirror} from "react-codemirror2"
require("codemirror/mode/shell/shell");
require("codemirror/mode/javascript/javascript");

export default class NewAppPane extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            serverName:"",
            appName:"",
            baseDir:"",
            gitRepo:"",
            deployCommands:""
        }
        ipcRenderer.on("notification", this.handleNewNotification);
        ipcRenderer.send("get-modal-window-props");
        ipcRenderer.once("get-modal-window-props-response", this.initializeComponent)
    }

    initializeComponent = (event, response)=>{
        console.log("response: ", response)
        if(response && response.payload){
            const data = response.payload;
            this.setState({
                serverName:data.serverName,
                appName:data.appName?data.appName:"",
                baseDir:data.baseDir?data.baseDir:"",
                gitRepo:data.gitRepo?data.gitRepo:"",
                deployCommands:data.deployCommands?data.deployCommands:"",
                isToUpdate:data.appName?true:false
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
            [field]: evt.target.value
        });
    }
    handleSaveInstanceAppData = ()=>{
        if(!this.state.appName || this.state.appName.trim() == ""){
            this.displayError("Please provide a valid name for your app");return;
        }
        ipcRenderer.send("open-modal-window-response", {
            serverName: this.state.serverName.trim(),
            appName: this.state.appName.trim(),
            baseDir: this.state.baseDir.trim(),
            gitRepo: this.state.gitRepo.trim(),
            deployCommands: this.state.deployCommands.trim(),
            isToUpdate: this.state.isToUpdate
        });
    }
    handleCancelOperation = ()=>{
        ipcRenderer.send("open-modal-window-response", null)
    }
    render(){
        return (
            <div className="app-container" style={{overflow:"hidden"}}>
                <Header selectedMenu={this.props.title?this.props.title:this.state.isToUpdate?"Update Server Instance App":"Add Server Instance App"} />
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
                                    <b style={{marginLeft:200}}>{this.state.serverName}</b>
                                    <hr style={{margin:"5px 0px", padding:0}}/>
                                    <Form size="big" style={{marginLeft:-100, marginTop:30}}>
                                        <Form.Input 
                                            style={{width:350}}
                                            label="App Name"
                                            value={this.state.appName}
                                            onChange={(evt)=>this.onInputChange("appName", evt)}
                                            placeholder="The Application Name e.g `E-Commerce project`"
                                            required/>
                                        <Form.Input 
                                            style={{width:350}}
                                            label="Base Directory"
                                            value={this.state.baseDir}
                                            onChange={(evt)=>this.onInputChange("baseDir", evt)}
                                            placeholder="The absolute path to the app's root/deployment directory" />
                                        <Form.Input 
                                            label="Git Repository"
                                            style={{width:350}}
                                            fluid
                                            value={this.state.gitRepo}
                                            onChange={(evt)=>this.onInputChange("gitRepo", evt)}
                                            placeholder="Your user name on the server e.g `root`"/>
                                    </Form>
                                    <div style={{marginTop:10, marginLeft:80}}>
                                    <b style={{fontSize:13}}>Deployment Commands (from <b style={{color:"#666", fontFamily:"monospace"}}>user@Remote:~$)</b></b>
                                        <CodeMirror
                                            value={this.state.deployCommands}
                                            options={{
                                                mode: 'shell',
                                                theme: 'abcdef',
                                                lineNumbers: true
                                            }}
                                            onChange={(editor, data, value) => {
                                                this.setState({
                                                    deployCommands:value
                                                })
                                            }}
                                        /> 
                                    </div>
                                    <hr />
                                    <div style={{textAlign:"center"}}>
                                        <Button 
                                            size="big" 
                                            style={{display:"inline-block", marginRight:10}} 
                                            onClick={this.handleSaveInstanceAppData}
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