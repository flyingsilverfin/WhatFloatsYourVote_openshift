import React from 'react';
//import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

// useful link: http://stackoverflow.com/questions/34660385/how-to-position-a-react-component-relative-to-its-parent

class SpectrumOption extends React.Component {


    constructor(props) {
        super(props);

        console.log(props);

        this.state = {
            styles: {
                top: 0,
                left: 0
            },
            selected: false
        };

    }


    render() {
        let bg;
        let transparency;
        let style = {}
        if (this.props.active === null) {
            transparency = 0.7;
        } else if (this.props.active) {
            transparency = 1.0;
        } else {
            transparency = 0.3;
        }

        if (this.props.parties[this.props.partyName] !== undefined) {
            bg = this.props.parties[this.props.partyName]["background-color"];
        } else {
            // default background color
            bg = [68,68,68];
        }

        if (this.props.selected) {
            style["border"] = "5px solid #600";
        } else {
            style["border"] = undefined;
        }
        

        let finalColor = "rgba(" + bg[0] + "," + bg[1] + "," + bg[2] + "," + transparency + ")";
        style["backgroundColor"] = finalColor;

        style = Object.assign(this.state.styles, style);

        return (
            <div ref="child" className="spectrum-option" style={style} onClick={this.props.onClick}>
                <div className="title">
                    {this.props.name}
                </div>
                <div className="spectrum-option-facts">
                    <ul>
                        {/*
                            this.props.facts.map(
                                (fact, i) =>
                                    <li>
                                        {fact}
                                    </li>
                            )

                        */}
                    </ul>
                </div>
            
        
        
            {/*
            <ReactCSSTransitionGroup transitionName="activate" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
                <div className={"spectrum-option-enter spectrum-option-deactivate-enter" + (this.props.active === null ? '' : (this.props.active ? ' spectrum-option-enter-activate' : ' spectrum-option-deactivate-enter-activate'))}>
                    <div className="title">
                        {this.props.name}
                    </div>
                    <div className="short">
                        {this.props.values.short}
                    </div>
                </div>
            </ReactCSSTransitionGroup>
            */}
            </div>
            
        );
    }
}

export default SpectrumOption;