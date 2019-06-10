import React from "react";
import Terminal from "../bash_term"
import TabPane from "../tab_pane"

export default class TerminalPane extends React.Component{
    constructor(props){
        super(props);
        this.terminalTabs =  [
            { TabHead: this.getTabHeadComponent('DH-Term 1'), TabContent: <Terminal style={{width:"100%", height:"100%"}} /> },
            { TabHead: this.getTabHeadComponent("Add"), TabContent: <span> content 2 </span> }
        ]
    }

    getTabHeadComponent = (text)=>{
        return (
            <span>{text}</span>
        )
    }

    render(){
        return (
            <div className="match-parent">
                <div style={{display:"flex", margin:5}}>
                    <div style={{flexGrow:1}}>
                        <TabPane panes={this.terminalTabs} />
                    </div>
                    <div>
                        <div className="dht-quick-run">
                            <div className="dht-quick-run-header">
                                <span> Quick Runs </span>
                                <span className="pull-right">
                                    <a className="btn btn-default">+Add</a>&emsp;
                                    <a className="btn btn-primary">Back Arrow</a>
                                </span>    
                            </div>
                            <div className="dht-quick-run-content">

                            </div>
                        </div>
                    </div>
                </div> 
            </div>
        )
    }
}