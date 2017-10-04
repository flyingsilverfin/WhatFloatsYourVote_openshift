import React from 'react';
import ReactDOM from 'react-dom';


class ChoicePane extends React.Component {

    constructor(props) {
        super(props);
        console.log('constructing ChoicePane');
    }

    leftClicked() {
        this.props.onSelect('left');
    }

    rightClicked() {
        this.props.onSelect('right');
    }

    render() {
        return ( 
            <div className="choice-pane">
                <ul>
                    <li>
                        <input className="choice-input" type="radio" id="f-option" name="selector" />
                        <label htmlFor="f-option" onClick={this.leftClicked.bind(this)}>
                            {this.props.leftQuestion}
                        </label>
                        
                        <div className="check"></div>
                    </li>
                    
                    <li>
                        <input className="choice-input" type="radio" id="s-option" name="selector" />
                        <label htmlFor="s-option" onClick={this.rightClicked.bind(this)}>
                            {this.props.rightQuestion}
                        </label>
                        
                        <div className="check"></div>
                    </li>
                </ul>
            
            {/*
                <label className="choice-question" id="left-choice" onClick={this.leftClicked.bind(this)}>
                    <input className="choice-button" type="radio" name="direction-choice" />
                    {this.props.leftQuestion}
                </label>
                <label className="choice-question" id="right-choice" onClick={this.rightClicked.bind(this)}>
                    <input className="choice-button" type="radio" name="direction-choice" />
                    {this.props.rightQuestion}
                </label>
            */}
                {/*
                <div className="choice-question">
                    {this.props.leftQuestion}
                    {this.props.rightQuestion}
                </div>
                <div className="choice-input-container">
                    <button className="choice-button" onClick={this.leftClicked.bind(this)}> &lt;- Less </button>
                    <button className="choice-button" onClick={this.rightClicked.bind(this)}> More -&gt; </button>
                </div>
                */}

            </div>
        )
    }

}

export default ChoicePane;