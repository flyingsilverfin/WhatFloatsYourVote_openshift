'use strict'

import React from 'react'
import reactCSS from 'reactcss'
import { SketchPicker } from 'react-color'

/*
    borrowed from react-color examples page

*/

class ColorPicker extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      displayColorPicker: false,
      color: {
        r: this.props.rgba[0],
        g: this.props.rgba[1],
        b: this.props.rgba[2],
        a: this.props.rgba[3]
      }
    }
  }

  handleClick() {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose() {
    this.setState({ displayColorPicker: false })
    this.props.onClose(this.state.color);
  };

  handleChange(color) {
    this.setState({ color: color.rgb })
  };

  handleChangeFinished(color, event) {
    this.props.onChangeComplete(color, event);
  }

  render() {

    const styles = reactCSS({
      'default': {
        color: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b }, ${ this.state.color.a })`,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'absolute',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });

    return (
      <div>
        <div style={ styles.swatch } onClick={ this.handleClick.bind(this) }>
          <div style={ styles.color } />
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose.bind(this) }/>
          <SketchPicker color={ this.state.color } onChange={ this.handleChange.bind(this)} />
        </div> : null }

      </div>
    )
  }
}

export default ColorPicker;