import React from "react";
import Terminal from "../bash_term"
import TabPane from "../tab_pane"
import constants from "../../../constants"

export default class TerminalPane extends React.Component{
    constructor(props){
        super(props);
        this.tabCounter = 1;
        const tabComponents = this.getTabComponentSet()
        this.state={
            terminalTabs:[
                tabComponents,
                { TabHead: <span className="glyphicon glyphicon-plus dht-add-tab-icon" />}
            ],
            quickRuns:props.quickRuns,
            hideQuickRun:false,
            selectedTab: tabComponents.tabId
        }
    }

    getTabComponentSet = ()=>{
        const tabId = this.tabCounter++;
        const ref = React.createRef()
        return { 
                TabHead: <span>  {`DH-Term ${tabId}`} 
                            <span className="glyphicon glyphicon-remove dht-close-tab-icon" onClick={()=>this.removeTerminalTab(tabId)}/> 
                         </span>, 
                TabContent: <Terminal style={{width:"100%", height:"100%"}} eltRef={ref} sessionId={tabId}/>,
                tabId,
                eltRef:ref,
                removed:false
        }
    }

    getUserData = (userName, dataStore) => {
        for (let userData of dataStore){
            if (userName == userData.userName){
                return userData;
            }
        }
        return null;
    }

    loadUserQuickRuns = (dataStore)=>{
        const userData = this.getUserData(this.props.currentUser, dataStore);
        this.setState({
            quickRuns: userData.quickRuns
        });
    }

    handleAddNewQuickRun = ()=>{
        this.props.renderComponent(constants.NEW_QUICK_RUN_WINDOW, null, (didCreate, data)=>{
            if(didCreate){
                this.loadUserQuickRuns(data.payload);
            }
        })
    }

    handleUpdateQuickRun = (evt, quickRun)=>{
        evt.stopPropagation();
        this.props.renderComponent(constants.NEW_QUICK_RUN_WINDOW, quickRun, (didCreate, data)=>{
            if(didCreate){
                this.loadUserQuickRuns(data.payload);
            }
        })
    }

    removeTerminalTab = (tabId)=>{
        const index = this.state.terminalTabs.findIndex(elt=>elt.tabId===tabId);
        let selectedTabSet=false;
        let counter=1;
        while(((index-counter)>0 || (index+counter)<this.state.terminalTabs.length-1) && !selectedTabSet){
            const elt1  = this.state.terminalTabs[index+counter];
            const elt2  = this.state.terminalTabs[index-counter];
            if(elt1 && !elt1.removed || elt2 &&!elt2.removed){
                selectedTabSet=true
                this.setState({
                    selectedTab: elt1 && !elt1.removed? elt1.tabId : elt2.tabId
                })
            }
            counter++;
        }
        if(selectedTabSet){
            this.setState({
                terminalTabs: this.state.terminalTabs.map((elt, indx)=>{
                    if(elt.tabId==tabId){
                        elt.removed = true;
                    }
                    return elt;
                })
            })
        }
    }

    addNewTerminalTab = ()=>{
        const terminalTabs = [...this.state.terminalTabs];
        const index = terminalTabs.length-1
        const tabSet = this.getTabComponentSet()
        terminalTabs.splice(index, 0, tabSet)
        this.setState({ terminalTabs, selectedTab: tabSet.tabId})
    }

    handleTabChanged = (tabId, index)=>{
        if(index === this.state.terminalTabs.length-1){
            this.addNewTerminalTab()
        }else{
            this.setState({
                selectedTab:tabId
            })
            index = this.state.terminalTabs.findIndex(elt=>elt.tabId===tabId);
            this.state.terminalTabs[index].eltRef.current.focus()
        }
    }

    toggleHideQuickRun = (shouldHide)=>{
        this.setState({
            hideQuickRun: shouldHide
        });
    }

    runCommands = (commands, chainCommands)=>{
        const terminal = this.state.terminalTabs.find(elt=>elt.tabId===this.state.selectedTab);
        if(terminal && !terminal.removed && window.terminalSessions instanceof Array){
            const termInstance = window.terminalSessions.find(elt=>elt.sessionId === this.state.selectedTab);
            if(termInstance && termInstance.executeCommand instanceof Function){
                const re = new RegExp("\n", 'g');
                //commands = commands? commands.replace(re, chainCommands?"&&":";"):"";
                console.log("executing command `", commands, "`");
                termInstance.executeCommand(`${commands}\n`);
            }          
        }
    }

    render(){
        return (
            <div className="match-parent" style={{marginLeft:5}}>
                <div className="match-parent" style={{display:"flex", margin:5}}>
                    <div style={{flexGrow:1, height:"100%"}}>
                        <TabPane 
                            panes={this.state.terminalTabs} 
                            selectedTab={this.state.selectedTab}
                            style={{height:"100%"}} 
                            tabChanged={this.handleTabChanged}/>
                    </div>
                    {!this.state.hideQuickRun&&
                        <div style={{height:"100%"}}>
                            <div className="dht-quick-run">
                                <div className="dht-quick-run-header">
                                    <span> Quick Runs </span>
                                    <span>
                                        <a className="btn btn-default btn-xs" onClick={this.handleAddNewQuickRun}>+Add</a>&emsp;
                                        <a className="btn btn-info btn-xs" onClick={()=>this.toggleHideQuickRun(true)}>
                                            <span className="glyphicon glyphicon-arrow-right"/>
                                        </a>
                                    </span>    
                                </div>
                                <div className="dht-quick-run-content">
                                    {this.state.quickRuns instanceof Array && this.state.quickRuns.length>0?
                                        <div className="match-parent">
                                            <ul className="nav nav-pills nav-stacked">
                                                {
                                                    this.state.quickRuns.map((elt, i)=>(
                                                        <li onClick={()=>this.runCommands(elt.commands, elt.chainCommands)}>
                                                            <a className="word-match-width" href="#"> 
                                                                {elt.qrLabel} 
                                                                <span className="pull-right">
                                                                    &emsp;&emsp; <a className="btn btn-xs btn-default" onClick={(evt)=>this.handleUpdateQuickRun(evt, elt)}>Edit...</a>
                                                                </span>
                                                            </a>
                                                        </li>
                                                    ))
                                                }
                                            </ul>
                                        </div>
                                        :
                                        <div className="match-parent centered-content">
                                            <span>No quick runs yet</span>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    }
                    {this.state.hideQuickRun&&
                        <div style={{minWidth:20}}>
                            <a className="btn btn-info btn-xs pull-left" onClick={()=>this.toggleHideQuickRun(false)} style={{marginLeft:-25}}>
                                <span className="glyphicon glyphicon-arrow-left" />
                            </a>
                        </div>
                    }
                </div> 
            </div>
        )
    }
}