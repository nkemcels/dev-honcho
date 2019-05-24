import React from "react";

export const BootDropDown = ()=>{
    return (
        <div className="ui teal buttons massive">
            <button className="ui button massive">Save</button>
            <div
                role="listbox"
                aria-expanded="false"
                className="ui floating dropdown button icon"
                tabIndex="0"
            >
                <i aria-hidden="true" className="dropdown icon"></i>
                <div className="menu transition">
                    <div
                        style={{"pointer-events":"all"}}
                        role="option"
                        aria-checked="false"
                        aria-selected="true"
                        className="selected item"
                    >
                        <i aria-hidden="true" className="edit icon"></i>
                        <span className="text">Edit Post</span>
                    </div>
                    <div
                        style={{"pointer-events":"all"}}
                        role="option"
                        aria-checked="false"
                        aria-selected="false"
                        className="item"
                    >
                        <i aria-hidden="true" className="delete icon"></i>
                        <span className="text">Remove Post</span>
                    </div>
                    <div
                        style={{"pointer-events":"all"}}
                        role="option"
                        aria-checked="false"
                        aria-selected="false"
                        className="item"
                    >
                        <i aria-hidden="true" className="hide icon"></i>
                        <span className="text">Hide Post</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const BootSidebarMenu = (props)=>{
    return (
        <div id="wrapper">
            <div className="overlay"></div>
        
            {/*<!-- Sidebar -->*/}
            <nav className="navbar navbar-inverse navbar-fixed-top" id="sidebar-wrapper" role="navigation">
                <ul className="nav sidebar-nav">
                    <li className="sidebar-brand">
                        <a href="#">
                        Brand
                        </a>
                    </li>
                    <li>
                        <a href="#">Home</a>
                    </li>
                    <li>
                        <a href="#">About</a>
                    </li>
                    <li>
                        <a href="#">Events</a>
                    </li>
                    <li>
                        <a href="#">Team</a>
                    </li>
                    <li className="dropdown">
                    <a href="#" className="dropdown-toggle" data-toggle="dropdown">Works <span className="caret"></span></a>
                    <ul className="dropdown-menu" role="menu">
                        <li className="dropdown-header">Dropdown heading</li>
                        <li><a href="#">Action</a></li>
                        <li><a href="#">Another action</a></li>
                        <li><a href="#">Something else here</a></li>
                        <li><a href="#">Separated link</a></li>
                        <li><a href="#">One more separated link</a></li>
                    </ul>
                    </li>
                    <li>
                        <a href="#">Services</a>
                    </li>
                    <li>
                        <a href="#">Contact</a>
                    </li>
                    <li>
                        <a href="https://twitter.com/maridlcrmn">Follow me</a>
                    </li>
                </ul>
            </nav>

            {/*<!-- Page Content -->*/}
            <div id="page-content-wrapper">
                <button type="button" className="hamburger is-closed" data-toggle="offcanvas">
                    <span className="hamb-top"></span>
                    <span className="hamb-middle"></span>
                    <span className="hamb-bottom"></span>
                </button>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 col-lg-offset-2">
                            {props.children}                  
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}