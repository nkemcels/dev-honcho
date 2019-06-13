import React from "react"

export default class TabPane extends React.Component{
    constructor(props){
        super(props);
        this.state={
            selectedTab:props.selectedTab?props.selectedTab:this.props.panes instanceof Array && this.props.panes[0].tabId
        }
    }
    
    handleTabClicked = (tabId, indx)=>{
        if(this.state.selectedTab === tabId) return;
        this.setState({
            selectedTab:tabId?tabId:this.state.selectedTab
        });
        this.props.tabChanged(tabId, indx);
    }
    componentWillReceiveProps(props){
        this.setState({
            selectedTab:props.selectedTab?props.selectedTab:props.panes instanceof Array && this.props.panes[0].tabId
        })
    }
    render(){
        return(
            <div style={this.props.style?this.props.style:{}}>
                <div className="match-parent dht-tab-container">
                    <div className="dht-tab-items">
                    {this.props.panes instanceof Array && this.props.panes.map((elt, indx)=>(
                        !elt.removed&& 
                        <div className={`dht-tab-item ${elt.tabId===this.state.selectedTab?"dht-active-tab":""}`} 
                             onClick={()=>this.handleTabClicked(elt.tabId, indx)}>
                            { elt.TabHead }
                        </div>
                    ))}
                    </div>
                    <div style={{flexGrow:1, width:"100%"}}>
                    {this.props.panes instanceof Array && this.props.panes.map((elt, indx)=>(
                        elt.TabContent && !elt.removed?
                        <div className={`${elt.tabId!==this.state.selectedTab?"dht-hide-tab-content":"match-parent"}`}>
                            { elt.TabContent }
                        </div>
                        :
                        null
                    ))}
                    </div>    
                </div>    
            </div>
        )
    }
}