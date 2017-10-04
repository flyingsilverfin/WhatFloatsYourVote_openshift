import React, { PropTypes } from 'react';
import {httpGet} from '../helper.js';


// const Base = ({ children }) => (
//   <div className="full-height">
//     {children}
//   </div>
// );


export default class Base extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            data: null
        }
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        httpGet('/public/live', (response) => {
          let json = JSON.parse(response);
          console.log(json);
          if (json.status !== 'success') {
            console.error('Error getting data');
            return;
          }
          console.log(json.data);
          this.setState({
            data: json.data
          })
        });
    }

    render() {
      if (this.state.data === null) {
        return <div className="loading-screen"> Loading </div>
      } else { 
        return (
          <div className="full-height">
              {
                React.Children.map(
                    this.props.children, 
                        (child) =>
                        React.cloneElement(
                            child, 
                            {data: this.state.data,
                             reloadLiveData: this.getData.bind(this)
                            }
                          )
                )
              }
          </div>
        )
      }
    }

}

Base.propTypes = {
  children: PropTypes.object.isRequired
};
