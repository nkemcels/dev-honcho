import React from "react";
import {remote} from "electron"
import {homedir} from "os"
import * as fit from 'xterm/lib/addons/fit/fit';
import * as webLinks from 'xterm/lib/addons/webLinks/webLinks'
import * as winptyCompat from 'xterm/lib/addons/winptyCompat/winptyCompat';
import "./bash_term.css"
import _ from "lodash"

let os = require('os');
let pty = remote.require('node-pty');
let Terminal = require('xterm').Terminal;

Terminal.applyAddon(fit);
Terminal.applyAddon(webLinks);
Terminal.applyAddon(winptyCompat);

let termOptions = {
    scrollback: 1000,
    cursorStyle: "block",
    cursorBlink: true,
    fontFamily: 'Menlo, "DejaVu Sans Mono", "Lucida Console", monospace',
    fontSize: 14,
    fontWeight: "normal",
    fontWeightBold: "bold",
    lineHeight: 1,
    letterSpacing: 0
    // allowTransparency: needTransparency,
}

// Initialize node-pty with an appropriate shell
const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];


export default class TerminalComponent extends React.Component{
    constructor(props){
        super(props);
        this.xtermWrapperRef = props.eltRef;
        this.ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 1500,
            rows: 600,
            cwd: homedir(),
            env: process.env
        });
    }
    componentDidMount(){
        // let xtermWidth = this.xtermWrapperRef.current.offsetWidth;
        // let xtermHeight = this.xtermWrapperRef.current.offsetHeight;
         
        this.initNewTerminalSession()

        remote.getCurrentWindow().on("resize", this.debounce(()=>{
            this.xterm.fit()
        }, 250))

        if(!window.terminalSessions){
            window.terminalSessions = []
        }
        window.terminalSessions = window.terminalSessions.filter(elt=>elt.sessionId!=this.props.sessionId)  //remove any existing session
        window.terminalSessions = [{sessionId: this.props.sessionId, executeCommand: this.executeCommand}, ...window.terminalSessions]
    }
    initNewTerminalSession=()=>{
        // // Initialize xterm.js and attach it to the DOM
        this.xterm = new Terminal(termOptions);
        this.xterm.open(this.xtermWrapperRef.current);
        this.xterm.webLinksInit();
        this.xterm.winptyCompatInit();
        this.xterm.fit();
        this.xterm.focus();

        // Setup communication between xterm.js and node-pty
        this.xterm.on('data', (data) => {
            this.ptyProcess.write(data);
        });
        if(!this.ptyListenerAdded){  //to ensure that we always have a single pty process
            this.ptyProcess.on('data', (data)=>{
                this.xterm.write(data);
            });

            this.ptyListenerAdded = true
        }
    }
    debounce=(fn, intv)=>{
        return ()=>{
            if(this.interval) return;
            this.interval = setTimeout(() => {
                if(fn instanceof Function){
                    fn();
                    clearTimeout(this.interval);
                    delete this.interval;
                }
            }, intv);
        }
    }

    executeCommand = (commands, displayCommands=true)=>{
        if(!this) return;
        if(displayCommands){
            if(this.xterm){
                //this.xterm.writeln(commands)
                this.xterm.emit("data", commands)
            }
        }else{
            if(this.ptyProcess){
                this.ptyProcess.write(`${commands}\n`);
            }
        }
    }

    render(){
        return(
            <div style={{width:"100%", height:"100%"}}>
                <div ref={this.xtermWrapperRef} style={{width:"100%", height:"100%"}} />
            </div>
        )
    }
}