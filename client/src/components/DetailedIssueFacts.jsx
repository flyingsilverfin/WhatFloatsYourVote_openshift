import React from 'react';


import IssueTitle from './IssueTitle.jsx';
import IssueData from './IssueData.jsx';

export default class DetailedIssuefacts extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        if (!this.props.activeParty || !this.props.activeIssue) {
            return (
                <div className="issues-no-party-selected">
                    Select a box above for more
                </div>
            )
        } else {
        
            return (
                <div className="issues-container">
                    <div className="issue-titles-container">
                        <IssueTitle issue={this.props.activeIssue} />
                    </div>
                    <IssueData facts={this.props.options[this.props.activeParty].issues[this.props.activeIssue].facts} />
                </div>
            )
        }
    }

}