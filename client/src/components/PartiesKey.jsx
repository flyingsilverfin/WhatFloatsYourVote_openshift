import React from 'react';

// useful link: http://stackoverflow.com/questions/34660385/how-to-position-a-react-component-relative-to-its-parent

export default class SpectrumOption extends React.Component {


    constructor(props) {
        super(props);
    }

    render() {

        let partyBlocks = Object.keys(this.props.parties).map(
            (party, i) =>
                <div style={{
                        padding: "20px 50px 0 0px"
                    }}
                >
                    <div style={{
                            width: "50px",
                            height: "1em",
                            backgroundColor: "rgba(" + this.props.parties[party]["background-color"].join(',') + ")",
                            display: "inline-block",
                            value: "",
                            verticalAlign: "middle"
                        }}
                    ></div>
                    <div style={{ display: "inline-block", marginLeft: "10px", verticalAlign: "middle"}}>
                        {party}
                    </div>
                </div>
        )

        return (
            <div className="parties-key">
                {partyBlocks}
            </div>
        )
    }
}