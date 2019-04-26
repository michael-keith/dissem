import React, { Component } from 'react'

import './Loading.css'

class Loading extends Component {

  render() {
    return <div className="loading">
      <div className="fa-3x">
        <i className="fas fa-circle-notch fa-spin"></i>
      </div>
    </div>
  }

}

export default Loading
