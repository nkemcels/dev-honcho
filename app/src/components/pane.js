import React from "react"

export default class Pane extends React.Component{
    render(){
        return(
            <div className="pane">
                {this.props.children}
            </div>
        )
    }
}