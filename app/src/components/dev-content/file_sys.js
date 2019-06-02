import React from "react";
import {Dimmer, Loader, Image} from "semantic-ui-react";
import placeHolderImage from "../../../images/short-paragraph.png";
import FileComponent from "../FileComponent";
import UploadSelection from "./upload_selection";
import * as constants from "../../../constants";
import {remote as electron, ipcRenderer as ipc} from "electron";
import path from "path";

const vex = require("vex-js")
vex.registerPlugin(require('vex-dialog'))
vex.defaultOptions.className = 'vex-theme-os'

export default class FileSystemView extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            errorMessage:null,
            connected:this.props.connected,
            fileList: [],
            displayHiddenFiles:false,
            currentDirectory:null,
            currentFileName:null,
            breadcrumbPaths: [],
            selectedFiles:[],
            operationMessage:null,
            cutActivated:false,
            copyActivated:false,
            activatedFiles:[],
            activatedPath:null,
            sudoPwd:null
        }
        this.cachedList = {}
    }
    componentDidMount(){
        if(!this.props.connected){
            this.props.connectToServer((connected, error)=>{
                if(!connected){
                    this.setState({
                        errorMessage:error,
                        connected:false
                    });
                }else{
                    this.setState({
                        connected:true
                    },()=>{
                        this.listDirectoryFor("~", "Home")
                    });
                }
            });
        }
    }

    handleBackNav = ()=>{
        if(this.backPathsCount - 2>0){
            const fpath = this.state.breadcrumbPaths[--this.backPathsCount-1];
            const fpathArr = fpath.split("/");
            if(fpath){
                this.listDirectoryFor(fpath, fpathArr[fpathArr.length-1], false)
            }
        }
    }

    handleFowardNav = ()=>{
        if(this.backPathsCount<this.state.breadcrumbPaths.length){
            const fpath = this.state.breadcrumbPaths[this.backPathsCount++];
            const fpathArr = fpath.split("/");
            if(fpath){
                this.listDirectoryFor(fpath, fpathArr[fpathArr.length-1], false)
            }
        }
    }

    handleSetFileList=(filepath, filename, fileList, saveBreadcrumb)=>{
        this.setState({
            fileList: this.state.displayHiddenFiles? fileList:fileList.filter(elt=>!elt.name.startsWith(".")),
            currentDirectory: filepath,
            currentFileName: this.stripSeparator(filename),
            selectedFiles:[]
        });
        if(saveBreadcrumb){
            if(!this.backPathsCount) this.backPathsCount = 0;
            this.setState({
                breadcrumbPaths: [...this.state.breadcrumbPaths.slice(0, this.backPathsCount), filepath]
            }, ()=>{
                this.backPathsCount = this.state.breadcrumbPaths.length;
            });
        }
        this.cachedList[filepath] = fileList
    }

    displayAlert = (alert)=>{
        vex.dialog.alert({
            message: alert
        });
    }

    listDirectoryFor = (filepath, filename, saveBreadcrumb=true, useCache=true, callback)=>{
        if(useCache&&this.cachedList[filepath]){
            this.handleSetFileList(filepath, filename, this.cachedList[filepath], saveBreadcrumb)
        }else{
            this.props.serverOperation({type:constants.SERVER_OP_LIST_DIR, payload:filepath}, (response)=>{
                if(response.result == "OK"){
                    if(response.payload && response.payload.data instanceof Array){
                        this.handleSetFileList(filepath, filename, response.payload.data, saveBreadcrumb)
                        this.setState({
                            selectedFiles:[]
                        });
                    }
                    if(response.payload&&response.payload.error){
                        this.displayAlert(response.payload.error)
                    }
                }else{
                    this.displayAlert(response.error)
                }
                if(callback && callback instanceof Function){
                    callback(response.result === "OK");
                }
            })
        }        
    }

    handleFileClicked = (filename, filetype)=>{
        this.setState({
            selectedFiles: this.state.selectedFiles.findIndex(elt=>elt.filename==filename)>=0?
                            this.state.selectedFiles.filter(elt=>elt.filename!==filename) :
                            [...this.state.selectedFiles, {filename, filetype}]
        });
    }

    handleBreadCrumbNavigate = (elt, indx)=>{
        const parts = this.state.breadcrumbPaths[this.state.breadcrumbPaths.length-1];
        const fpath = parts.split("/").slice(0, indx+1).join("/");
        const index = this.state.breadcrumbPaths.indexOf(fpath);
        this.backPathsCount = index+1;
        this.listDirectoryFor(fpath, elt, false);
    }

    listQuickAccessDir = (name)=>{
        if(name!="/" && name!="~"){
            this.listDirectoryFor(path.join("~", name), name);
        }else{
            this.listDirectoryFor(name, name=="/"?"Root":name=="~"?"Home":name);
        }
    }

    handleFileDoubleClicked = (fileName, fileType)=>{
        if(fileType === "DIRECTORY"){
            this.listDirectoryFor(path.join(this.state.currentDirectory, fileName), fileName);
        }else{
            let options = {currentDirectory:this.state.currentDirectory, fileName};
            this.launchFileExternally(options)
        }
    }

    stripSeparator = (str)=>{
        if (str.endsWith("/")){
            return str.substring(0, str.lastIndexOf("/"));
        }
        return str;
    }

    handleCreateNewFileOrFolder = (type)=>{
        let options = {currentDirectory:this.state.currentDirectory};
        vex.dialog.prompt({
            message: `Enter Name of ${type==constants.SERVER_OP_CREATE_NEW_FILE?"File":"Directory"}`,
            placeholder: `${type==constants.SERVER_OP_CREATE_NEW_FILE?"File":"Directory"} Name`,
            callback: (name)=> {
                if(name && this.state.fileList.findIndex(elt=>elt.name.trim()==name.trim())>=0){
                    this.displayAlert(`File '${name}' already exists!`)
                }
                else if(name){
                    this.setState({
                        operationMessage: `Creating ${name}...`
                    });
                    options = {...options, name}
                    this.props.serverOperation({type, payload:options}, (response)=>{
                        this.handleDefaultResponse(response)
                    });
                }
            }
        });
    }

    displayUploadDownloadStatus = (status, downupId)=>{  //downupId -> Download or Upload Id
        let temp = [...this.state.downloadUploadState]
        temp[downupId] = status;
        this.setState({downloadUploadState:temp}, ()=>{
            setTimeout(() => {
                temp = [...this.state.downloadUploadState]
                delete temp[downupId]
                this.setState({downloadUploadState:temp})
            }, 3000);
        });
    }

    handleUploadDownloadComplete = (data)=>{
        if(data.done){
            if(data.success){
                this.displayUploadDownloadStatus("[DONE]", data.id)
            }else{
                this.displayUploadDownloadStatus("[FAILED]", data.id)
            }
        }else if(data.stderrChunk){
            this.displayUploadDownloadStatus("[FAILED]", data.id)
            this.displayAlert(`ERROR: ${data.stderrChunk}`);
        }
    }

    handleDownloadSelected = ()=>{
        if(this.state.selectedFiles.length<=0) return;    
        const { dialog } = electron
        const selected = dialog.showOpenDialog({ properties: ['openDirectory'], title:"Select Destination Location" });
        if(selected && selected.length>0){
            const destination = selected[0];
            if(!this.downloadId){ this.downloadId = 0; }
            this.downloadId++; 
            
            const options = {files:this.state.selectedFiles.map(elt=>({path: path.join(this.state.currentDirectory, elt.filename), type:elt.filetype})),
                             destination,
                             id:this.downloadId};
            console.log("initialing download for ", options);                 
            
            const statusText = `[Downloading (${this.state.selectedFiles.length}) items]`;
            const downloadUploadState = this.state.downloadUploadState? [...this.state.downloadUploadState]:[];
            downloadUploadState[this.downloadId] = statusText;
            this.setState({downloadUploadState, selectedFiles:[]});                
            this.props.serverOperation({type:constants.SERVER_OP_DOWNLOAD, payload:options}, (response)=>{
                this.handleUploadDownloadComplete(response);
            });                 
        }
    }

    handleUploadFiles = (files, folders)=>{
        let allFiles = []
        if(files){   allFiles = [...allFiles, ...files.map(elt=>({path:elt, type:"FILE"}))]  }
        if(folders){   allFiles = [...allFiles, ...folders.map(elt=>({path:elt, type:"DIRECTORY"}))]   }
        if(allFiles.length>0){
            const destination = this.state.currentDirectory;
            if(!this.uploadId){ this.uploadId = 0; }
            this.uploadId++; 
            
            const options = {files:allFiles,
                             destination,
                             id:this.uploadId};
            
            const statusText = `[Uploading (${allFiles.length}) items]`;
            const downloadUploadState = this.state.downloadUploadState? [...this.state.downloadUploadState]:[];
            downloadUploadState[this.uploadId] = statusText;
            this.setState({downloadUploadState, selectedFiles:[]});                
            this.props.serverOperation({type:constants.SERVER_OP_UPLOAD, payload:options}, (response)=>{
                this.handleUploadDownloadComplete(response);
                if(response.done && response.success){
                    downloadUploadState[this.uploadId] = "Refreshing...";
                    this.listDirectoryFor(this.state.currentDirectory, this.state.currentFileName, true, false, (success)=>{
                        if(success){
                            this.displayUploadDownloadStatus("Refreshed", this.uploadId)
                        }else{
                            this.displayUploadDownloadStatus("Refresh FAILED", this.uploadId)
                        }
                    })
                }
                
            });  
        }
    }

    handleCutSelected = ()=>{
        this.setState({
            cutActivated: true,
            copyActivated: false,
            activatedFiles: [...this.state.selectedFiles],
            activatedPath: this.state.currentDirectory
        }, ()=>{
            this.setState({operationMessage:`(${this.state.activatedFiles.length}) items cut`})
        });
    }

    handleCopySelected = ()=>{
        this.setState({
            cutActivated: false,
            copyActivated: true,
            activatedFiles: [...this.state.selectedFiles],
            activatedPath: this.state.currentDirectory,
        }, ()=>{
            this.setState({operationMessage:`(${this.state.activatedFiles.length}) items copied`})
        });
    }

    handleDefaultResponse = (response, saveBreadcrumb=true)=>{
        this.setState({operationMessage:null})
        if(response.result==="OK"){
            if(response.payload && response.payload.data instanceof Array){
                this.handleSetFileList(this.state.currentDirectory, this.state.currentFileName, response.payload.data, saveBreadcrumb)
            }
            if(response.payload && response.payload.error){
                this.displayAlert(response.payload.error)
            }
        }else{
            this.displayAlert(response.error)
        }
    }

    handlePasteSelected = ()=>{
        if(!this.state.activatedPath) return;
        this.setState({operationMessage:`Pasting (${this.state.activatedFiles.length}) items...`})
        const options = { 
            selectedFiles: this.state.activatedFiles.map(elt=>path.join(this.state.activatedPath, elt.filename)),
            destination: this.state.currentDirectory
        }
        const type = this.state.cutActivated?constants.SERVER_OP_CUT_PASTE:constants.SERVER_OP_COPY_PASTE
        /*if (this.state.activatedPath != this.state.currentDirectory){
            this.state.activatedFiles.forEach(elt=>{
                if(this.state.fileList.findIndex(item=>item.filename === elt.filename)>=0){
                    vex.dialog.prompt
                }
            });    //TODO: Implement display of replace options if files already exists in destination folder
        }else{ 

        }*/
        
        this.props.serverOperation({type, payload:options}, (response)=>{
            this.setState({operationMessage:null})
            this.handleDefaultResponse(response)
        });
        if(this.state.cutActivated){
            this.setState({ activatedFiles:[] })
            delete this.cachedList[this.state.activatedPath];
        }
    }

    handleRenameSelected = ()=>{
        let options = {currentDirectory:this.state.currentDirectory};
        if(this.state.selectedFiles.length!=1) return;
        const oldName = this.state.selectedFiles[0].filename;
        vex.dialog.prompt({
            message: `Rename ${oldName} to?`,
            callback: (newName)=>{
                if(newName && this.state.fileList.findIndex(elt=>elt.name.trim()==newName.trim())>=0){
                    this.displayAlert(`Filename '${newName}' already exists!`)
                }
                else if(newName){
                    this.setState({  operationMessage: `Renaming ${oldName} to ${newName}...` });
                    options = {...options, oldName, newName}
                    this.props.serverOperation({type:constants.SERVER_OP_RENAME, payload:options}, (response)=>{
                        this.handleDefaultResponse(response)
                    });
                }
            }
        })
    }

    selectAllItemsInCurrentDirectory = ()=>{
        this.setState({
            selectedFiles: [...this.state.fileList.map(elt=>{return {filename:elt.name, filetype:elt.type} })]
        });
    }

    handleDeleteSelectedFiles = ()=>{
        let options = {currentDirectory:this.state.currentDirectory};
        if(this.state.selectedFiles.length<=0) return;
        vex.dialog.confirm({
            message: `Are you sure you want to delete these (${this.state.selectedFiles.length}) items?`,
            callback: (ok)=>{
                if(ok){
                    let items = [];
                    for(let item of this.state.selectedFiles){
                        items.push(item.filename);
                    }
                    this.setState({operationMessage:`Deleting (${this.state.selectedFiles.length}) items`})
                    this.props.serverOperation({type:constants.SERVER_OP_DELETE, payload:{ items, currentDirectory:this.state.currentDirectory } }, (response)=>{
                        this.handleDefaultResponse(response)
                    });
                }
            }
        })
    }

    handleLaunchSelectedFile = ()=>{
        let options = {currentDirectory:this.state.currentDirectory, fileName:this.state.selectedFiles[0].filename};
        if(this.state.selectedFiles.length!=1) return;
        const fileName = this.state.selectedFiles[0].filename;
        const fileType = this.state.selectedFiles[0].filetype;
        this.setState({operationMessage:`Opening ${fileName}`});
        if(fileType == "DIRECTORY"){
            this.listDirectoryFor(path.join(this.state.currentDirectory, fileName), fileName);
        }else{
            this.launchFileExternally(options)
        }
    }

    launchFileExternally = (options)=>{
        this.props.serverOperation({type:constants.SERVER_OP_LAUNCH_FILE, payload:options}, (response)=>{
            this.setState({operationMessage:null});
        });
    }

    render(){
        return(
            <div className="match-parent">
                {this.state.connected?
                    <div className="fs-container">
                        <div className="fs-header">
                            <div className="fs-header-menu">
                                <div className="fs-header-menu-item fs-header-menu-item-hoverable" 
                                     onClick={()=>this.handleCreateNewFileOrFolder(constants.SERVER_OP_CREATE_NEW_FILE)}>
                                    <span className='glyphicon glyphicon-file' style={{color:"#FFA726"}} />
                                </div>
                                <div className="fs-header-menu-item fs-header-menu-item-hoverable"
                                     onClick={()=>this.handleCreateNewFileOrFolder(constants.SERVER_OP_CREATE_NEW_FOLDER)}>
                                    <span className='glyphicon glyphicon-folder-close' style={{color:"#01579B"}} />
                                </div>
                                <div className={`fs-header-menu-item ${this.state.selectedFiles.length>0?"fs-header-menu-item-hoverable":"fs-header-menu-item-disabled"}`} 
                                     style={{marginLeft:40}}
                                     onClick={this.handleDownloadSelected}>
                                    <span className='glyphicon glyphicon-cloud-download' style={{color:"#00796B"}} />
                                </div>
                                
                                <div className="fs-header-menu-item fs-header-menu-item-hoverable">
                                         <UploadSelection
                                            className="glyphicon glyphicon-cloud-upload" 
                                            uploadSelectedFilesAndFolders={(files, folders)=>this.handleUploadFiles(files, folders)}/>
                                </div>
                                <div className={`fs-header-menu-item ${this.state.selectedFiles.length>0?"fs-header-menu-item-hoverable":"fs-header-menu-item-disabled"}`} 
                                     style={{marginLeft:40}}
                                     onClick={this.handleCutSelected}>
                                    <span className='glyphicon glyphicon-scissors' style={{color:"#c62828"}} />
                                </div>
                                <div className={`fs-header-menu-item ${this.state.selectedFiles.length>0?"fs-header-menu-item-hoverable":"fs-header-menu-item-disabled"}`}
                                     onClick={this.handleCopySelected}>
                                    <span className='glyphicon glyphicon-duplicate' style={{color:"#0288D1"}} />
                                </div>
                                <div className={`fs-header-menu-item ${this.state.activatedPath?"fs-header-menu-item-hoverable":"fs-header-menu-item-disabled"}`} 
                                     onClick={this.handlePasteSelected}>
                                    <span className='glyphicon glyphicon-paste' style={{color:"#0288D1"}} />
                                </div>
                                <div className={`fs-header-menu-item ${this.state.selectedFiles.length==1?"fs-header-menu-item-hoverable":"fs-header-menu-item-disabled"}`} 
                                     style={{marginLeft:40}}
                                     onClick={this.handleRenameSelected}>
                                    <span className='glyphicon glyphicon-pencil' style={{color:"#c62828"}} />
                                </div>
                                <div className="fs-header-menu-item fs-header-menu-item-hoverable" 
                                     style={{marginLeft:40}}
                                     onClick={this.selectAllItemsInCurrentDirectory}>
                                    <span className='glyphicon glyphicon-list-alt' style={{color:"#0288D1"}} />
                                </div>
                                <div className={`fs-header-menu-item ${this.state.selectedFiles.length>0?"fs-header-menu-item-hoverable":"fs-header-menu-item-disabled"}`}
                                     onClick={this.handleDeleteSelectedFiles}>
                                    <span className='glyphicon glyphicon-trash' style={{color:"#b71c1c"}} />
                                </div>
                                <div className={`fs-header-menu-item ${this.state.selectedFiles.length==1?"fs-header-menu-item-hoverable":"fs-header-menu-item-disabled"}`} 
                                     style={{marginLeft:40}}
                                     onClick={this.handleLaunchSelectedFile}>
                                    <span className='glyphicon glyphicon-new-window' style={{color:"#00796B"}} />
                                </div>
                                {(this.state.operationMessage||this.state.downloadUploadState&&this.state.downloadUploadState.length>0)&&
                                    <div className="fs-header-menu-item operation-message"
                                        style={{marginLeft:40}}>
                                        <b style={this.state.downloadUploadState?{marginLeft:5}:{}}>{this.state.operationMessage}</b>
                                        <b style={{fontSize:12}}>{this.state.downloadUploadState?this.state.downloadUploadState.join(" ").trim():null}</b>
                                    </div>
                                }
                                <div style={{flexGrow:1, textAlign:"right"}}>
                                    <span className="pull-right" style={{lineHeight:"2.5em", margin:0, padding:0, marginRight:5, fontSize:14}}> {this.state.currentFileName} </span>
                                </div>
                            </div> 	
                        </div>
                        <div className="fs-content match-parent">
                            <div className="col-md-2" style={{height:"100%", padding:0, margin:0}}>
                                <div className="fs-quick-access match-parent">
                                    <div className="fs-quick-access-header">
                                        <h3>Quick Access</h3>
                                    </div>
                                    <div className="fs-quick-access-body">
                                        <ul className="nav nav-pills nav-stacked">
                                            <li onClick={()=>this.listQuickAccessDir("~")}><a href="#"><div className="fs-quick-access-item">
                                                <span className="glyphicon glyphicon-home" /> <span>Home</span> 
                                            </div></a></li>
                                            <li onClick={()=>this.listQuickAccessDir("Desktop")}><a href="#"><div className="fs-quick-access-item">
                                                <span className="glyphicon glyphicon-briefcase" /> <span>Desktop</span> 
                                            </div></a></li>
                                            <li onClick={()=>this.listQuickAccessDir("Documents")}><a href="#"><div className="fs-quick-access-item">
                                                <span className="glyphicon glyphicon-file" /> <span>Documents</span> 
                                            </div></a></li>
                                            <li onClick={()=>this.listQuickAccessDir("Downloads")}><a href="#"><div className="fs-quick-access-item">
                                                <span className="glyphicon glyphicon-save" /> <span>Downloads</span> 
                                            </div></a></li>
                                            <li onClick={()=>this.listQuickAccessDir("Music")}><a href="#"><div className="fs-quick-access-item">
                                                <span className="glyphicon glyphicon-music" /> <span>Music</span> 
                                            </div></a></li>
                                            <li onClick={()=>this.listQuickAccessDir("Pictures")}><a href="#"><div className="fs-quick-access-item">
                                                <span className="glyphicon glyphicon-picture" /> <span>Pictures</span> 
                                            </div></a></li>
                                            <li onClick={()=>this.listQuickAccessDir("Videos")}><a href="#"><div className="fs-quick-access-item">
                                                <span className="glyphicon glyphicon-film" /> <span>Videos</span> 
                                            </div></a></li>
                                            <li className="divider" />
                                            <li onClick={()=>this.listQuickAccessDir("/")}><a href="#"><div className="fs-quick-access-item">
                                                <span className="glyphicon glyphicon-hdd" /> <span>Root</span> 
                                            </div></a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-10" style={{height:"100%", padding:0, margin:0}}>
                                <div className="fs-display match-parent">
                                    <div className="fs-display-header">
                                        <div style={{lineHeight:"3em"}}>
                                            <div style={{marginLeft:5, display:'inline-block'}}>
                                                <a className='btn btn-default btn-sm' onClick={this.handleBackNav}> <i className='glyphicon glyphicon-chevron-left' style={{paddingBottom:2}} /> </a>&nbsp;&nbsp;
                                                <a className='btn btn-default btn-sm' onClick={this.handleFowardNav}> <i className='glyphicon glyphicon-chevron-right' style={{paddingBottom:2}}/> </a>
                                            </div>
                                            <div style={{display:'inline-block', marginLeft:30}}>
                                                <ol className="breadcrumb" style={{margin:0, maxHeight:"2em", padding:0, paddingLeft:5, paddingRight:5,backgroundColor:"#F0F0F0", marginTop:2}}>
                                                    {
                                                        this.state.breadcrumbPaths.length>0 && this.state.breadcrumbPaths[this.state.breadcrumbPaths.length-1].split("/").map((elt, i)=>(
                                                            <li key={i} style={{padding:0, margin:0}}><a href="#" onClick={()=>this.handleBreadCrumbNavigate(elt, i)}>{ elt }</a></li>
                                                        ))
                                                    }
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="fs-display-content" onClick={()=>this.setState({selectedFiles:[]})}>
                                         {
                                            this.state.fileList.map((elt, indx)=>{
                                                return <FileComponent 
                                                    key = {indx}
                                                    filename = {elt.name}
                                                    filetype = {elt.type}
                                                    ext = {elt.extension}
                                                    selected = {(this.state.selectedFiles.findIndex(item=>item.filename===elt.name)>=0)}
                                                    activated = {(this.state.activatedFiles.findIndex(item=>item.filename===elt.name)>=0)}
                                                    copyActivated = {this.state.copyActivated}
                                                    cutActivated = {this.state.cutActivated}
                                                    fileClicked = {this.handleFileClicked}
                                                    fileDoubleClicked={this.handleFileDoubleClicked} />
                                            })
                                         }
                                         {this.state.fileList.length==0&&this.state.currentDirectory&&
                                            <div className="centered-content match-parent">
                                                <h4>Folder is Empty</h4>
                                            </div>
                                         }
                                         {this.state.fileList.length==0&&!this.state.currentDirectory&&
                                            <Dimmer active>
                                                <Loader size='large' indeterminate>Listing Files in Home Directory...</Loader>
                                            </Dimmer> 
                                         }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    this.state.errorMessage?
                    <div>
                        <h1>{this.state.errorMessage}</h1>
                    </div>
                    :
                    <div className="match-parent">
                        <div className="match-parent centered-content">
                            <Dimmer active>
                                <Loader size='large'>{`Connecting to ${this.props.serverName}`}</Loader>
                            </Dimmer> 
                            <Image src={placeHolderImage} />
                            <Image src={placeHolderImage} />
                            <Image src={placeHolderImage} />
                        </div>    
                    </div>
                }
            </div>
        )
    }
}