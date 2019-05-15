import React from "react";

export default class HeaderComp extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            isAuth: props.isAuth,
            currentUser: props.currentUser,
            currentServer: props.currentServer,
            currentMainItem: props.currentMainItem
        }
    }
    render(){
        return(
            <header className='app-header'>
            {this.props.isAuthenticated?
                <div className='app-header-content'>
                    <div className="current-server">
                        <span className="glyphicon glyphicon-menu-hamburger menu-icon" />
                        <span className="current-server-name">
                            {this.props.currentServer?
                                this.props.currentServer : ""
                            }
                        </span>
                    </div>
                    <div className="current-menu-item">
                        {this.props.selectedMenu?
                            this.props.selectedMenu : "DEV-HONCHO"
                        }
                    </div>
                    <div className="current-user">
                        <span className="glyphicon glyphicon-user current-user-icon" />
                        <span className="current-user-name">
                            {this.props.currentUser?
                                this.props.currentUser:""
                            }
                        </span>
                    </div>
                </div>
                :
                <div className='app-header-content'>
                    <div className="match-parent current-menu-item centered-content">
                        {this.props.selectedMenu}
                    </div>
                </div>
            }
            </header>
        )
    }
}