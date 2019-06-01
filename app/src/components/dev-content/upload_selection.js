import React from 'react'
import { Button, Header, Modal } from 'semantic-ui-react'
import {remote as electronRemote} from "electron";

class UploadSelection extends React.Component{
    state={
        selectedFiles:[],
        selectedFolders:[],
        modalOpen: false
    }

  componentDidMount(){
      this.setState({
        selectedFiles:[],
        selectedFolders:[],
        modalOpen: false
      })
  }

  handleOpen = () => this.setState({ modalOpen: true })

  handleClose = () => this.setState({ modalOpen: false })

    handleOpenFolderSelection = ()=>{
        const selectedFolders = electronRemote.dialog.showOpenDialog({title:"Select Folders to Upload", properties:["openDirectory", "multiSelections", "showHiddenFiles"]});
        if(selectedFolders){
            this.setState({
                selectedFolders: [...new Set([...this.state.selectedFolders, ...selectedFolders])]
            });
        }
    }

    handleOpenFileSelection = ()=>{
        const selectedFiles = electronRemote.dialog.showOpenDialog({title:"Select Folders to Upload", properties:["openFile", "multiSelections", "showHiddenFiles"]});
        if(selectedFiles){
            this.setState({
                selectedFiles: [...new Set([...this.state.selectedFiles, ...selectedFiles])]
            });
        }
    }

    handleDeleteFileSelection = (elt)=>{
        this.setState({
            selectedFiles:this.state.selectedFiles.filter(e=>e!==elt)
        });
    }

    handleClearFileList = ()=>{
        this.setState({
            selectedFiles:[]
        })
    }

    handleClearFolderList= ()=>{
        this.setState({
            selectedFolders:[]
        })
    }

    handleDeleteFolderSelection = (elt)=>{
        this.setState({
            selectedFolders:this.state.selectedFolders.filter(e=>e!==elt)
        });
    }

    render(){
        return(
            <Modal trigger={<span className={this.props.className}  style={{color:"#0288D1"}} onClick={this.handleOpen}>{this.props.trigger}</span>} 
                    basic size='large' style={{width:"100%"}}
                    open={this.state.modalOpen}
                    onClose={this.handleClose}>
                <Header content='Choose Files and Folders to Upload'/>
                <Modal.Content style={{width:"100%", padding:20}}>
                    <div>
                        <div>
                            <b style={{color:"#eee", fontSize:15}}>Files</b><br />
                            <hr style={{margin:"5px 0px 10px 0px", padding:0}}/>
                            {this.state.selectedFiles.length==0?
                                <div>
                                    <h5 style={{marginRight:10, display:"inline-block"}}>No Files Selected</h5>
                                    <Button color='violet' inverted onClick={this.handleOpenFileSelection}>
                                        <span className="glyphicon glyphicon-plus" /> Add
                                    </Button>
                                </div>
                                :
                                <div>
                                    <div style={{maxHeight:150, overflowY:"scroll"}}>
                                        {
                                            this.state.selectedFiles.map((elt, indx)=>(
                                                <div style={{backgroundColor:"rgba(0,0,0,0.5)", margin:3, padding:3, border:"1px solid rgba(0,0,0,0.3)", borderRadius:3}}>
                                                    <span style={{fontSize:14, marginRight:3}} className="glyphicon glyphicon-file"/>
                                                    <span style={{fontSize:14}}>{elt}</span>
                                                    <span className="pull-right">
                                                        <Button color='red' size="mini" inverted onClick={()=>this.handleDeleteFileSelection(elt)}>
                                                            <span className="glyphicon glyphicon-trash" />
                                                        </Button>
                                                    </span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                    <Button style={{marginTop:5}} color='violet' inverted onClick={this.handleOpenFileSelection}>
                                        <span className="glyphicon glyphicon-plus" /> Add
                                    </Button>&emsp;
                                    <Button style={{marginTop:5}} color='red' inverted onClick={this.handleClearFileList}>
                                        <span className="glyphicon glyphicon-remove" /> Clear
                                    </Button>
                                </div>
                            }
                        </div>
                        <div style={{marginTop:25}}>
                            <b style={{color:"#eee", fontSize:15}}>Files</b><br />
                            <hr style={{margin:"5px 0px 10px 0px", padding:0}}/>
                            {this.state.selectedFolders.length==0?
                                <div>
                                    <h5 style={{marginRight:10, display:"inline-block"}}>No Files Selected</h5>
                                    <Button color='violet' inverted onClick={this.handleOpenFolderSelection}>
                                        <span className="glyphicon glyphicon-plus" /> Add
                                    </Button>
                                </div>
                                :
                                <div>
                                    <div style={{maxHeight:150, overflowY:"scroll"}}>
                                        {
                                            this.state.selectedFolders.map((elt, indx)=>(
                                                <div style={{backgroundColor:"rgba(0,0,0,0.5)", margin:3, padding:3, border:"1px solid rgba(0,0,0,0.3)", borderRadius:3}}>
                                                    <span style={{fontSize:14, marginRight:3}} className="glyphicon glyphicon-folder-close"/>
                                                    <span style={{fontSize:14}}>{elt}</span>
                                                    <span className="pull-right">
                                                        <Button color='red' size="mini" inverted onClick={()=>this.handleDeleteFolderSelection(elt)}>
                                                            <span className="glyphicon glyphicon-trash" />
                                                        </Button>
                                                    </span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                    <Button color='violet' inverted onClick={this.handleOpenFolderSelection}>
                                        <span className="glyphicon glyphicon-plus" /> Add
                                    </Button>&emsp;
                                    <Button style={{marginTop:5}} color='red' inverted onClick={this.handleClearFolderList}>
                                        <span className="glyphicon glyphicon-trash" /> Clear
                                    </Button>
                                </div>
                            }
                        </div>
                    </div>
                </Modal.Content>
                <Modal.Actions style={{paddingLeft:50}}>
                    <Button basic color='red' size="big" inverted onClick={()=>this.handleClose()}>
                        <span className="glyphicon glyphicon-remove" /> Cancel
                    </Button>
                    <Button color='green' inverted size="big" onClick={()=>{
                        this.handleClose();
                        this.props.uploadSelectedFilesAndFolders(this.state.selectedFiles, this.state.selectedFolders);
                    }}>
                        <span className="glyphicon glyphicon-ok" /> Upload
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
} 

export default UploadSelection