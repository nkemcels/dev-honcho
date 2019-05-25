import React from "react";
import {Dimmer, Loader, Image} from "semantic-ui-react";
import placeHolderImage from "../../../images/short-paragraph.png";
import FileComponent from "../FileComponent"

export default class FileSystemView extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            errorMessage:null,
            connected: true/*this.props.connected*/
        }
    }
    componentDidMount(){
        /*if(!this.props.connected){
            this.props.connectToServer((connected, error)=>{
                if(!connected){
                    this.setState({
                        errorMessage:error,
                        connected:false
                    });
                }else{
                    this.setState({
                        connected:true
                    });
                }
            })
        }*/
    }
    render(){
        return(
            <div className="match-parent">
                {this.state.connected?
                    <div className="fs-container">
                        <div className="fs-header">

                        </div>
                        <div className="fs-content match-parent">
                            <div className="col-md-3 col-sm-3 col-lg-3" style={{height:"100%", padding:0, margin:0}}>
                                <div className="fs-quick-access match-parent">
                                    <div className="fs-quick-access-header">
                                        <h3>Quick Access</h3>
                                    </div>
                                    <div className="fs-quick-access-body"></div>
                                </div>
                            </div>
                            <div className="col-md-9 col-sm-9 col-lg-9" style={{height:"100%", padding:0, margin:0}}>
                                <div className="fs-display match-parent">
                                    <div className="fs-display-header">
                                        
                                    </div>
                                    <div className="fs-display-content">
                                         {[{name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"},
                                            {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"},
                                            {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"},
                                            {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"},
                                            {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"},
                                            {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"},
                                            {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"},
                                            {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"},
                                            {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"},
                                            {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"},
                                            {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"},
                                            {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"},
                                            {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"},
                                            {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"},
                                            {name:"Folder1", type:"folder"}, {name:"Folder1", type:"folder"}, {name:"Folder1", type:"file", extension:"png"}].map((elt, indx)=>(
                                                <FileComponent 
                                                    key = {indx}
                                                    filename = {elt.name}
                                                    filetype = {elt.type}
                                                    ext = {elt.extension} />
                                         ))

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