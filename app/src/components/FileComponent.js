import React from 'react';
import path from "path";
import {Loader, Dimmer} from "semantic-ui-react";
import exeIcon from "../../images/exe.icon.png"
import symlinkIcon from "../../images/symlink.icon.png"
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
            name: props.file.name
        }
    }
    componentWillReceiveProps(props){
        this.setState({
            name: props.file.name
        });
    }
    handleMouseEntered= ()=>{
        this.setState({
            highlight:this.props.openning?false:true
        })
    }
    handleMouseExited= ()=>{
        this.setState({
            highlight:false
        })
    }
    handleMouseDoubleClicked= (event)=>{
        event.stopPropagation();
        if(!this.props.openning){
            this.setState({
                highlight:false
            });
            this.props.fileDoubleClicked(this.props.file.name, this.props.file.type)
        }
    }

    handleMouseClicked = (event)=>{
        event.stopPropagation();
        if(!this.props.openning){
            this.props.fileClicked(this.props.file.name, this.props.file.type);
        }
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
                          backgroundColor:this.props.selected? "#C5CAE9":this.state.highlight?"#E8EAF6":null, 
                          border: (this.state.highlight||this.props.selected)?"1px solid #9FA8DA":null,
                          borderRadius: (this.state.highlight||this.props.selected)?1:0,
                          cursor:'pointer', width:120, height:80 }} 
                 onMouseEnter={this.handleMouseEntered} 
                 onMouseLeave={this.handleMouseExited}
                 onDoubleClick={this.handleMouseDoubleClicked}
                 onClick={this.handleMouseClicked}>
                 {this.props.file.type=='EXE'||this.props.file.type=='SYMLINK'?
                    <div style={{opacity: this.props.cutActivated&&this.props.activated? 0.6:1}} draggable>
                        <div className="file-component">
                            <img src={this.props.file.type=='SYMLINK'?symlinkIcon:exeIcon} style={{display:"inline-block", width:55, height:55}} />
                        </div>
                        <div style={{wordWrap:'break-word', textOverflow:'ellipsis', overflow: 'hidden', width:'100%', whiteSpace: 'nowrap', textAlign:'center'}}>{this.props.file.name}</div>
                    </div>
                    :
                this.props.file.type=='DIRECTORY'?    
                    <div style={{opacity: this.props.cutActivated&&this.props.activated? 0.6:1}} draggable>
                        <div className="folder-component">
                            <span className={`glyphicon glyphicon-folder-${this.props.openning?"open":"close"}`} style={{fontSize:45, margin:5, color:this.props.openning?"#A1887F":"#3E2723"}}>
                            </span><br />
                            <div style={{wordWrap:'break-word', textOverflow:'ellipsis', overflow: 'hidden', width:'100%', whiteSpace: 'nowrap', textAlign:'center'}}>
                                {this.props.openning?<b style={{fontSize:11.5}}>Opening...</b>:this.stripSeparator(this.props.file.name)}
                            </div>
                        </div>
                    </div>
                    :
                    <div style={{opacity: this.props.cutActivated&&this.props.activated? 0.6:1}} draggable>
                        <div className="file-component">
                            <span className='glyphicon glyphicon-file' style={{fontSize:45, margin:5, position:'relative', color:this.props.openning?"#90A4AE":"#546E7A"}}/>
                            <span style={{position:'absolute', top:35, left:0, right:0, bottom:0, color:'white', fontSize:9}}>
                                <b>{this.props.file.type=='FIFO'||this.props.file.type=='SOCKET'? this.props.file.type:this.props.file.extension.toUpperCase()}</b>
                            </span>
                        </div>
                        <div style={{wordWrap:'break-word', textOverflow:'ellipsis', overflow: 'hidden', width:'100%', whiteSpace: 'nowrap', textAlign:'center'}}>{this.props.file.name}</div>
                    </div>
                 }
            </div>
        )
    }
    
}


