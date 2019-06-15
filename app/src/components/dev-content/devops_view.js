import React from "react";
import SystemPerformancePane from "./devops/system_perf"
import {Button} from "semantic-ui-react"
import {HOME_VIEW} from "../../../constants"
export default class DevOpsView extends React.Component{
    state={
        selectedItem: "system-performance"
    }
    selectOption = (option)=>{
        this.setState({
            selectedItem: option
        });
    }
    render(){
        return (
            <div className="match-parent centered-content">
                {/* <div className="col-md-3" style={{display:"flex", flexDirection:"column", marginTop:5, marginBottom:5, borderRight:"2px solid #424242", height:"100%"}}>
                    <div style={{width:"100%", height:"2.5em", lineHeight:"2.5em", textAlign:"center", backgroundColor:"#424242"}}>
                        Operations
                    </div>
                    <div style={{flexGrow:1}}>
                        <ul className="nav nav-pills nav-stacked" style={{margin:"5px 10px"}}>
                            <li className={this.state.selectedItem==="system-performance"?"active":""}
                                onClick={()=>this.selectOption("system-performance")}>
                                <a href="#">
                                    System Performance
                                </a>
                            </li>
                            <li className={this.state.selectedItem==="git-deploy"?"active":""}
                                onClick={()=>this.selectOption("git-deploy")}>
                                <a href="#">
                                    Deploy from Git
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="col-md-9">
                    {this.state.selectedItem === "system-performance" &&
                        <SystemPerformancePane />
                    }
                    {this.state.selectedItem === "git-deploy" &&
                        <div>Git deployment here</div>
                    }
                </div> */}
                <div style={{textAlign:"center"}}>
                    <h3>This functionality is not currently available for this version of Dev-Honcho</h3>
                    <Button primary size="big" onClick={()=>this.props.renderComponent(HOME_VIEW)}>HOME</Button>
                </div>
            </div>
        )
    }
}