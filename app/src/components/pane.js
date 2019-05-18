import React, {Prop} from "react";
import {Card} from "semantic-ui-react";

export default class Pane extends React.Component{
    render(){
        return(
            <div className="pane">
                {this.props.children}
            </div>
        )
    }
}

export class _ClassicCardPane extends React.Component{
    render(){
        return (
            <Card style={this.props.style?this.props.style:{}} className={this.props.className?this.props.className:""}>
                <Card.Header style={{padding:5, color:"#F5F5F5", backgroundColor:"#212121"}} textAlign="center">
                    <Card.Content>
                        {this.props.headerComponent}
                    </Card.Content>
                </Card.Header>
                <Card.Content className={this.props.centerContent?"centered-content":""}>
                    {this.props.children?this.props.children:this.props.component}
                </Card.Content>
                {(this.props.attachBottomButton||this.props.bottomButtonText)&&
                    <div class="ui bottom attached button big" size="big" onClick={this.props.bottomButtonAction}>
                        {this.props.bottomButtonText?this.props.bottomButtonText:"DONE"}
                    </div>
                }
                {this.props.bottomComponent&&
                    <div class="ui bottom attached big" size="big">
                        {this.props.bottomComponent}
                    </div>
                }
            </Card>
        )
    }
}

export class _ClassicCardPane2 extends React.Component{
    render(){
        return (
            <div className="card">
                <Card.Header style={{padding:5, color:"#F5F5F5", backgroundColor:"#212121"}} textAlign="center">
                    <Card.Content>
                        {this.props.headerComponent}
                    </Card.Content>
                </Card.Header>
                <Card.Content>
                    {this.props.children?this.props.children:this.props.component}
                </Card.Content>
                {(this.props.attachBottomButton||this.props.bottomButtonText)&&
                    <div class="ui bottom attached button big" size="big" onClick={this.bottomButtonAction}>
                        {this.props.bottomButtonText?this.props.bottomButtonText:"DONE"}
                    </div>
                }
                {this.props.bottomComponent&&
                    <div class="ui bottom attached big" size="big">
                        {this.props.bottomComponent}
                    </div>
                }
            </div>
        )
    }
}