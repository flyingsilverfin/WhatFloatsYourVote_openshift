import React, { PropTypes } from 'react';

const EditorStatusbar = ({
    status,
    modified,
    revertData,
    publishData
}) => 
<div className="flex-column">
    <div 
        className="flex-one statusbar-status center-horizontal">
        {status}
    </div>
    <div className="flex-one flex-row">
        <div 
            className={"statusbar-button statusbar-revert center-horizontal " + (modified ? 
            "statusbar-button-clickable" : "statusbar-button-unclickable")}
            onClick={modified ? revertData : null}>
            Delete
        </div>
        <div 
            className={"statusbar-button statusbar-publish center-horizontal " + (modified ? "statusbar-button-clickable" : "statusbar-button-unclickable")}
            onClick={modified ? publishData : null}>
            Publish
        </div>
    </div>
</div>

export default EditorStatusbar;