export class FileListComponent extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            highlight:false,
            select:false,
            name: props.file.name
        }
    }
    componentWillReceiveProps(props){
        this.setState({
            name: props.file.name
        });
    }
    handleMouseEntered= ()=>{
        this.setState({
            highlight:this.props.openning?false:true
        })
    }
    handleMouseExited= ()=>{
        this.setState({
            highlight:false
        })
    }
    handleMouseDoubleClicked= (event)=>{
        event.stopPropagation();
        if(!this.props.openning){
            this.setState({
                highlight:false
            });
            this.props.fileDoubleClicked(this.props.file.name, this.props.file.type)
        }
    }

    handleMouseClicked = (event)=>{
        event.stopPropagation();
        if(!this.props.openning){
            this.props.fileClicked(this.props.file.name, this.props.file.type);
        }
    }

    stripSeparator = (str)=>{
        if (str.endsWith(path.sep)){
            return str.substring(0, str.lastIndexOf(path.sep));
        }
        return str;
    }

    render(){        
        return (
            <div style={{width:"100%"}}>
                <div style={{width:"100%",
                            padding:'3px 5px',
                            display:"block",
                            backgroundColor:this.props.selected? "#C5CAE9":this.state.highlight?"#E8EAF6":null, 
                            cursor:'pointer'}} 
                    onMouseEnter={this.handleMouseEntered} 
                    onMouseLeave={this.handleMouseExited}
                    onDoubleClick={this.handleMouseDoubleClicked}
                    onClick={this.handleMouseClicked}>
                    {this.props.file.type=='SYMLINK' || this.props.file.type=='EXE'?
                        <div style={{opacity: this.props.cutActivated&&this.props.activated? 0.6:1}} draggable>
                            <div className="file-component" style={{display:"flex", width:"100%", alignItems:"center"}}>
                                <img src={this.props.file.type=='SYMLINK'?symlinkIcon:exeIcon} style={{display:"inline-block", width:32, height:"auto"}} />
                                <div style={{width:"50%", wordWrap:'break-word', textOverflow:'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>
                                    {this.props.openning?<b style={{fontSize:11.5, paddingLeft:5}}>Opening...</b>:this.stripSeparator(this.props.file.name)}
                                </div>
                                <div style={{width:"10%"}}>
                                   {this.props.file.size}
                                </div>
                                <div style={{width:"12%"}}>
                                   {this.props.file.type=='SYMLINK'?"Symbolic Link":"Program"}
                                </div>
                                <div style={{width:"12%"}}>
                                    {this.props.file.created}
                                </div>
                                <div>
                                    {this.props.file.metadata}
                                </div>
                            </div>
                        </div>    
                        :
                    this.props.file.type=='DIRECTORY'?    
                        <div style={{opacity: this.props.cutActivated&&this.props.activated? 0.6:1, width:"100%"}} draggable>
                            <div className="folder-component" style={{display:"flex", width:"100%", alignItems:"center"}}>
                                <span className={`glyphicon glyphicon-folder-${this.props.openning?"open":"close"}`} style={{fontSize:24, margin:5, color:this.props.openning?"#A1887F":"#3E2723"}} />
                                <div style={{width:"50%", wordWrap:'break-word', textOverflow:'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>
                                    {this.props.openning?<b style={{fontSize:11.5, paddingLeft:5}}>Opening...</b>:this.stripSeparator(this.props.file.name)}
                                </div>
                                <div style={{width:"10%"}}>
                                   {this.props.file.size&&parseInt(this.props.file.size)==0?"Empty":`${this.props.file.size} Item${parseInt(this.props.file.size)>1?"s":""}`}
                                   {!this.props.file.size&&"Unknown"}
                                </div>
                                <div style={{width:"12%"}}>
                                   Folder 
                                </div>
                                <div style={{width:"12%"}}>
                                    {this.props.file.created}
                                </div>
                                <div>
                                    {this.props.file.metadata}
                                </div>
                            </div>
                        </div>
                        :
                        <div style={{opacity: this.props.cutActivated&&this.props.activated? 0.6:1, width:"100%"}} draggable>
                            <div className="file-component" style={{display:"flex", width:"100%", alignItems:"center"}}>
                                <span className='glyphicon glyphicon-file' style={{fontSize:24, margin:5, color:this.props.openning?"#90A4AE":"#546E7A"}}/>
                                <div style={{width:"50%", wordWrap:'break-word', textOverflow:'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>{this.props.file.name}</div>
                                <div style={{width:"10%"}}>
                                    {this.props.file.size}
                                </div>
                                <div style={{width:"12%"}}>
                                    {this.props.file.type=='FIFO'||this.props.file.type=='SOCKET'? this.props.file.type:this.props.file.extension.toUpperCase()} File  
                                </div>
                                <div style={{width:"12%"}}>
                                    {this.props.file.created}
                                </div>
                                <div>
                                    {this.props.file.metadata}
                                </div>
                            </div>
                        </div>
                    }
                </div>
                <hr style={{margin:0, padding:0, backgroundColor:"#cecccc", height:1}}/>
            </div>
        )
    }
    
}