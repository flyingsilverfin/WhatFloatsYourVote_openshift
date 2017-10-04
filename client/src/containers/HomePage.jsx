import React, { PropTypes } from 'react';
import TopicTiles from '../components/TopicTiles.jsx';
import Header from '../components/Header.jsx';

class HomePage extends React.Component {
    /**
     * Class constructor.
     */
    constructor(props) {
        super(props);

        // data is in this.props.data

        this.state = {
            activeTopic:null
        }
    };

    /*
        called by tiles to change the active topic    
    */
    activateTopic(topic) {
        this.setState({
            activeTopic:topic
        });
    }
    
    /*
        called by tiles to deactivate an active topic
    */
    deactivateTopic(topic) {
        this.setState({
            activeTopic:null
        })
    }

    render() {
        return (
        <div>
            <Header home={true} />
            <div className="home-not-header">
                <div id="home-text">
                    Tell me about...
                </div>
                <div className="topic-tiles-container">
                <TopicTiles
                    topics={this.props.data.topics}
                    activeTopic={this.state.activeTopic}
                    activateTopic={this.activateTopic.bind(this)}
                    deactivateTopic={this.deactivateTopic.bind(this)}
                />
                </div>
            </div>
        </div>
        );
    }
}

export default HomePage;