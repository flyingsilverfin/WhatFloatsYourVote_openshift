import React, { PropTypes } from 'react';
//import { Card, CardTitle } from 'material-ui/Card';

import {Link} from 'react-router';

const TopicTiles = ({
    topics,
    activeTopic,
    activateTopic,
    deactivateTopic
  }) => (
  <div>
      {
        Object.keys(topics).map((topic, index) =>
          <Link to={"/topic/" + topic} key={index}>
            <div className={"topic-tile" +
                            (activeTopic === topic ? " tile-active" : "")}
                  onMouseEnter={()=>activateTopic(topic)}
                  onMouseLeave={()=>deactivateTopic(topic)}
              >
                <div className="topic-tile-image-container" title={activeTopic}>
                {( () => {
                    if (activeTopic === topic) {
                          return <img className="tile-image" src={topics[topic].image}/>  
                    }
                }) () }
                </div>
                <div className="topic-tile-text">
        {topics[topic].displayName.length > 1 ? topics[topic].displayName[0].toUpperCase() + topics[topic].displayName.slice(1) : topics[topic].displayName.toUpperCase()}
                </div>
            </div>
        </Link>
        )}
  </div>
);

TopicTiles.propTypes = {
    topics: PropTypes.object.isRequired,
    //activeTopic: PropTypes.string.isRequired,     //can be null and nothing gets highlighted
    activateTopic: PropTypes.func.isRequired,
    deactivateTopic: PropTypes.func.isRequired
};

   
export default TopicTiles;
