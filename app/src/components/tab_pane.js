import React from "react"

export default class TabPane extends React.Component{
    state={
        selectedTab:0
    }
    handleTabClicked = (indx)=>{
        if(this.state.selectedTab === indx) return;
        this.setState({
            selectedTab:indx
        });
        this.props.tabChanged(indx);
    }
    render(){
        return(
            <div style={this.props.style?this.props.style:{}}>
                <div className="match-parent dht-tab-container">
                    <div className="dht-tab-items">
                    {this.props.panes instanceof Array && this.props.panes.map((elt, indx)=>(
                        <div className={`dht-tab-item ${indx===this.state.selectedTab?"dht-active-tab":""}`} 
                             onClick={()=>this.handleTabClicked(indx)}>
                            {  elt.TabHead }
                        </div>
                    ))}
                    </div>
                    <div style={{flexGrow:1, width:"100%"}}>
                    {this.props.panes instanceof Array && this.props.panes.map((elt, indx)=>(
                        <div className={`match-parent ${indx!==this.state.selectedTab?"dht-hide-tab-content":""}`}>
                            {  elt.TabContent }
                        </div>
                    ))}
                    </div>    
                </div>    
            </div>
        )
    }
}