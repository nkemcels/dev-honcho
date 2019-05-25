import React from 'react'

const styles={
    root:{

    }
}

export default class FileComponent extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            highlight:false,
            select:false
        }
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
    handleMouseDoubleClicked= ()=>{
        this.props.fileDoubleClicked(this.props.filepath, this.props.filename, this.props.filetype)
    }
    render(){        
        return (
            <div style={{textAlign:'center', margin:'10px 5px',  backgroundColor:this.state.highlight?"#eee":null, cursor:'pointer', width:120, height:80 }} 
                 onMouseEnter={this.handleMouseEntered} 
                 onMouseLeave={this.handleMouseExited}
                 onDoubleClick={this.handleMouseDoubleClicked}>
                 {this.props.filetype=='file'?
                    <div>
                        <div style={{position:'relative'}}>
                            <span className='glyphicon glyphicon-file' style={{fontSize:45, margin:5, position:'relative'}}/>
                            <span style={{position:'absolute', top:35, left:0, right:0, bottom:0, color:'white', fontSize:10}}><b>{this.props.ext.toUpperCase()}</b></span>
                        </div>
                        <div style={{fontWeight:'bold', wordWrap:'break-word', textOverflow:'ellipsis', overflow: 'hidden', width:'100%', whiteSpace: 'nowrap', textAlign:'center'}}>{this.props.filename}</div>
                    </div>
                    :
                    <div>
                        <span className='glyphicon glyphicon-folder-close' style={{fontSize:45, margin:5}}/><br />
                        <div style={{fontWeight:'bold', wordWrap:'break-word', textOverflow:'ellipsis', overflow: 'hidden', width:'100%', whiteSpace: 'nowrap', textAlign:'center'}}>{this.props.filename}</div>
                    </div>
                 }
                
            </div>
        )
    }
    
}