import React from 'react';
import ReactDOM from 'react-dom';
//import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import SpectrumOption from './SpectrumOption.jsx';
import ChoicePane from './ChoicePane.jsx';


let MARGIN = 10;

class SpectrumPane extends React.Component {

    constructor(props) {
        super(props);

        /*
            Props: props.topic, props.currentValue, props.options
        */
        this.state = {
            parties: null,
            issues: null,
            seed: 0,
            dividerPositionLeft: null,
            //direction: null,
            minHeight: 0,
            maxHeight: 0,
            spectrumPaneHeight: 0,
            optionsContainerStyle: {},
            selectedParty: null,
            selectedTopic: null          
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.topic === this.props.topic) {
            return;
        }
    }

/*
    WARNING: EACH PARTY MUST CONTAIN THE SAME issues!!!!
*/
    componentWillMount() {
        let parties = Object.keys(this.props.options);

        // TODO this can be improved...
        let issues;
        if (Object.keys(this.props.options).length == 0) {
            issues = []
        } else {
            issues = Object.keys(this.props.options[parties[0]].issues);
        }

        // this could be made a 'parties' property in the JSON
        // TODO
        // order in which parties should be rendered
        // for others use alphanumeric sorting
        let initial_order = ['Liberal-National Coalition', 'Labor', 'Green'];
        let parties_ordered = [];
        let parties_copy = parties.concat([]); // TODO proper way to do this?
        for (let party of initial_order) {
            let index = parties_copy.indexOf(party);
            if (parties_copy.indexOf(party) > 0) {
                parties_ordered.push(party);
                parties_copy.splice(index, 1);  // cut it out
            }
        }
        // parties_copy now only parties not in initial order
        parties_copy.sort();    //TODO how sort

        parties = parties_ordered.concat(parties_copy);



        this.setState({
            parties: parties,
            issues: issues,
            dividerPositionLeft: 100*(this.props.currentValue/10.0) //percentage from left
        });
    }

