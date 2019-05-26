import React from 'react';
import path from "path";
import {Loader, Dimmer} from "semantic-ui-react";

const styles={
    root:{

    }
}

export default class FileComponent extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            highlight:false,
            select:false,
            loading:false,
            name: props.filename
        }
    }
    componentWillReceiveProps(props){
        this.setState({
            loading:false,
            name: props.filename
        });
    }
    handleMouseEntered= ()=>{
        this.setState({
            highlight:true
        })
    }
    handleMouseExited= ()=>{
        this.setState({
            highlight:false
        })
    }
    handleMouseDoubleClicked= (event)=>{
        this.setState({
            loading:true
        })
        this.props.fileDoubleClicked(this.props.filename, this.props.filetype)
    }

    stripSeparator = (str)=>{
        if (str.endsWith(path.sep)){
            return str.substring(0, str.lastIndexOf(path.sep));
        }
        return str;
    }

    render(){        
        return (
            <div style={{textAlign:'center', 
                          margin:'10px 5px',  
                          backgroundColor:this.state.highlight?"#E8EAF6":null, 
                          border: this.state.highlight?"1px solid #9FA8DA":null,
                          borderRadius: this.state.highlight?1:0,
                          cursor:'pointer', width:120, height:80 }} 
                 onMouseEnter={this.handleMouseEntered} 
                 onMouseLeave={this.handleMouseExited}
                 onDoubleClick={this.handleMouseDoubleClicked}>
                 {this.props.filetype=='FILE'?
                    <div>
                        <div className="file-component">
                            <span className='glyphicon glyphicon-file' style={{fontSize:45, margin:5, position:'relative', color:"#FFA726"}}/>
                            <span style={{position:'absolute', top:35, left:0, right:0, bottom:0, color:'white', fontSize:10}}><b>{this.props.ext.toUpperCase()}</b></span>
                        </div>
                        <div style={{wordWrap:'break-word', textOverflow:'ellipsis', overflow: 'hidden', width:'100%', whiteSpace: 'nowrap', textAlign:'center'}}>{this.props.filename}</div>
                    </div>
                    :
                    <div className="folder-component">
                        <span className={`glyphicon glyphicon-folder-${this.state.loading?"open":"close"}`} style={{fontSize:45, margin:5, color:this.state.loading?"#64B5F6":"#01579B"}}>
                            
                        </span><br />
                        <div style={{wordWrap:'break-word', textOverflow:'ellipsis', overflow: 'hidden', width:'100%', whiteSpace: 'nowrap', textAlign:'center'}}>
                            {this.state.loading?<b>Opening...</b>:this.stripSeparator(this.props.filename)}
                        </div>
                    </div>
                 }
            </div>
        )
    }
    
}