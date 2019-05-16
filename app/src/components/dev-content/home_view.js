import React from "react";
import {Button, Grid, Header, Segment} from "semantic-ui-react";
import fileSysIcon from "../../../images/filesys.png";
import devOpsIcon from "../../../images/devops1.png";
import terminalIcon from "../../../images/terminal.png";
import settingsIcon from "../../../images/settings.png";

export default class HomeView extends React.Component{
    render(){
        return (
            <div className="match-parent centered-content">
                <Segment placeholder size="huge" style={{width:"70%", height:"75%"}}>
                    <Grid textAlign='center'  className="match-parent">
                        <Grid.Row verticalAlign='middle' columns={2} >
                            <Grid.Column>
                                <Header icon>
                                    <img src={fileSysIcon} style={{width:"100px", height:"75px"}} /><br />
                                    Browse your Server's File System
                                </Header>

                                <Button primary size="big">Launch</Button>
                            </Grid.Column>
                            <Grid.Column>
                                <Header icon>
                                    <img src={devOpsIcon} style={{width:"100px", height:"75px"}} /><br />
                                    Deploy your Apps and monitor your System
                                </Header>
                                <Button primary size="big">Launch</Button>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row verticalAlign='middle' columns={2} >
                            <Grid.Column>
                                <Header icon>
                                    <img src={terminalIcon} style={{width:"100px", height:"75px"}} /><br />
                                    Access the Terminal
                                </Header>
                                <Button primary size="big">Launch</Button>
                            </Grid.Column>
                            <Grid.Column>
                                <Header icon>
                                    <img src={settingsIcon} style={{width:"90px", height:"75px"}} /><br />
                                    Configure your Dev-Honcho Settings
                                </Header>
                                <Button primary size="big">Launch</Button>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </div>
        )
    }
}