    render() {        
        debugger

        // the 'key' property now relies on each party having the same number of issues or they might not be unique
        let options = this.state.parties.map(
            (p, i) =>
                Object.keys(this.props.options[p].issues).map(
                (issue, j) =>
                    <SpectrumOption 
                        ref={p + "-" + issue}
                        name={issue} 
                        facts={this.props.options[p].issues[issue].facts}
                        value={this.props.options[p].issues[issue].current}
                        key={this.state.seed + i*(this.state.issues.length) + j}
                        onClick={function() {this.optionSelected(p, issue)}.bind(this)}
                        active={this.props.direction === null ? null : 
                                ((this.props.direction === 'left' && this.props.options[p].issues[issue].current <= this.props.currentValue)
                                || (this.props.direction === 'right' && this.props.options[p].issues[issue].current >= this.props.currentValue))? true : false}
                        parties={this.props.parties}
                        partyName={p}
                        topicName={issue}
                        selected={this.state.selectedParty === p && this.state.selectedTopic === issue}
                    />
            )
        );

        let dividerPosition = {
            'left': 100*(this.props.currentValue/10.0) + "%"
        };


        // these all get updated post render
        let dividerLabelPosition = {
            'left': this.state.dividerPositionLeft
        }


        let leftArrowStyle = {
            'right': this.state.dividerPositionLeft
        }
        /*if (this.props.direction === 'left') {
            leftArrowStyle['background-color'] = 'red';
        }*/

        let rightArrowStyle = {
            'left' : this.state.dividerPositionLeft
        }
        /*if (this.props.direction === 'right') {
            rightArrowStyle['background-color'] = 'red';
        }*/


        let spectrumPaneStyle = {
            'height' : this.state.spectrumPaneHeight
        }

        return (
            <div className="spectrum-pane-container-outer">
                {/* ChoicePane onSelect={this.setDirection.bind(this)} leftQuestion="Question left" rightQuestion="Question right" /> */}
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <div className="spectrum-pane-container">
                        <div id="label-container">
                            <div id="left-arrow" key={this.state.seed} ref="left-arrow" style={leftArrowStyle}>
                                <h2 className="inline slightly-larger-text">
                                    LESS
                                </h2> advocating
                            </div>
                            <div id="right-arrow" key={this.state.seed+1} ref="right-arrow" style={rightArrowStyle}>
                                <h2 className="inline slightly-larger-text">
                                    MORE
                                </h2> advocating
                            </div>                    
                            <div id="current-value-divider-label" key={this.state.seed+2} ref="divider-label" style={dividerLabelPosition}>
                                <h2 className="slightly-larger-text">
                                    Current State of Affairs
                                </h2>
                            </div>
                        </div>
                        <div ref="spectrumPane" className="spectrum-pane" style={spectrumPaneStyle}>
                            {/*<div className="overlay-container">
                                <ReactCSSTransitionGroup transitionName="overlay-slide" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
                                    <div ref="leftOverlay"
                                        style={{right: 100 - this.props.currentValue/10.0*100 + "%"}}
                                        className={'spectrum-overlay overlay-slide-enter ' + (this.state.direction === 'left' ? 'overlay-slide-enter-active' : '')}
                                        key={0}/>
                                    <div ref="rightOverlay"
                                        style={{left: this.props.currentValue/10.0*100 + "%"}}
                                        className={'spectrum-overlay overlay-slide-enter ' + (this.state.direction === 'right' ? 'overlay-slide-enter-active' : '')}
                                        key={1}/>
                                </ReactCSSTransitionGroup>
                            </div>
                            */}
                            
                            <div id="current-value-divider" key={this.state.seed+3} style={dividerPosition}> </div>
                            <div id="spectrum-options-container" style={this.state.optionsContainerStyle}>
                                {options}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    
    // fun fact: this is called after SpectrumOption's didMount (makes logical sense anyway)
    componentDidMount() {

        console.log('(SpectrumPane.componentDidMount)');

        window.addEventListener("resize", this.forceRedraw.bind(this));

        this.place();

        this.placeDividerLabels();
    }

    componentDidUpdate(prevProps, prevState) {
        // only want to redraw if certain state has changed
        if (prevState.seed != this.state.seed)
        {
            this.place();
        }
    }

    optionSelected(party, issue) {
        this.props.optionSelected(party, issue);
        this.setState({
            'selectedParty': party,
            'selectedTopic': issue
        });
    }

    /*setDirection(direction) {
        this.setState({direction: direction});
    }*/

    placeDividerLabels() {
        
        let dividerLabelRef = this.refs['divider-label'];
        let dividerLabelElement = ReactDOM.findDOMNode(dividerLabelRef);

        let parent = dividerLabelElement.parentElement;
        let parentWidth = parent.getBoundingClientRect().width;

        let boundingRect = dividerLabelElement.getBoundingClientRect();
        let width = boundingRect.width;
        let left = parentWidth * this.state.dividerPositionLeft / 100;

        let labelLeft = 1 + left - (width/2);
        console.log("Going to position divider label from left:" + labelLeft);
        dividerLabelElement.style.left = labelLeft + "px";

        let leftArrowRef = this.refs['left-arrow'];
        let rightArrowRef = this.refs['right-arrow'];
        let leftArrow = ReactDOM.findDOMNode(leftArrowRef);
        let rightArrow = ReactDOM.findDOMNode(rightArrowRef);

        console.log("leftArrow right endpoint: " + (labelLeft - 5));
        leftArrow.style.right = parentWidth - labelLeft + 5 + "px";
        rightArrow.style.left = labelLeft - 1 + width + 5 + "px";
    }
    

    forceRedraw() {
        let container = ReactDOM.findDOMNode(this.refs.spectrumPane);

        let containerWidth = container.getBoundingClientRect().width;
        let MIN_WIDTH = 900;
        if (containerWidth > 900) {
            this.setState({
               seed: Math.random() 
            });
        }
        
        this.placeDividerLabels();

    }

    place() {
        
        let cd = new CollisionDetector();

        let container = ReactDOM.findDOMNode(this.refs.spectrumPane);

        let containerWidth = container.getBoundingClientRect().width;
        let containerHeight = container.getBoundingClientRect().height;

        console.log('SpectrumPane height: ' + containerHeight);

        let i  = 0;

        // we're doing this CPS sort of styles
        // because setState does not occur immediately and we require the prior one to be placed before placing the next one
        // wow this the CPS actually works! Thank you compilers :o
        let f = (function(i, j, ilimit, jlimit, cH, cW, cd, func) {
            console.log('CPS - depth ' + i + ', ' + j);
            if (j === jlimit) {
                j = 0;
                i += 1;
            }
            // if finished (rolled over for the last time)
            if (i === ilimit) {
                this.setState({
                    spectrumPaneHeight: this.state.maxHeight - this.state.minHeight,
                    maxHeight: 0,   // reset so it shrinks again if not needed next resize
                    minHeight: 0,
                    optionsContainerStyle: {
                        transform: "translate(0px,"+-(this.state.minHeight+5)+"px)"
                    }
                });
                return;
            } else {
                console.log("placing: " + this.state.parties[i] + '-' + this.state.issues[j])
                this.placeItem(
                    this.refs[this.state.parties[i] + '-' + this.state.issues[j]],
                    cH, cW, cd,
                    function() {
                        func(i, j+1, ilimit, jlimit, cH, cW, cd, func);
                    }
                )
            }
        }).bind(this);

        f(0, 0, this.state.parties.length, this.state.issues.length, containerHeight, containerWidth, cd, f);

    }

    // takes ref, container height/width, and collision detector 
    // places optionin pane
    placeItem(ref, cHeight, cWidth, collisionDetector, callback) {


        let elem = ReactDOM.findDOMNode(ref);


        console.log('Placing item: ' + elem.innerHTML);


        let rect = elem.getBoundingClientRect();

        let left = rect.left;
        let width = rect.width;
        let height = rect.height;
        let top = rect.top;

        let toBeLeft = ((ref.props.value/10.0) * cWidth - width/2);

        let collisions = collisionDetector.collisions(toBeLeft, width);

        console.log('Collisions at given value: ');
        console.log(collisions);

        collisionDetector.insert(ref, toBeLeft, width);

        top = this.placeVertical(height, cHeight/2, collisions);

        if (top < this.state.minHeight) {
            this.setState({minHeight: top});
        } if (this.state.maxHeight < top + height) {
            this.setState({maxHeight: top+height});
        }

        ref.setState({
            styles: {
                top: top + "px" ,
                left: toBeLeft + "px"
            }
        }, callback);
    }

    placeVertical(height, middle, collisions) { 
        // calculate everything vertical with respect to the middle of container as if it were 0

        let lowest = 0;
        let highest = 0;

        let centered = collisions.length === 0; // if no collisions, center vertically!

        if (!centered) {
            for (let i = 0; i < collisions.length; i++) {
                let option = collisions[i];
                let elem = ReactDOM.findDOMNode(option);

                let rect = elem.getBoundingClientRect();
                // so it hasn't reendered yet so the bounding box isn't really up to date
                // doesn't matter for height, matters for top!
                // top should be set in state.styles.top = "valpx"

                let top = parseInt(option.state.styles.top.slice(0,-2));
                let _t = top - middle;
                let _b = _t + rect.height;

                let _c = rect.bottom - middle;

                if (_t < lowest) {
                    lowest = _t;
                }

                if (_b > highest) {
                    highest = _b
                }

            }

            // choose top if symmetrical, otherwise choose one closest to middle
            if (Math.abs(lowest) <= highest) {
                return lowest - height + middle - MARGIN;
            } else {
                return highest + middle + MARGIN;
            }
        } else {
            return middle - height/2;
        }

    }

}



// detects and returns collision on a line
// insert refs
class CollisionDetector {

    //sadly not using typescript :( next time..
    constructor() {
        this.taken = [];
    }

    insert(object, left, width) {

        let center = left + width/2;

        let toInsert = {
            object: object,
            left: left,
            right: left+width,
            center: center
        };

        // base case empty list insert at 0
        if (this.taken.length === 0) {
            this.taken.push(toInsert);
            return;
        }

        // could do this by binary search but too lazy
        let beforeIndex = 0;
        while (beforeIndex < this.taken.length && center > this.taken[beforeIndex].center) {
            beforeIndex++;
        }

        this.taken.splice(beforeIndex, 0, toInsert);

    }

    collisions(left, width) {
        
        let collidesWith = [];
        let right = left + width;

        for (let i = 0; i < this.taken.length; i++) {
            let item = this.taken[i];
            // if left or right endpoint in the span of the current item, add it to collision list
            if ((item.left <= left && left <= item.right) ||
                (item.left <= right && right <= item.right)) {
                      // detected collision
                      collidesWith.push(item.object);
            }
        }
        return collidesWith;
    }
}

export default SpectrumPane;