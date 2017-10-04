import React from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';

import Header from '../components/Header.jsx';
import Topic from '../components/Topic.jsx';

// import {smooth_scroll_to, getCoords, capitalizeWord} from '../src/helper';


class TopicPage extends React.Component {

    constructor(props) {
        super(props);
        console.log("constructing Topic");
        let topic = this.props.routeParams.splat;
        this.state = {
            topic: topic,
            direction: null,
            activeParty: null,
            activeIssue:null
        };
    }

/*    
    componentWillReceiveProps(nextProps) {
        if (nextProps.topic === this.state.topic) {
            return;
        }
    }
*/

    render() {

        let data = this.props.data.topics[this.state.topic];
debugger
        return (
            <div className="topic-container">
                <Header
                    home={false}
                    logged_in={false}
                    />
                {/*<div className="header">
                    <Link to="/">
                        <div id="topic-header-home-button">
                            Home
                        </div>
                    </Link>
                    <div id="topic-header-text">
                        {this.state.topic}
                    </div> 
                    
                    What Floats Your Vote
                    
                </div>*/}
                <Topic 
                    name={this.state.topic}
                    displayName={data.displayName}
                    data={data.data}
                    parties={this.props.data.parties}
                    statusquo={data.statusquo}
                    questions={data.questions}
                    direction={this.state.direction}
                    activeParty={this.state.activeParty}
                    activeIssue={this.state.activeIssue}
                    optionSelected={this.optionSelected.bind(this)}
                    directionSelected={this.setDirection.bind(this)}
                />
            </div>
        )
    }

    setDirection(direction) {
        this.setState({direction: direction});

        /*let choicePane = this.refs['choice-pane'];
        choicePane = ReactDOM.findDOMNode(choicePane);
        
        $('html, body').animate({
            scrollTop: $(choicePane).offset().top
        }, 500);*/
    }

    optionSelected(party, issue) {
        console.log('party selected: ' + party + ', issue: ' + issue);
        this.setState({
            activeParty : party,
            activeIssue: issue
        });

        /*let issues = this.refs['issues-container'];
        issues = ReactDOM.findDOMNode(issues);
        
        $('html, body').animate({
            scrollTop: $(issues).offset().top
        }, 500)*/
        
    }
    
}

export default TopicPage;