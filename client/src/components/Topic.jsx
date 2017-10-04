import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';


import ChoicePane from './ChoicePane.jsx';
import DetailedIssueFacts from './DetailedIssueFacts.jsx';
import SpectrumPane from './SpectrumPane.jsx';
import PartiesKey from './PartiesKey.jsx';

import {smooth_scroll_to, getCoords, capitalizeWord} from '../helper';


let headingStyle = {"marginLeft": "7%", "fontSize":"1.3em",  "marginTop": "20px"};


const Topic = ({
    name,
    displayName,
    data,
    statusquo,
    questions,
    parties,
    direction,
    activeParty,
    activeIssue,
    optionSelected,
    directionSelected
  }) => (
    <div className="topic-container">
        {/* TODO <Header /> */ }
        <div className="topic-content">
            <div className="topic-description-container">
                <h2 style={{"textAlign":"center"}}> {capitalizeWord(displayName)}</h2>
                <u style={headingStyle}> Learn </u>
                <div className="topic-description">
                    <ol>
                    {
                        statusquo.map((status, i) =>
                            <li className="description-listitem" key={i}>
                                {status}
                            </li>
                        )
                    }
                    </ol>
                </div>
                <div style={headingStyle}>
                    <u >Choose</u>
                </div>
                <ChoicePane leftQuestion={questions.left} rightQuestion={questions.right} onSelect={directionSelected} />
            
            
                <div style={headingStyle}>
                    <u >Explore</u>
                    <PartiesKey parties={parties} />

                </div>
            </div>
            <SpectrumPane topic={name} currentValue={data.current} options={data.options} direction={direction} optionSelected={optionSelected} parties={parties}/>
        
            {/*<issues ref="issues-container" options={this.state.data.options} activeParty={this.state.activeParty} />*/}
            <DetailedIssueFacts options={data.options} activeParty={activeParty} activeIssue={activeIssue} />
        </div>
    </div>
  );


Topic.propTypes = {
    name: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    statusquo: PropTypes.array.isRequired,
    questions: PropTypes.object.isRequired,
    parties: PropTypes.object.isRequired,
    direction: PropTypes.string, //.isRequired,
    activeParty: PropTypes.string, //.isRequired,
    activeIssue: PropTypes.string, //.isRequired,
    optionSelected: PropTypes.func.isRequired,
    directionSelected: PropTypes.func.isRequired
};
    

export default Topic;