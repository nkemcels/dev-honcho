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
            qrLabel:"",
            commands:"",
            defaultCommands:"",
            chainCommands:false
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
                qrLabel:data.qrLabel?data.qrLabel:"",
                commands:data.commands?data.commands:"",
                defaultCommands:data.commands?data.commands:"",
                chainCommands:data.chainCommands?data.chainCommands:false,
                isToUpdate:data.qrLabel?true:false
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
    handleSaveQuickRunData = ()=>{
        if(!this.state.commands || this.state.commands.trim() == ""){
            this.displayError("No commands entered")
        }
        if(!this.state.qrLabel || this.state.qrLabel.trim() == ""){
            this.displayError("A valid label is required for these quick run commands");return;
        }
        
        ipcRenderer.send("open-modal-window-response", {
            qrLabel: this.state.qrLabel.trim(),
            commands: this.state.commands.trim(),
            chainCommands: this.state.chainCommands,
            isToUpdate: this.state.isToUpdate
        });
    }
    handleCancelOperation = ()=>{
        ipcRenderer.send("open-modal-window-response", null)
    }
    render(){
        return (
            <div className="app-container" style={{overflow:"hidden"}}>
                <Header selectedMenu={this.props.title?this.props.title:this.state.isToUpdate?"Update Quick run commands":"Add new quick run command"} />
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
                                    <Form size="big" style={{marginLeft:-100, marginTop:30}}>
                                        <Form.Input 
                                            style={{width:350}}
                                            label="Label"
                                            value={this.state.qrLabel}
                                            onChange={(evt)=>this.onInputChange("qrLabel", evt)}
                                            placeholder="Any strings to describe your quick run commands"
                                            required/>
                                    </Form>
                                    <div style={{marginTop:10, marginLeft:80}}>
                                    <b style={{fontSize:13}}>Quick Run Commands</b>
                                        <CodeMirror
                                            value={this.state.defaultCommands}
                                            options={{
                                                mode: 'shell',
                                                theme: 'abcdef',
                                                lineNumbers: true
                                            }}
                                            onChange={(editor, data, value) => {
                                                this.setState({
                                                    commands:value
                                                })
                                            }}
                                        /> 
                                    </div>
                                    <Form size="big" style={{marginLeft:-100}}>
                                        <Form.Checkbox 
                                            style={{width:500}}
                                            size="large"
                                            label="Chain Commands (Will execute next command only if the previous succeeded)"
                                            value={this.state.chainCommands}
                                            onChange={(evt)=>this.onInputChange("chainCommands", evt)}
                                            required/>
                                    </Form>
                                    <hr />
                                    <div style={{textAlign:"center"}}>
                                        <Button 
                                            size="big" 
                                            style={{display:"inline-block", marginRight:10}} 
                                            onClick={this.handleSaveQuickRunData}
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