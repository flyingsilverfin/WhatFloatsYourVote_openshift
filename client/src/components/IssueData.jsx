import React from 'react';


export default class IssueData extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let formattedFacts = this.props.facts.map(
            (fact, i) =>
                <li 
                    key={i}
                    className="issue-fact">
                    {fact}
                </li>
        );

        return (
            <div className="issue-facts-container">
                <ul>
                    {formattedFacts}
                </ul>
            </div>
        )
    }
}