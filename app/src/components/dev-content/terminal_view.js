import React from "react";
import Terminal from "../bash_term"
import TabPane from "../tab_pane"

export default class TerminalPane extends React.Component{
    constructor(props){
        super(props);
        this.terminalTabs =  [
            { menuItem: 'DH-Term 1', render: () => <Tab.Pane attached='top'><Terminal style={{width:"100%", height:"100%"}} /></Tab.Pane> },
            { menuItem: 'Add', render: () => <Tab.Pane attached='top'>Tab 2 Content</Tab.Pane> }
        ]
    }
    render(){
        return (
            <div className="match-parent">
                <div style={{display:"flex"}}>
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