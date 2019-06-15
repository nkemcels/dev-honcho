import React from "react";
import {ipcRenderer as ipc} from "electron";

export default class SystemPerformance extends React.Component{
    state = {
        cpuStats: [{item:"User", value:20},{item:"System", value:70},{item:"Idle", value:15}]
    }
    fetchStats = ()=>{
        ipc.send("get-all-sys-stats")
        ipc.once("get-all-sys-stats-response", (data)=>{
            if(data.result==="OK"){
                console.log("data-payload: ", data.payload)
            }
        })
    }
    componentDidMount(){
        this.fetchStats();
    }
    render(){
        return (
            <div style={{width:"100%", height:"100%", marginTop:10}}>
            {
                <div>
                    <div>
                        <BarStatsPane
                            title={"CPU Statistics"}
                            data={this.state.cpuStats} />
                    </div>
                </div>
            }
            </div>
        )
    }
}

const BarStatsPane = (props)=>{
    return (
        <div>
            <div style={{borderBottom:"2px solid #424242", textAlign:"right"}}>
                <span style={{height:"1.5em", lineHeight:"1.5em", padding:5, backgroundColor:"#424242", minWidth:150, color:"whitesmoke"}}>
                    {props.title}
                </span>
            </div>
            <div style={{margin:"5px 10px"}}>
                <div style={{display:"flex", flexWrap:"wrap", justifyContent:"space-between"}}>
                    {props.data instanceof Array && props.data.map((elt, i)=>(
                        <div style={{display:"flex", minWidth:350, margin:3}}>
                            <div style={{marginRight:5}}><b>{elt.item}</b></div>
                            <div style={{marginRight:5, flexGrow:1, height:"100%", 
                                border:`1px solid ${
                                    elt.value<=10?"#01579B":
                                    elt.value<=20?"#006064":
                                    elt.value<=30?"#004D40":
                                    elt.value<=40?"#1B5E20":
                                    elt.value<=50?"#33691E":
                                    elt.value<=60?"#827717":
                                    elt.value<=80?"#E65100":"#BF360C"
                            }`}}>
                                <div style={{width:`${elt.value}%`, height:"100%",
                                             backgroundColor:
                                                    elt.value<=10?"#0288D1":
                                                    elt.value<=20?"#0097A7":
                                                    elt.value<=30?"#26A69A":
                                                    elt.value<=40?"#4CAF50":
                                                    elt.value<=50?"#8BC34A":
                                                    elt.value<=60?"#CDDC39":
                                                    elt.value<=80?"#FF9800":"#FF5722"}} />
                            </div>
                            <div style={{color:elt.value<=10?"#01579B":
                                                elt.value<=20?"#006064":
                                                elt.value<=30?"#004D40":
                                                elt.value<=40?"#1B5E20":
                                                elt.value<=50?"#33691E":
                                                elt.value<=60?"#827717":
                                                elt.value<=80?"#E65100":"#BF360C"}}>{elt.value}%</div>
                        </div>
                    ))
                    }
                </div>
            </div>
        </div>
    )
}