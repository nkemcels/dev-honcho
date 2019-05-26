import React from "react";
import {Dimmer, Loader, Image} from "semantic-ui-react";
import placeHolderImage from "../../../images/short-paragraph.png";
import FileComponent from "../FileComponent";
import {SERVER_OP_LIST_DIR} from "../../../constants";
import path from "path";

export default class FileSystemView extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            errorMessage:null,
            connected: this.props.connected,
            fileList: [],
            currentDirectory:null,
            breadcrumbPaths: [],
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
                        this.listDirectoryFor("~")
                    });
                }
            })
        }
    }

    handleBackNav = ()=>{
        if(this.backPathsCount - 2>0){
            const fpath = this.state.breadcrumbPaths[--this.backPathsCount-1];
            if(fpath){
                this.listDirectoryFor(fpath, false)
            }
        }
    }

    handleFowardNav = ()=>{
        if(this.backPathsCount<this.state.breadcrumbPaths.length){
            const fpath = this.state.breadcrumbPaths[this.backPathsCount++];
            if(fpath){
                this.listDirectoryFor(fpath, false)
            }
        }
    }

    handleSetFileList=(filepath, fileList, saveBreadcrumb)=>{
        this.setState({
            fileList: fileList,
            currentDirectory: filepath
        });
        if(saveBreadcrumb){
            if(!this.backPathsCount) this.backPathsCount = 0;
            this.setState({
                breadcrumbPaths: [...this.state.breadcrumbPaths.slice(0, this.backPathsCount), filepath]
            }, ()=>{
                this.backPathsCount = this.state.breadcrumbPaths.length;
                console.log("new count is ", this.backPathsCount)
            });
        }
        this.cachedList[filepath] = fileList
    }

    listDirectoryFor = (filepath, saveBreadcrumb=true)=>{
        if(this.cachedList[filepath]){
            this.handleSetFileList(filepath, this.cachedList[filepath], saveBreadcrumb)
        }else{
            this.props.serverOperation({type:SERVER_OP_LIST_DIR, payload:filepath}, (response)=>{
                if(response.result == "OK"){
                    if(response.payload instanceof Array){
                        this.handleSetFileList(filepath, response.payload, saveBreadcrumb)
                    }else{
                        console.log(response.payload)
                    }
                }else{
                    console.log("error: ", response.error);
                }
            })
        }
        
    }

    handleBreadCrumbNavigate = (elt, indx)=>{
        const parts = this.state.breadcrumbPaths[this.state.breadcrumbPaths.length-1];
        const fpath = parts.split(path.sep).slice(0, indx+1).join(path.sep)+path.sep;
        const index = this.state.breadcrumbPaths.indexOf(fpath);
        this.backPathsCount = index+1;
        this.listDirectoryFor(fpath, false);
    }

    listQuickAccessDir = (name)=>{
        if(name!="/" && name!="~"){
            this.listDirectoryFor(path.join("~", name));
        }else{
            this.listDirectoryFor(name);
        }
    }

    handleFileDoubleClicked = (filename, filetype)=>{
        if(filetype === "DIRECTORY"){
            this.listDirectoryFor(path.join(this.state.currentDirectory, filename));
        }else{
            //launch file
        }
    }

    render(){
        return(
            <div className="match-parent">
                {this.state.connected?
                    <div className="fs-container">
                        <div className="fs-header">
                            <div className="fs-header-menu">
                                <div className="fs-header-menu-item">
                                    <span className='glyphicon glyphicon-file'/><br />
                                    <span>New File</span>
                                </div>
                                <div className="fs-header-menu-item">
                                    <span className='glyphicon glyphicon-file'/><br />
                                    <span>New File</span>
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
                                                        this.state.breadcrumbPaths.length>0 && this.state.breadcrumbPaths[this.state.breadcrumbPaths.length-1].split(path.sep).map((elt, i)=>(
                                                            <li key={i} style={{padding:0, margin:0}}><a href="#" onClick={()=>this.handleBreadCrumbNavigate(elt, i)}>{ elt }</a></li>
                                                        ))
                                                    }
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="fs-display-content">
                                         {
                                            this.state.fileList.filter(elt=>!elt.name.startsWith(".")).map((elt, indx)=>(
                                                <FileComponent 
                                                    key = {indx}
                                                    filename = {elt.name}
                                                    filetype = {elt.type}
                                                    ext = {elt.extension}
                                                    fileDoubleClicked={this.handleFileDoubleClicked} />
                                            ))
                                         }
                                         {this.state.fileList.length==0&&
                                            <Dimmer active>
                                                <Loader size='large' indeterminate>Listing Files...</Loader>
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