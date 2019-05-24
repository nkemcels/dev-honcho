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